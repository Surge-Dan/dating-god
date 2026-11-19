const test=require('node:test');const assert=require('node:assert/strict');
const engine=require('../dating-god/assets/engine.js');const content=require('../dating-god/assets/content.js');
const config={adult:true,player:'unspecified',presentation:'any',scene:'S02',seed:12,budget:300,timeBudget:180,sceneSpec:{schemaVersion:1,template:'perler',place:'楼下拼豆店'}};
test('session scene snapshot has genuine perler workflow and does not mutate catalog',()=>{const before=JSON.stringify(content.scenes);const role=engine.match(config)[0];const run=engine.createRun(config,role.id);assert.equal(engine.resolveScene(run).place,'楼下拼豆店');assert.ok(engine.choices(run).some(x=>x.id==='perler-pattern'));let next=engine.act(run,'perler-pattern',0);assert.ok(engine.choices(next).some(x=>x.id==='perler-material'));assert.equal(JSON.stringify(content.scenes),before);assert.match(require('../dating-god/assets/report.js').html(next),/楼下拼豆店/);});
test('track requires explicit activity and confirmed access; unsupported scene is rejected',()=>{assert.throws(()=>engine.match({...config,sceneSpec:{template:'track',place:'校园操场'}}));assert.throws(()=>engine.match({...config,sceneSpec:{template:'moon',place:'月球'}}));});
test('renaming a catalog activity preserves role, player, presentation, and mode matching',()=>{
  const base={adult:true,player:'man',presentation:'woman',scene:'A08',mode:'mellow',seed:7,budget:300,timeBudget:180};
  const original=engine.match(base).map(role=>role.id);
  const renamed=engine.match({...base,sceneSpec:{template:'A08',place:'公园北门'}});
  assert.deepEqual(renamed.map(role=>role.id),original);
  assert.ok(renamed.length>0);
  assert.ok(renamed.every(role=>role.presentation==='woman'&&role.players.includes('man')&&role.scenes.includes('custom:A08')));
  assert.ok(renamed.every(role=>role.scenes.includes('A08')));
});
test('custom activity template matching uses declared analog and does not return incompatible catalog roles',()=>{
  const matched=engine.match({...config,player:'woman',presentation:'man',scene:'S02',mode:'mellow',sceneSpec:{template:'tennis',place:'网球场'}});
  assert.ok(matched.length>0);
  assert.ok(matched.every(role=>role.presentation==='man'&&role.players.includes('woman')&&role.scenes.includes('custom:tennis')));
  assert.ok(matched.every(role=>content.roles.find(item=>item.id===role.id)?.scenes.includes('A18')));
});
test('confirmed track access uses the park-compatible role pool',()=>{
  const matched=engine.match({...config,scene:'S02',player:'unspecified',presentation:'any',sceneSpec:{template:'track',place:'社区操场',activity:'walk',accessConfirmed:true}});
  assert.ok(matched.length>0);
  assert.ok(matched.every(role=>content.roles.find(item=>item.id===role.id)?.scenes.includes('A08')));
});
test('custom partner matching still respects the user-selected gender pairing',()=>{
  const matched=engine.match({...config,player:'man',presentation:'woman',partnerSpec:{presentation:'man'}});
  assert.deepEqual(matched,[]);
});
const {createDialogueCore}=require('../dating-god/scripts/dialogue-core.cjs');
test('custom partner semantic failure does not commit; wording retry preserves sampled decision',async t=>{const previous=global.fetch;t.after(()=>global.fetch=previous);let calls=0;let failSemantic=true,failWording=true;const policies=[];global.fetch=async(_url,options)=>{calls++;const body=JSON.parse(options.body);const semantic=Object.hasOwn(body.response_format.json_schema.schema.properties,'kind');if(semantic&&failSemantic){failSemantic=false;return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:'{}'}}]}));}if(!semantic){policies.push(body.messages[0].content.match(/本轮已经由本地策略决定[^\n]+/)?.[0]);if(failWording){failWording=false;return new Response('',{status:503});}}const value=semantic?{kind:'question',actionId:null,topicRelevant:true,needsClarification:false}:{reply:'你想先说哪个细节？',detail:'',actionId:null};return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify(value)}}]}));};const core=createDialogueCore({provider:{apiKey:'test',model:'test'}});t.after(()=>core.close());const cfg={...config,partnerSpec:{name:'本次对象',interaction:{expression:'reserved'}}};const role=engine.match(cfg)[0];const opened=core.open({config:cfg,roleId:role.id});const input={sessionId:opened.sessionId,version:0,requestId:'same',text:'你觉得这个配色怎么样？'};await assert.rejects(()=>core.turn(input),/语义解析失败/);await assert.rejects(()=>core.turn(input),/模型服务返回错误/);const out=await core.turn(input);assert.equal(out.version,1);assert.equal(out.run.events.length,1);assert.equal(calls,4);assert.equal(policies[0],policies[1]);});
const model=require('../dating-god/assets/partner-model.js');
test('custom partner button policy advances independent state and replay restores it',()=>{const cfg={...config,partnerSpec:{name:'测试对象',appearance:{hairLength:'long',hairstyle:'loose',hairTie:true}}};const r=engine.createRun(cfg,engine.match(cfg)[0].id);const before=JSON.stringify(r.partnerState);const n=engine.act(r,'perler-pattern',0);assert.ok(n.partnerDecision);assert.notEqual(JSON.stringify(n.partnerState),before);assert.equal(JSON.stringify(r.partnerState),before);const replay=engine.replay(engine.end(n),0);assert.deepEqual(replay.partnerState,r.partnerState);});
test('object hard constraints block second station without moving or spending',()=>{const cfg={...config,sceneSpec:undefined,scene:'S02',partnerSpec:{conditions:{remainingMinutes:60,budget:50,hardNo:['station:S05']}}};const role=engine.match(cfg)[0];const r=engine.createRun(cfg,role.id);assert.equal(r.limit,60);assert.equal(r.budget,50);assert.equal(engine.canVisit(r,engine.sceneById('S05')),false);const custom={...r,events:[{action:'say'},{action:'say'}]};assert.ok(!engine.choices(custom).some(x=>x.id==='station:S05'));});
