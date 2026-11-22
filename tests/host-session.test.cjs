'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const runtime = require('../dating-god/scripts/host-session.cjs');
const cfg = { adult:true, scene:'S02', player:'unspecified', presentation:'any', seed:7, mode:'spark' };
const semantic = {kind:'question', actionId:null, topicRelevant:true, needsClarification:false};
const reply = {reply:'你先挑，我想看看你会选哪本。', detail:'', actionId:null};
const start = extra => runtime.dispatch(null,'start',{config:{...cfg,...extra}}).state;
const prepare = (state,extra={}) => runtime.dispatch(state,'prepare',{version:state.version,requestId:'q1',text:'你想看哪本？',semantic,...extra});

test('host runtime opens and completes real free input without a provider or network', t => {
  const old = global.fetch; global.fetch = () => { throw Error('network must not be called'); }; t.after(()=>global.fetch=old);
  const state = start();
  const pending = prepare(state);
  assert.equal(state.pending,null);
  assert.equal(pending.state.run.events.length,0);
  assert.ok(pending.view.task.messages[0].content.includes('可信配置'));
  const done = runtime.dispatch(pending.state,'commit',{version:state.version,requestId:'q1',result:reply});
  assert.equal(done.state.run.events.length,1);
  assert.equal(done.state.version,1);
  assert.equal(done.view.event.reply,reply.reply);
  assert.equal(done.view.event.source,'host');
  assert.equal(done.state.run.agreement,null);
});

test('adult gate and unsupported actions are enforced on host path',()=>{
  assert.throws(()=>start({adult:false}));
  const state=start();
  assert.throws(()=>prepare(state,{text:undefined,actionId:'invented'}));
  assert.throws(()=>prepare(state,{semantic:{...semantic,kind:'performed',actionId:'station-confirm'}}));
  assert.equal(state.run.events.length,0);
});

test('invalid and invented consent replies do not commit or redraw',()=>{
  const prepared=prepare(start({partnerSpec:{name:'小林',interaction:{expression:'reserved'}}}));
  const before=JSON.stringify(prepared.state);
  assert.throws(()=>runtime.dispatch(prepared.state,'commit',{version:0,requestId:'q1',result:{...reply,detail:'TA牵住你的手。'}}));
  assert.throws(()=>runtime.dispatch(prepared.state,'commit',{version:0,requestId:'q1',result:{...reply,patch:{elapsed:0}}}));
  assert.equal(JSON.stringify(prepared.state),before);
  const retry=prepare(prepared.state);
  assert.deepEqual(retry.view.task,prepared.view.task);
  assert.deepEqual(retry.state.pending.candidate.partnerDecision,prepared.state.pending.candidate.partnerDecision);
});

test('explicit hard refusal survives wording failure and cannot become consent',()=>{
  const state=start({partnerSpec:{conditions:{hardNo:['stay']}}});
  const prepared=prepare(state,{text:'再待一会儿吧？',semantic:{...semantic,kind:'proposed',actionId:'stay'}});
  assert.equal(prepared.state.pending.candidate.partnerDecision.strategy,'refuse');
  assert.throws(()=>runtime.dispatch(prepared.state,'commit',{version:0,requestId:'q1',result:{...reply,reply:'好呀，我们继续。'}}));
  const done=runtime.dispatch(prepared.state,'commit',{version:0,requestId:'q1',result:{...reply,reply:'今天先不延长了，改天再聊。'}});
  assert.ok(done.state.run.partnerState.refusals.includes('stay'));
  const again=prepare(done.state,{requestId:'q2',text:'那还是多待一下？',semantic:{...semantic,kind:'proposed',actionId:'stay'}});
  assert.equal(again.state.pending.candidate.partnerDecision.strategy,'refuse');
});

test('idempotent commits, stale versions and cancellation prevent late writes',()=>{
  const prepared=prepare(start());
  const input={version:0,requestId:'q1',result:reply};
  const done=runtime.dispatch(prepared.state,'commit',input);
  assert.equal(runtime.dispatch(done.state,'commit',input).state.run.events.length,1);
  assert.throws(()=>runtime.dispatch(done.state,'commit',{...input,result:{...reply,reply:'换一句'}}));
  const paused=runtime.dispatch(prepared.state,'control',{version:0,command:'pause'});
  assert.equal(paused.state.pending,null);
  assert.equal(paused.state.run.phase,'paused');
  assert.throws(()=>runtime.dispatch(paused.state,'commit',input));
  const resumed=runtime.dispatch(paused.state,'control',{version:paused.state.version,command:'resume'});
  assert.throws(()=>prepare(resumed.state));
  assert.equal(resumed.state.run.elapsed,0);
});

test('idempotency compares values rather than JSON property order',()=>{
  const p=prepare(start());
  const again=runtime.dispatch(p.state,'prepare',{semantic:{needsClarification:false,topicRelevant:true,actionId:null,kind:'question'},text:'你想看哪本？',requestId:'q1',version:0});
  assert.deepEqual(again.view.task,p.view.task);
  const done=runtime.dispatch(p.state,'commit',{version:0,requestId:'q1',result:reply});
  const retried=runtime.dispatch(done.state,'commit',{result:{actionId:null,detail:'',reply:reply.reply},requestId:'q1',version:0});
  assert.equal(retried.state.run.events.length,1);
});

test('boundary and leave remain deterministic and do not need host generation',()=>{
  const state=start();
  const boundary=prepare(state,{text:'别拍我',semantic:{...semantic,kind:'refusal'}});
  assert.equal(boundary.view.committed,true);
  assert.equal(boundary.state.run.elapsed,0);
  assert.equal(boundary.view.event.action,'boundary');
  const ended=prepare(boundary.state,{requestId:'exit',text:'我先走了'});
  assert.equal(ended.state.run.phase,'ended');
  assert.equal(ended.view.task,undefined);
});

test('custom perler workflow shares engine state and replay preserves original evidence',()=>{
  let state=start({sceneSpec:{template:'perler',place:'周末拼豆店',budget:50,duration:60},partnerSpec:{name:'对象'}});
  const step=runtime.dispatch(state,'prepare',{version:0,requestId:'a1',actionId:'perler-pattern'});
  state=runtime.dispatch(step.state,'commit',{version:0,requestId:'a1',result:{reply:'你想先挑哪个图案？',detail:'',actionId:null}}).state;
  assert.equal(state.run.node,'materials');
  const ended=runtime.dispatch(state,'control',{version:state.version,command:'end'}).state;
  const branch=runtime.dispatch(ended,'control',{version:ended.version,command:'replay',index:0}).state;
  assert.equal(branch.original.events.length,1);
  assert.equal(branch.run.events.length,0);
  assert.deepEqual(branch.run.partnerState,step.state.run.partnerState);
  assert.throws(()=>runtime.dispatch(branch,'control',{version:branch.version,command:'replay',index:0}));
});

test('host coaching uses evidence and reports are escaped with explicit card confirmation',()=>{
  const prepared=prepare(start({radarEnabled:true}));
  let state=runtime.dispatch(prepared.state,'commit',{version:0,requestId:'q1',result:reply}).state;
  const coaching=runtime.dispatch(state,'coach',{});
  assert.ok(coaching.view.rules.length>0);
  assert.ok(coaching.view.snapshot.events.some(x=>x.text==='你想看哪本？'));
  assert.throws(()=>runtime.dispatch(state,'coach',{candidates:'not an array'}));
  const checked=runtime.dispatch(state,'coach',{candidates:[{ruleId:'D11-01',eventId:'fake'}]});
  assert.equal(checked.view.evaluation.accepted.length,0);
  state=runtime.dispatch(state,'control',{version:state.version,command:'end'}).state;
  const exported=runtime.dispatch(state,'export',{note:'<script>alert(1)</script>',includeNote:true});
  assert.ok(exported.view.html.includes('&lt;script&gt;'));
  assert.equal(exported.view.card,null);
  const card=runtime.dispatch(state,'export',{selected:0,accepted:'我希望自己的选择可以被认真听见。',confirmed:true});
  assert.ok(card.view.card.includes('<svg'));
  assert.equal(runtime.dispatch(state,'control',{version:state.version,command:'discard'}).state,null);
});

test('random partner accepts locks and saved config can be reused by another host',()=>{
  const built=runtime.dispatch(null,'partner',{mode:'random',seed:8,spec:{name:'预演对象'},locked:{interaction:{expression:'reserved'}}});
  assert.equal(built.view.partnerSpec.interaction.expression,'reserved');
  const imported=runtime.dispatch(null,'partner',{mode:'import',json:built.view.json});
  const state=start({partnerSpec:imported.view.partnerSpec});
  assert.equal(state.run.partnerSnapshot.interaction.expression,'reserved');
});

test('CLI is portable across fresh processes and refuses to overwrite a live session',t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dating-host-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const statePath=path.join(dir,'session.json');
  const script=path.resolve(__dirname,'../dating-god/scripts/host-session.cjs');
  const run=(cmd,data)=>spawnSync(process.execPath,[script,cmd,'--state',statePath],{input:JSON.stringify(data),encoding:'utf8',env:{...process.env,OPENAI_API_KEY:'',OPENAI_MODEL:''}});
  const opened=run('start',{config:cfg});assert.equal(opened.status,0,opened.stderr);
  const before=fs.readFileSync(statePath,'utf8');
  assert.notEqual(run('start',{config:cfg}).status,0);
  assert.equal(fs.readFileSync(statePath,'utf8'),before);
  const pending=run('prepare',{version:0,requestId:'q1',text:'你想看哪本？',semantic});assert.equal(pending.status,0,pending.stderr);
  const done=run('commit',{version:0,requestId:'q1',result:reply});assert.equal(done.status,0,done.stderr);
  assert.equal(JSON.parse(fs.readFileSync(statePath,'utf8')).run.events.length,1);
  const ended=run('control',{version:1,command:'end'});assert.equal(ended.status,0,ended.stderr);
  const removed=run('control',{version:2,command:'discard'});assert.equal(removed.status,0,removed.stderr);
  assert.equal(fs.existsSync(statePath),false);
});
