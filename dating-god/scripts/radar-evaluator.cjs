'use strict';

const { randomUUID } = require('node:crypto');
const clone = value => JSON.parse(JSON.stringify(value));

function createRadarEvaluator(options = {}) {
  const rules = options.rules || require('../assets/radar-core.js');
  const quota = options.quota || { used: 0, limit: options.limit ?? 40 };
  const tasks = new Map();
  const keys = new Map();
  const deleted = new Set();
  const queue = [];
  let closed = false;
  let active = 0;
  const usage = { requests: 0, succeeded: 0, failed: 0, cancelled: 0, durationMs: 0, inputTokens: null, outputTokens: null, totalTokens: null, usageResponses: 0 };

  function publicTask({ snapshot, controller, ...task }) { return clone(task); }
  function state() { return { tasks: [...tasks.values()].map(publicTask), quota: clone(quota), usage: clone(usage) }; }
  function account(tokens) {
    let known = false;
    for (const key of ['inputTokens', 'outputTokens', 'totalTokens']) {
      if (Number.isInteger(tokens?.[key]) && tokens[key] >= 0) {
        usage[key] = (usage[key] ?? 0) + tokens[key];
        known = true;
      }
    }
    if (known) usage.usageResponses++;
    options.onUsage?.(tokens || {});
  }

  function pump() {
    if (closed || active || !queue.length) return;
    const task = queue.shift();
    if (!tasks.has(task.id)) return pump();
    if (quota.used >= quota.limit) {
      task.status = 'skipped';
      task.coverage.semantic = 'quota_exceeded';
      task.error = '评估请求额度已用完，本回合语义检查未完成。';
      return pump();
    }
    active++;
    quota.used++;
    usage.requests++;
    options.onAttempt?.();
    task.status = 'running';
    const start = performance.now();
    Promise.resolve().then(() => options.request(task.snapshot, task.coverage.rules, task.controller.signal, account))
      .then(result => {
        if (result?.usage) account(result.usage);
        usage.succeeded++;
        options.onFinish?.('succeeded');
        if (!tasks.has(task.id) || task.controller.signal.aborted) return;
        const validated = rules.validateCandidates(result?.candidates || [], task.snapshot, task.coverage.rules);
        const additions = (validated.accepted || []).map(card => ({
          ...card,
          executionStatus: task.snapshot.events.find(event => event.id === card.eventId)?.status,
        }));
        for (const card of additions) {
          const previous = task.cards.find(item => item.id === card.id);
          if (!previous) task.cards.push(card);
          else previous.ruleIds = [...new Set([...(previous.ruleIds || []), ...(card.ruleIds || [])])];
        }
        task.status = validated.rejected?.length ? 'partial' : 'complete';
        task.coverage.semantic = task.status;
        task.coverage.rejected = (validated.rejected || []).map(rejected => ({ reason: rejected.reason }));
      })
      .catch(error => {
        if (task.controller.signal.aborted) { usage.cancelled++; options.onFinish?.('cancelled'); return; }
        usage.failed++;
        options.onFinish?.('failed');
        if (tasks.has(task.id)) {
          task.status = 'failed';
          task.coverage.semantic = 'failed';
          task.error = '提示检查未完成，可手动重试。';
          task.coverage.failure = error.code || 'EVALUATION_FAILED';
        }
      })
      .finally(() => {
        usage.durationMs += Math.max(0, Math.round(performance.now() - start));
        active--;
        pump();
      });
  }

  function enqueue(input, { preflight = false, retry = false, semantic = true } = {}) {
    if (closed) throw Error('Evaluator closed');
    if (deleted.has(input.eventId)) return { eventId: input.eventId, status: 'cancelled', cards: [], coverage: { semantic: 'deleted' } };
    const key = `${preflight ? 'draft' : 'event'}:${input.eventId}`;
    if (!retry && keys.has(key) && tasks.has(keys.get(key))) return publicTask(tasks.get(keys.get(key)));
    const snapshot = clone(input);
    const selected = rules.retrieveRules(snapshot, { limit: 12 });
    const id = randomUUID();
    const task = {
      id, eventId: input.eventId, branchId: input.branchId, status: 'queued', preflight,
      cards: preflight ? [] : rules.detectActionReminders(snapshot),
      coverage: { rules: selected, ruleIds: selected.map(rule => rule.id || rule.ruleId), structural: true, semantic: semantic ? 'pending' : 'not_applicable', scope: 'retrieved_related_rules' },
      snapshot, controller: new AbortController(),
    };
    tasks.set(id, task);
    keys.set(key, id);
    if (semantic) {
      if (queue.length >= 8) {
        task.status = 'skipped';
        task.coverage.semantic = 'queue_full';
        task.error = '提示检查队列已满，本回合未检查。';
      } else { queue.push(task); pump(); }
    } else task.status = 'complete';
    return publicTask(task);
  }

  function remove(eventId) {
    if (eventId) deleted.add(eventId);
    for (const [id, task] of tasks) {
      if (!eventId || task.eventId === eventId) {
        deleted.add(task.eventId);
        task.controller.abort();
        tasks.delete(id);
      }
    }
    for (const [key, id] of keys) if (!tasks.has(id)) keys.delete(key);
  }

  return {
    enqueue, state, snapshot: id => clone(tasks.get(id)?.snapshot),
    retry(id) {
      const task = tasks.get(id);
      if (!task || !['failed', 'partial', 'skipped'].includes(task.status)) throw Error('Task is not retryable');
      // Replace the previous attempt rather than retaining a duplicate event card.
      tasks.delete(id);
      return enqueue(task.snapshot, { retry: true, preflight: task.preflight });
    },
    remove,
    close() { closed = true; remove(); },
  };
}

module.exports = { createRadarEvaluator };
