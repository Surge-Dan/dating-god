const test=require('node:test');
const assert=require('node:assert/strict');
const practice=require('../dating-god/assets/practice-scenarios.js');

test('natural-ending practice changes the partner response and next beat by choice',()=>{
  const scenario=practice.get('natural-close-v1');
  assert.ok(scenario);
  const accept=practice.choose(scenario.id,'start','accept');
  const pressure=practice.choose(scenario.id,'start','pressure');
  const express=practice.choose(scenario.id,'start','express');
  assert.notEqual(accept.nextNode,pressure.nextNode);
  assert.notEqual(pressure.reply,accept.reply);
  assert.match(pressure.reply,/今天真得走/);
  assert.ok(express.reply);
  assert.ok(practice.get(scenario.id).nodes[accept.nextNode].choices.length>0);
});

test('practice choices reject unknown scenario, node, and action IDs',()=>{
  assert.equal(practice.choose('missing','start','accept'),null);
  assert.equal(practice.choose('natural-close-v1','missing','accept'),null);
  assert.equal(practice.choose('natural-close-v1','start','not-an-action'),null);
});
