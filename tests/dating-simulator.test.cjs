const test = require("node:test");
const assert = require("node:assert/strict");
const content = require("../dating-simulator/assets/content.js");
const engine = require("../dating-simulator/assets/engine.js");
const report = require("../dating-simulator/assets/report.js");

const config = (scene = "S02", extra = {}) => ({
  adult: true, scene, presentation: "any", player: "unspecified", avoid: [], seed: 7, ...extra,
});
const setup = (scene, role, extra) => engine.createRun(config(scene, extra), role);
const move = (run, action) => engine.act(run, action, run.events.length);
const available = (run) => engine.choices(run).map((choice) => choice.id);

test("three released scenes each offer every supported presentation", () => {
  assert.equal(content.roles.length, 8);
  for (const scene of content.scenes) {
    for (const presentation of ["woman", "man", "nonbinary"]) {
      const matches = engine.match(config(scene.id, { presentation }));
      assert.ok(matches.length, `${scene.id} ${presentation}`);
      assert.ok(matches.every((role) => role.presentation === presentation));
    }
  }
  assert.equal(engine.match(config("S02", { adult: false })).length, 0);
  assert.throws(() => setup("S05", "R01"));
  assert.equal(engine.match(config("locked-out")).length, 0);
});

test("hard topic exclusions remove actions without blocking the scene", () => {
  let run = setup("S05", "R07", { avoid: ["relationship"] });
  run = move(run, "order");
  run = move(run, "meal");
  assert.ok(!available(run).includes("define"));
  assert.ok(available(run).includes("keep-light"));
  assert.equal(run.events.some((event) => event.tags.includes("relationship")), false);
});

test("same opening branches into different locations and opportunities", () => {
  const run = setup("S02", "R01");
  const wait = move(run, "wait");
  const walk = move(run, "walk");
  assert.notEqual(wait.location, walk.location);
  assert.notDeepEqual(available(wait), available(walk));
  assert.equal(run.events.length, 0);
});

test("same action gives distinct behaviors, with time and consent preserved", () => {
  let lin = setup("S02", "R01");
  let gu = setup("S02", "R06");
  for (const action of ["walk", "alley", "own-story"]) {
    lin = move(lin, action);
    gu = move(gu, action);
  }
  const refusal = move(lin, "stay");
  assert.ok(refusal.closed.includes("stay"));
  assert.ok(!available(refusal).includes("stay"));
  assert.ok(!available(refusal).includes("linger"));
  assert.equal(refusal.agreement, null);
  assert.match(refusal.events.at(-1).reply, /相机/);
  assert.notEqual(move(gu, "stay").events.at(-1).reply, refusal.events.at(-1).reply);
  assert.equal(engine.act(refusal, "stay", refusal.events.length), refusal);
});

test("confirmed next meeting requires a role proposal and the user's separate confirmation", () => {
  let run = setup("S02", "R01");
  for (const action of ["wait", "window", "own-story", "ask-again"]) run = move(run, action);
  assert.equal(run.agreement, null);
  assert.ok(run.proposal);
  assert.equal(move(run, "leave").agreement, null);
  const done = move(run, "confirm");
  assert.equal(done.phase, "ended");
  assert.equal(done.agreement, run.proposal);
});

test("repeat requests, pause, and independent runs leave state consistent", () => {
  const initial = setup("S02", "R01");
  const advanced = move(initial, "walk");
  assert.equal(engine.act(advanced, "alley", 0), advanced);
  const paused = engine.pause(advanced);
  assert.equal(move(paused, "alley"), paused);
  assert.equal(engine.resume(paused).elapsed, advanced.elapsed);
  assert.equal(setup("S02", "R01").events.length, 0);
  assert.equal(engine.end(advanced).phase, "ended");
});

test("replay restores the prefix without mutating the completed original", () => {
  let original = setup("S02", "R01");
  for (const action of ["walk", "alley", "own-story", "stay", "leave"]) original = move(original, action);
  const branch = engine.replay(original, 4);
  assert.deepEqual(branch.events, original.events.slice(0, 4));
  assert.ok(branch.closed.includes("stay"));
  const alternative = move(branch, "ask-again");
  assert.ok(alternative.proposal);
  assert.equal(original.agreement, null);
  assert.equal(original.events.at(-1).action, "leave");
});

test("reports escape user data and only include opted-in and confirmed reflection", () => {
  let run = setup("S07", "R08");
  run = engine.end(move(run, "repair"));
  const draft = {
    selected: 0, note: "<img src=x onerror=alert(1)>", accepted: "我想先试一个小动作",
    expectation: "一条只留给自己的期待", includeNote: false,
  };
  const html = report.html(run, null, draft);
  assert.doesNotMatch(html, /onerror|我想先试一个小动作|陈诺/);
  assert.doesNotMatch(html, /一条只留给自己的期待/);
  assert.match(html, /杯沿/);
  assert.equal(report.card(run, draft), null);
  const approved = { ...draft, confirmed: true, includeNote: true, includeExpectation: true };
  const approvedHtml = report.html(run, null, approved);
  assert.match(approvedHtml, /&lt;img/);
  assert.match(approvedHtml, /一条只留给自己的期待/);
  assert.doesNotMatch(approvedHtml, /<img src=x/);
  assert.match(report.card(run, approved), /一次虚构约会后的发现/);
});

test("early exit without an event cannot fabricate report evidence", () => {
  const run = engine.end(setup("S02", "R01"));
  assert.equal(run.events.length, 0);
  assert.match(report.html(run, null, { selected: 0 }), /没有可引用的互动/);
  assert.equal(report.card(run, { confirmed: true, accepted: "   " }), null);
});

test("a character can leave and a declined next date stays closed", () => {
  let run = setup("S05", "R07");
  for (const action of ["order", "menu", "keep-light"]) run = move(run, action);
  const refuses = move(run, "ask-again");
  assert.ok(refuses.closed.includes("ask-again"));
  assert.ok(!available(refuses).includes("ask-again"));
  assert.equal(refuses.agreement, null);
  const leaves = move(run, "stay");
  assert.equal(leaves.phase, "ended");
});

test("a bounded walk and a role's deadline both end a scene", () => {
  let walk = setup("S07", "R04");
  for (const action of ["repair", "two-cups", "keep-light", "stay", "stroll"]) walk = move(walk, action);
  assert.equal(walk.phase, "ended");
  assert.equal(walk.location, "场地附近的公共路口");
  let deadline = setup("S02", "R06");
  for (const action of ["wait", "window", "own-story", "linger"]) deadline = move(deadline, action);
  assert.equal(deadline.phase, "ended");
  assert.equal(deadline.elapsed, 38);
});

test("dialogue observes work exclusions and does not invent a route", () => {
  let run = setup("S05", "R07", { avoid: ["work"] });
  for (const action of ["order", "meal", "keep-light", "stay"]) run = move(run, action);
  assert.doesNotMatch(run.events.map((item) => item.reply).join(""), /排练|谱子/);
  let indoors = setup("S02", "R01");
  for (const action of ["wait", "seat", "keep-light", "leave"]) indoors = move(indoors, action);
  assert.doesNotMatch(indoors.events.map((item) => item.reply).join(""), /前面那段路|今天那段路/);
});

test("skipping personal reflection leaves a question instead of an inferred need", () => {
  const run = engine.end(move(setup("S07", "R08"), "repair"));
  const html = report.html(run, null, { selected: 0 });
  assert.doesNotMatch(html, /下次可试的小动作|我喜欢有人和我一起/);
  assert.match(html, /这一刻，你在意的是/);
});

test("a share card rejects copied dialogue, including dialogue from a replay", () => {
  const original = engine.end(move(setup("S02", "R01"), "walk"));
  const branch = engine.end(move(engine.replay(original, 0), "wait"));
  for (const event of [...original.events, ...branch.events]) {
    const draft = { selected: 0, confirmed: true, accepted: `「${event.reply}」` };
    assert.equal(report.card(original, draft, branch), null);
  }
});

test("ending a replay before making another choice still records the ending", () => {
  const original = engine.end(move(setup("S02", "R01"), "walk"));
  const branch = engine.end(engine.replay(original, 0));
  assert.match(report.html(original, branch), /实际重演/);
  assert.equal(branch.events.length, 0);
});

test("all released role and scene pairs support confirmed plans and a complete no-plan ending", () => {
  let pairs = 0;
  for (const scene of content.scenes) {
    for (const role of engine.match(config(scene.id))) {
      pairs++;
      const initial = setup(scene.id, role.id);
      const pending = [initial];
      const outcomes = new Set();
      while (pending.length) {
        const current = pending.pop();
        assert.ok(current.elapsed <= role.limit);
        assert.ok(current.events.length <= 10);
        if (current.phase === "ended") {
          outcomes.add(Boolean(current.agreement));
          continue;
        }
        assert.ok(available(current).includes("leave"));
        for (const id of available(current)) {
          const next = move(current, id);
          assert.notEqual(next, current);
          assert.ok(next.events.at(-1).reply.trim());
          pending.push(next);
        }
      }
      assert.deepEqual(outcomes, new Set([true, false]), `${role.id}×${scene.id}`);
    }
  }
  assert.equal(pairs, 15);
});
