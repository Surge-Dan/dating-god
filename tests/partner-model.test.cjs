const test = require('node:test');
const assert = require('node:assert/strict');
const m = require('../dating-god/assets/partner-model.js');
test('unknown defaults are neutral and appearance never changes response or consent',()=>{
 const a=m.build({}); const b=m.build({appearance:{hairLength:'long',glasses:true}});
 assert.deepEqual(m.distribution(a,{}),m.distribution(b,{}));
 assert.equal(a.interaction.expression,'unknown'); assert.ok(Object.isFrozen(a));
 assert.deepEqual(m.distribution(a,{consentRequired:true}).probabilities,{brief:0,elaborate:0,ask:0,clarify:1,disagree:0,propose:0,refuse:0,end:0});
});
test('validation rejects unknown keys, invalid tags, unsafe data and versions',()=>{
 assert.equal(m.validate({conditions:{hardNo:['不去第二站']}}).valid,false);
 assert.throws(()=>m.importConfig('{"conditions":{"hardNo":["不去第二站"]}}'));
 for(const x of [{systemPrompt:'x'},{appearance:{hairLength:'magic'}},{schemaVersion:99},{name:'https://evil.test'},{conditions:{budget:-1}}]) assert.equal(m.validate(x).valid,false);
 assert.throws(()=>m.importConfig('{"__proto__":{"polluted":true}}'));
 const p=m.build({name:'周末对象',lifestyle:{interests:['tennis','books']}});
 assert.deepEqual(m.importConfig(m.exportConfig(p)),p);
 assert.equal(m.build({lifestyle:{interests:['books','tennis']}}).fingerprint,m.build({lifestyle:{interests:['tennis','books']}}).fingerprint);
});
test('related traits and current facts alter normalized distributions',()=>{
 const a=m.build({interaction:{expression:'reserved'}}),b=m.build({interaction:{expression:'outgoing'}});
 assert.ok(m.distribution(a,{}).probabilities.brief>m.distribution(b,{}).probabilities.brief);
 const d=m.distribution(a,{topicRelevant:true}); assert.ok(d.probabilities.elaborate>m.distribution(a,{}).probabilities.elaborate);
 assert.ok(Math.abs(Object.values(d.probabilities).reduce((x,y)=>x+y,0)-1)<1e-12);
});
test('refusal persists across attempts and decisions cache without consuming random',()=>{
 const p=m.build({}),s=m.createState(9); const first=m.decide(p,{proposalId:'second',refused:true},s,'one');
 assert.equal(first.strategy,'refuse');
 const next=m.decide(p,{proposalId:'second'},first.state,'two'); assert.equal(next.strategy,'refuse');
 assert.deepEqual(m.decide(p,{},next.state,'two').state,next.state);
 assert.deepEqual(m.decide(p,{},s,'a'),m.decide(p,{},m.createState(9),'a'));
});
test('micro actions require objects, maintain state and use isolated random stream',()=>{
 const p=m.build({appearance:{hairLength:'long',hairstyle:'loose',hairTie:true}}); let s=m.createState(5);
 const r=m.microAction(p,{activity:'dining',forceMicro:true},s); assert.equal(r.action,'tie-hair');
 assert.equal(m.microAction(p,{activity:'dining',forceMicro:true},r.state).action,null);
 assert.equal(m.decide(p,{},s,'x').strategy,m.decide(p,{},r.state,'x').strategy);
 assert.equal(m.microAction(m.build({}),{activity:'dining',forceMicro:true},s).action,null);
});
test('random respects locks and presets map explicit traits without mutating source',()=>{
 const p=m.random({},42,{appearance:{hairLength:'long'}}); assert.equal(p.appearance.hairLength,'long');
 assert.deepEqual(p,m.random({},42,{appearance:{hairLength:'long'}}));
 const role={id:'R01',name:'林澈',presentation:'woman',traits:['direct','curious'],interests:['books'],limit:40};
 const snapshot=JSON.stringify(role),q=m.fromPreset(role); assert.equal(q.interaction.directness,'direct');assert.equal(q.conditions.remainingMinutes,40);assert.equal(JSON.stringify(role),snapshot);
});
test('configuration stays pure JSON and random cannot overwrite locked contradictions',()=>{
 assert.equal(m.validate({conditions:{extra:'bad'}}).valid,false);
 assert.equal(m.validate({appearance:{hairLength:undefined}}).valid,false);
 assert.throws(()=>m.random({},1,{appearance:{hairLength:'short',hairstyle:'tied'}}));
 assert.throws(()=>m.build({provenance:{'interaction.notAField':'known'}}));
});
test('all physical, time and budget constraints survive broad personalities',()=>{
 const p=m.build({interaction:{expression:'outgoing',warmth:'warm'},conditions:{budget:20,remainingMinutes:10,hardNo:['station:A22']}});
 for(const c of [{proposalId:'station:A22'},{cost:30},{durationMinutes:20}])assert.equal(m.decide(p,c,m.createState(1),'same').strategy,'refuse');
 assert.equal(m.distribution(p,{allowedStrategies:[]}).probabilities.clarify,1);
});
