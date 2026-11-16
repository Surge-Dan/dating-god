const test=require('node:test');const assert=require('node:assert/strict');const ui=require('../dating-god/assets/preparation-ui.js');
test('preparation preserves unknowns and creates a minimal transport config',()=>{const state=ui.create();state.brief='怕聊成面试';state.focus='接话';const config=ui.compile(state,{scene:'S02',budget:100,timeBudget:60});assert.equal(config.preparation.focus,'接话');assert.equal(config.partnerSpec.interaction.expression,'unknown');assert.equal(config.preparation.brief,'怕聊成面试');assert.ok(config.preparation.unknowns.length);});
test('preparation import excludes conversations and rejects invalid data',()=>{const s=ui.create();s.brief='周末';const restored=ui.importConfig(ui.exportConfig(s));assert.equal(restored.brief,'周末');assert.throws(()=>ui.importConfig('{"schemaVersion":999}'));assert.throws(()=>ui.importConfig(JSON.stringify({...s,chat:['秘密']})));});

test('scene cost and duration never reuse the whole date allowance',()=>{const s=ui.create();s.template='tennis';const c=ui.compile(s,{budget:300,timeBudget:180});assert.equal(c.sceneSpec.budget,undefined);assert.equal(c.sceneSpec.duration,undefined);});

test('import rejects lock paths outside editable model fields',()=>{const s=ui.create();s.locks=['__proto__.polluted'];assert.throws(()=>ui.importConfig(ui.exportConfig(s)));});
