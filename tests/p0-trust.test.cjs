'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createDialogueCore } = require('../dating-god/scripts/dialogue-core.cjs');
const engine = require('../dating-god/assets/engine.js');
const content = require('../dating-god/assets/content.js');
const report = require('../dating-god/assets/report.js');
const host = require('../dating-god/scripts/host-session.cjs');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const cfg = { adult:true, scene:'S02', player:'man', presentation:'woman', seed:7, mode:'spark', radarEnabled:false };
const provider = { apiKey:'test', model:'test-model', endpoint:'http://127.0.0.1:9/v1/chat/completions', timeoutMs:50 };
function okJson(value) {
  return { ok:true, body:{ getReader() { let sent=false; return { read:async()=>sent?{done:true}:(sent=true,{done:false,value:Buffer.from(JSON.stringify(value))}) }; } } };
}
const turnPayload = (reply='我在听，你接着说。') => ({ choices:[{ finish_reason:'stop', message:{ content:JSON.stringify({reply,detail:'',actionId:null}) } }], usage:{} });

test('D1: a late cancel does not abort a newer pending turn', async t => {
  let calls = 0;
  let release;
  const core = createDialogueCore({ provider:{ ...provider, timeoutMs:5000 } });
  t.after(()=>core.close());
  const realFetch = global.fetch;
  global.fetch = async () => {
    calls++;
    if (calls===1) throw Error('provider down');
    return new Promise(resolve=>{ release=()=>resolve(okJson(turnPayload())); });
  };
  t.after(()=>{ global.fetch=realFetch; });
  const opened = await core.open({ config:cfg, roleId:'R01' });
  const id = opened.sessionId;
  await assert.rejects(core.turn({ sessionId:id, version:0, requestId:'A', text:'第一句' }));
  const second = core.turn({ sessionId:id, version:0, requestId:'B', text:'第二句' });
  await sleep(5);
  const cancel = await core.control({ sessionId:id, command:'cancel', requestId:'A' });
  assert.equal(cancel.committed, false);
  release();
  const done = await second;
  assert.equal(done.version, 1);
  assert.equal(done.run.events.at(-1).label, '第二句');
});

test('D2: branch activity refreshes the whole session family TTL', async t => {
  const core = createDialogueCore({ provider });
  t.after(()=>core.close());
  const opened = await core.open({ config:cfg, roleId:'R01' });
  const id = opened.sessionId;
  await core.turn({ sessionId:id, version:0, requestId:'b0', text:'别拍我' });
  await core.control({ sessionId:id, command:'end' });
  await sleep(150);
  const branch = await core.control({ sessionId:id, command:'replay', index:0 });
  assert.ok(branch.sessionId);
  await sleep(100);
  const status = await core.control({ sessionId:branch.sessionId, command:'status' });
  assert.equal(status.sessionId, branch.sessionId);
  const original = await core.control({ sessionId:id, command:'status' });
  assert.equal(original.sessionId, id);
});

test('D9: radar stays opt-in on both tracks and web turns share the 200-turn limit', async t => {
  const core = createDialogueCore({ provider });
  t.after(()=>core.close());
  const opened = await core.open({ config:{...cfg, radarEnabled:undefined}, roleId:'R01' });
  assert.equal(opened.radar.enabled, false);
  const hostState = host.dispatch(null, 'start', { config:{ adult:true, scene:'S02', player:'man', presentation:'woman', seed:7 } });
  assert.equal(hostState.state.run.radarEnabled, false);
  const hostRadar = host.dispatch(null, 'start', { config:{ adult:true, scene:'S02', player:'man', presentation:'woman', seed:7, radarEnabled:true } });
  assert.equal(hostRadar.state.run.radarEnabled, true);
  await core.control({ sessionId:opened.sessionId, command:'discard' });
  const quiet = await core.open({ config:cfg, roleId:'R01' });
  const id = quiet.sessionId;
  let version = 0;
  for (let n=0;n<200;n++) {
    const result = await core.turn({ sessionId:id, version, requestId:'b'+n, text:'别拍我' });
    version = result.version;
  }
  await assert.rejects(core.turn({ sessionId:id, version, requestId:'overflow', text:'别拍我' }), /200回合/);
});

test('D4: a timed-out action records actual minutes instead of a full completion', () => {
  const scene = content.scenes.find(item=>item.id==='S02');
  const old = scene.nodes.start;
  scene.nodes.start = [...old, { id:'test-long-walk', label:'出去走十分钟', minutes:10, reply:'好' }];
  try {
    const run = engine.createRun({ adult:true, scene:'S02', player:'man', presentation:'woman', seed:1, budget:1000 }, 'R01');
    const near = { ...run, elapsed: run.limit - 5 };
    const done = engine.act(near, 'test-long-walk', 0);
    assert.equal(done.phase, 'ended');
    assert.equal(done.elapsed, near.limit);
    assert.equal(done.elapsed - near.elapsed, 5);
    assert.match(done.events.at(-1).effect, /实际相处5分钟/);
    assert.match(done.events.at(-1).effect, /提前散场/);
  } finally { scene.nodes.start = old; }
});

test('D5: second-station events carry accurate execution status', () => {
  const target = engine.sceneById('S07');
  const oldDuration=target.duration, oldAllowed=target.secondStationAllowed, oldHours=target.openingHours;
  target.duration=5; target.secondStationAllowed=true; target.openingHours=[6,24];
  try {
    let run = engine.createRun({ adult:true, scene:'S02', player:'man', presentation:'woman', seed:1, budget:10000 }, 'R01');
    for (let n=0;n<2;n++) run = engine.act(run, engine.choices(run).find(a=>a.id!=='leave').id, run.events.length);
    const proposal = engine.act(run, 'station:S07', run.events.length);
    const declined = engine.act(proposal, 'station-cancel', proposal.events.length);
    assert.equal(declined.events.at(-1).executionStatus, 'cancelled');
    const confirmed = engine.act(proposal, 'station-confirm', proposal.events.length);
    assert.equal(confirmed.events.at(-1).executionStatus, 'executed');
  } finally { target.duration=oldDuration; target.secondStationAllowed=oldAllowed; target.openingHours=oldHours; }
});

test('D7: offline and host exports default to summary and require includeFull for transcripts', () => {
  let run = engine.createRun({ adult:true, scene:'S02', player:'man', presentation:'woman', seed:7 }, 'R01');
  run = engine.act(run, engine.choices(run).find(a=>a.id!=='leave').id, 0);
  run = engine.end(run);
  const label = run.events[0].label;
  assert.ok(!report.html(run, null, {}).includes(label));
  assert.ok(report.html(run, null, { includeFull:true }).includes(label));

  const started = host.dispatch(null, 'start', { config:{ adult:true, scene:'S02', player:'man', presentation:'woman', seed:7 } }).state;
  const actionId = engine.choices(started.run).find(a=>a.id!=='leave'&&a.type!=='station').id;
  const prepared = host.dispatch(started, 'prepare', { version:0, requestId:'q1', actionId });
  const committed = prepared.view.committed ? prepared : host.dispatch(prepared.state, 'commit', { version:0, requestId:'q1', result:{ reply:'好，我听到了。', detail:'', actionId:null } });
  const ended = host.dispatch(committed.state, 'control', { version:committed.state.version, command:'end' }).state;
  const text = ended.run.events[0].label;
  assert.ok(!host.dispatch(ended, 'export', {}).view.html.includes(text));
  assert.ok(host.dispatch(ended, 'export', { includeFull:true }).view.html.includes(text));
});
