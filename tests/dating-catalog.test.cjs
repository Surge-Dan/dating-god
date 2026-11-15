const test = require('node:test');
const assert = require('node:assert/strict');
const catalog = require('../dating-god/assets/content.js');
const dialogue = require('../dating-god/assets/dialogue-data.js');
const engine = require('../dating-god/assets/engine.js');

const config = scene => ({ adult: true, scene, player: 'unspecified', presentation: 'any', avoid: [], seed: 7 });

test('published catalog contains 24 distinct activities and 32 original adult roles', () => {
  assert.equal(catalog.scenes.length, 24);
  assert.equal(catalog.roles.length, 32);
  assert.equal(new Set(catalog.scenes.map(scene => scene.activityId)).size, 24);
  assert.equal(new Set(catalog.roles.map(role => role.id)).size, 32);
  assert.equal(catalog.roles.filter(role => role.presentation === 'woman').length, 16);
  assert.equal(catalog.roles.filter(role => role.presentation === 'man').length, 16);
  assert.ok(catalog.roles.every(role => role.age >= 18 && role.age <= 55));
  for (const id of ['R01', 'R03', 'R04', 'R06', 'R07', 'R08', 'R11', 'R15']) assert.ok(catalog.roles.some(role => role.id === id));
  assert.equal(catalog.scenes.find(scene => scene.activityId === 'A01').id, 'S02');
  assert.equal(catalog.scenes.find(scene => scene.activityId === 'A02').id, 'S05');
  assert.equal(catalog.scenes.find(scene => scene.activityId === 'A11').id, 'S07');
});

test('every activity has usable metadata, six to eight authored nodes and unique physical choices', () => {
  const ids = new Map();
  for (const scene of catalog.scenes) {
    assert.ok(scene.category && scene.description && scene.pacing && scene.opening, scene.id);
    assert.ok(Number.isFinite(scene.duration) && scene.duration > 0, scene.id);
    assert.ok(Number.isFinite(scene.cost) && scene.cost >= 0, scene.id);
    assert.equal(typeof scene.alcohol, 'boolean');
    assert.equal(typeof scene.outdoor, 'boolean');
    assert.ok(Array.isArray(scene.requirements) && scene.requirements.length);
    const entries = Object.entries(scene.nodes);
    assert.ok(entries.length >= 6 && entries.length <= 8, `${scene.id} node count`);
    assert.ok(entries.every(([, actions]) => actions.length >= 2 && actions.length <= 4), `${scene.id} branch width`);
    const reachable = new Set(['start']);
    for (let pass = 0; pass < 9; pass++) for (const node of [...reachable]) for (const action of scene.nodes[node] || []) if (scene.nodes[action.to]) reachable.add(action.to);
    assert.equal(reachable.size, entries.length, `${scene.id} contains unreachable authored nodes`);
    const actions = entries.flatMap(([, items]) => items);
    assert.ok(actions.filter(action => action.patch || action.location).length >= 6, `${scene.id} physical state`);
    for (const action of actions) {
      assert.ok(Number.isFinite(action.minutes) && action.minutes >= 0, `${action.id} negative time`);
      assert.ok(Number.isFinite(action.cost) && action.cost >= 0, `${action.id} negative cost`);
      assert.ok(action.reply || action.voice, `${scene.id}/${action.id} missing authored response`);
      assert.ok(scene.nodes[action.to] || catalog.shared[action.to] || ['decision', 'timing', 'proposal'].includes(action.to), `${scene.id}/${action.id} broken target ${action.to}`);
      assert.ok(!ids.has(action.id), `${action.id} shared across activities`);
      ids.set(action.id, scene.id);
    }
  }
});

test('second stations declare fictional opening hours and block scheduled ticketed activities', () => {
  const scheduled=['A05','A06','A11','A12','A13','A14','A15','A16','A17','A18','A19','A20','A21','A24'];
  for(const scene of catalog.scenes){
    assert.equal(typeof scene.secondStationAllowed,'boolean',scene.id);
    assert.ok(Array.isArray(scene.openingHours)&&scene.openingHours.length===2,scene.id);
    const [start,end]=scene.openingHours;
    assert.ok(Number.isInteger(start)&&Number.isInteger(end)&&start>=0&&end<=24&&start<end,scene.id);
    assert.match(scene.scheduleNote,/虚构/);
    const [hour,minute]=scene.time.split(':').map(Number);
    assert.ok(hour*60+minute>=start*60&&hour*60+minute+scene.duration<=end*60,`${scene.id} starts outside its fictional hours`);
    if(scheduled.includes(scene.activityId)) assert.equal(scene.secondStationAllowed,false,scene.id);
  }
  assert.deepEqual(catalog.scenes.find(scene=>scene.id==='A04').openingHours,[17,24]);
  assert.deepEqual(catalog.scenes.find(scene=>scene.id==='A22').openingHours,[18,24]);
});

test('legacy dining actions retain their IDs without inventing earlier shared dates', () => {
  const meal=catalog.scenes.find(scene=>scene.id==='S05');
  const order=meal.nodes.start.find(action=>action.id==='order');
  const talk=meal.nodes.meal.find(action=>action.id==='meal');
  for(const action of [order,talk]) assert.doesNotMatch(action.label+action.reply,/上次|上回|以前|一群人/);
  assert.equal(order.to,'meal');
  assert.equal(talk.to,'connect');
});

test('each activity offers at least four women and four men with bounded interests', () => {
  for (const scene of catalog.scenes) {
    const matches = engine.match(config(scene.id));
    for (const gender of ['woman', 'man']) assert.ok(matches.filter(role => role.presentation === gender).length >= 4, `${scene.id}/${gender}`);
    for(const mode of Object.keys(dialogue.modes)) for(const player of ['woman','man']) assert.ok(engine.match({...config(scene.id),mode,player}).length, `${scene.id}/${mode}/${player} no role`);
  }
  for (const role of catalog.roles) {
    assert.ok(role.scenes.length >= 2 && role.scenes.length <= 14, `${role.id} interest coverage`);
    for (const key of ['goal', 'obligation', 'story', 'joke', 'next', 'greeting', 'listen', 'quiet', 'bio']) assert.ok(role[key]?.trim(), `${role.id}/${key}`);
    assert.ok(role.limit > 0);
    assert.ok(dialogue.profiles[role.id]?.voice && dialogue.profiles[role.id]?.initiative, role.id);
  }
  for (const key of ['goal', 'obligation', 'story', 'joke', 'next']) assert.equal(new Set(catalog.roles.map(role => role[key])).size, 32, `${key} must differ between people`);
});

test('catalog expansion is idempotent and physical activity paths reach their final decision', () => {
  require('../dating-god/assets/expanded-content.js').extend(catalog);
  assert.equal(catalog.scenes.length,24);
  assert.equal(catalog.roles.length,32);
  for(const scene of catalog.scenes.filter(item=>item.id.startsWith('A'))) {
    let run=engine.createRun(config(scene.id),engine.match(config(scene.id))[0].id);
    for(let step=0;step<6;step++){
      const action=engine.choices(run).find(item=>item.id!=='leave');
      assert.ok(action,`${scene.id}/${run.node}`);
      run=engine.act(run,action.id,run.events.length);
    }
    assert.equal(run.node,'decision',`${scene.id} truncated activity`);
    assert.ok(run.activityState?.progress,`${scene.id} missing physical progress`);
  }
});

test('all released role/activity pairs have an executable activity-to-decision path', () => {
  for (const scene of catalog.scenes) for (const role of engine.match(config(scene.id))) {
    let run = engine.createRun(config(scene.id), role.id);
    let steps = 0;
    while (scene.nodes[run.node] && run.phase === 'live' && steps < 12) {
      const options = engine.choices(run).filter(action => action.id !== 'leave');
      const action = options[0];
      assert.ok(action, `${scene.id}/${role.id}/${run.node}`);
      const priorCount = run.events.length;
      run = engine.act(run, action.id, priorCount);
      assert.equal(run.events.length, priorCount + 1);
      steps++;
    }
    assert.ok(steps >= (scene.id.startsWith('S')?2:6) && steps <= 8, `${scene.id}/${role.id}: incomplete physical activity (${steps})`);
    assert.ok(['decision', 'connect', 'timing', 'proposal'].includes(run.node) || run.phase === 'ended', `${scene.id}/${role.id}: no exit from activity`);
    assert.equal(engine.end(run).phase, 'ended');
  }
});

test('every authored activity branch applies its physical state and can reach a closing decision', () => {
  for(const scene of catalog.scenes){
    const role=engine.match(config(scene.id))[0];
    const queue=[engine.createRun(config(scene.id),role.id)];
    let endings=0;
    while(queue.length){
      const run=queue.pop();
      if(!scene.nodes[run.node]){endings++;continue;}
      assert.equal(run.phase,'live',`${scene.id}/${run.node} ended before completing authored activity`);
      const actions=engine.choices(run).filter(action=>action.id!=='leave');
      assert.ok(actions.length,`${scene.id}/${run.node} has no compatible action`);
      for(const action of actions){
        const next=engine.act(run,action.id,run.events.length);
        for(const [key,value] of Object.entries(action.patch||{})) assert.deepEqual(next.activityState[key],value,`${action.id}/${key}`);
        assert.ok(next.events.length<12,`${scene.id} contains an unbounded activity loop`);
        queue.push(next);
      }
    }
    assert.ok(endings>=2,scene.id);
  }
});

test('48 original conditional examples cover all 24 activities and four modes', () => {
  assert.equal(dialogue.examples.length, 48);
  assert.equal(Object.keys(dialogue.profiles).length, 32);
  assert.deepEqual(Object.keys(dialogue.modes).sort(), ['hard', 'mellow', 'spark', 'tension']);
  assert.equal(new Set(dialogue.examples.map(example => example.user + example.reply)).size, 48);
  for (const scene of catalog.scenes) assert.ok(dialogue.examples.some(example => example.scene === scene.id), scene.id);
  assert.ok(dialogue.examples.every(example => example.user && example.reply && (example.requires || example.condition) && example.style));
});
