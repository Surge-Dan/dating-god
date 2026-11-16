const test=require('node:test');const assert=require('node:assert/strict');
const {createRadarEvaluator}=require('../dating-god/scripts/radar-evaluator.cjs');
test('frozen public evaluation is idempotent, quota bounded and deletion defeats late results',async()=>{
 let finish;let calls=0;const evaluator=createRadarEvaluator({limit:1,request:async()=>{calls++;return await new Promise(r=>finish=r)},rules:{retrieveRules:()=>[],detectActionReminders:()=>[],validateCandidates:()=>({accepted:[],rejected:[]})}});
 const input={sessionId:'s',branchId:'s',eventId:'e',events:[{id:'e',order:0,actor:'user',text:'hello',committed:true,status:'spoken'}]};
 const task=evaluator.enqueue(input); evaluator.enqueue(input);await new Promise(r=>setImmediate(r));assert.equal(calls,1);input.events[0].text='changed';assert.equal(evaluator.snapshot(task.id).events[0].text,'hello');evaluator.remove('e');finish({candidates:[],usage:{totalTokens:5}});await new Promise(r=>setImmediate(r));assert.equal(evaluator.state().tasks.length,0);assert.equal(evaluator.state().quota.used,1);assert.equal(evaluator.enqueue({...input,eventId:'e2'}).status,'skipped');
});
test('failed requests consume quota and remain explicitly uncovered',async()=>{const evaluator=createRadarEvaluator({limit:4,request:async()=>{throw Error('unavailable')},rules:{retrieveRules:()=>[],detectActionReminders:()=>[]}});evaluator.enqueue({eventId:'a',events:[]});await new Promise(r=>setImmediate(r));assert.equal(evaluator.state().tasks[0].status,'failed');assert.equal(evaluator.state().quota.used,1);});

test('HTTP committed turns are polled independently and discard cancels late assessments',async t=>{
 const http=require('node:http');const {startServer}=require('../dating-god/scripts/live-server.cjs');let release;let frozen;
 const model=http.createServer((req,res)=>{req.resume();req.on('end',()=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify({reply:'好，我们慢慢聊。',detail:'',actionId:null})}}],usage:{prompt_tokens:2,completion_tokens:3,total_tokens:5}}));});});
 await new Promise(r=>model.listen(0,'127.0.0.1',r));
 const app=await startServer({port:0,provider:{apiKey:'fake',model:'fake',endpoint:`http://127.0.0.1:${model.address().port}/v1/chat/completions`},radarRequest:async(snapshot)=>{frozen=snapshot;return new Promise(r=>release=r);}});
 t.after(async()=>{await app.close();model.closeAllConnections();await new Promise(r=>model.close(r));});
 const post=async(path,body)=>{const r=await fetch(app.url+path,{method:'POST',headers:{Origin:app.url,'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,value:await r.json()};};
 const opened=await post('/api/session',{config:{adult:true,scene:'S02',player:'unspecified',presentation:'any',avoid:[],seed:7,mode:'spark',radarEnabled:true},roleId:'R01'});assert.equal(opened.status,201);
 const id=opened.value.sessionId;const turn=await post('/api/turn',{sessionId:id,version:0,requestId:'turn',text:'我想听你说说。'});assert.equal(turn.status,200);await new Promise(r=>setImmediate(r));
 assert.equal(frozen.events[0].text,'我想听你说说。');assert.equal(JSON.stringify(frozen).includes('goal'),false);assert.equal(JSON.stringify(frozen).includes('before'),false);
 const poll=await post('/api/radar',{sessionId:id});assert.equal(poll.value.radar.tasks[0].status,'running');assert.equal(poll.value.radar.quota.used,1);
 const preflight=await post('/api/radar/preflight',{sessionId:id,text:'这只是未发送草稿',requestId:'draft1'});assert.equal(preflight.value.radar.tasks.filter(task=>task.preflight).length,1);assert.equal(turn.value.run.events.length,1);
 await post('/api/control',{sessionId:id,command:'pause'});assert.equal((await post('/api/radar',{sessionId:id})).value.radar.tasks[0].status,'running');
 await post('/api/control',{sessionId:id,command:'discard'});release({candidates:[],usage:{totalTokens:7}});await new Promise(r=>setImmediate(r));assert.equal((await post('/api/radar',{sessionId:id})).status,404);
});



test('candidate validation is limited to retrieved rules and never converts role behavior into self history',async()=>{
 const rules=require('../dating-god/assets/radar-rules.js');const core=require('../dating-god/assets/radar-core.js');const selected=rules.rules.find(r=>r.category==='friction'&&!r.requiresPriorEvidence);let candidate;
 const adapter={...core,retrieveRules:()=>[selected]};const evaluator=createRadarEvaluator({rules:adapter,request:async()=>({candidates:[candidate]})});
 const event={id:'x:character',order:1,actor:'character',target:'user',text:'你怎么这么没用，别再说了。',committed:true,status:'spoken',kind:'speech'};
 const other=rules.rules.find(r=>r.category===selected.category&&r.id!==selected.id);
 candidate={ruleId:other.id,eventId:event.id,actor:'character',target:'user',quote:'你怎么这么没用',category:other.category,evidenceStatus:'supported',interpretation:'direct',premiseReason:'明确贬低对方',exceptionCheck:{checked:true,applies:false,reason:'直接向对方说，不是引用'},repair:'可以表达自己的边界。'};
 evaluator.enqueue({eventId:'x',events:[event]});await new Promise(r=>setImmediate(r));assert.equal(evaluator.state().tasks[0].status,'partial');assert.equal(evaluator.state().tasks[0].coverage.semantic,'partial');assert.equal(evaluator.state().tasks[0].coverage.rejected[0].reason,'outside_retrieval');
});

test('family quota is shared across branches while independent practice stops at four',async()=>{
 for(const limit of [40,4]){
  let calls=0;const shared={used:0,limit};const options={quota:shared,rules:{retrieveRules:()=>[],detectActionReminders:()=>[],validateCandidates:()=>({accepted:[],rejected:[]})},request:async()=>{calls++;return {candidates:[]};}};
  const original=createRadarEvaluator(options);const replay=createRadarEvaluator(options);
  for(let i=0;i<limit+1;i++){(i%2?original:replay).enqueue({eventId:'e'+i,events:[]});await new Promise(r=>setImmediate(r));}
  assert.equal(calls,limit);assert.equal(shared.used,limit);assert.equal(replay.state().tasks.at(-1).status,'skipped');assert.equal(replay.state().tasks.at(-1).coverage.semantic,'quota_exceeded');original.close();replay.close();
 }
});

test('model micro practice uses a fresh scenario goal and ends after three successful turns',async t=>{
 const http=require('node:http');const {startServer}=require('../dating-god/scripts/live-server.cjs');const calls=[];
 const model=http.createServer(async(req,res)=>{let body='';for await(const chunk of req)body+=chunk;calls.push(JSON.parse(body));res.setHeader('Content-Type','application/json');res.end(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify({reply:'我想先自己选，选完告诉你。',detail:'',actionId:null})}}]}));});
 await new Promise(r=>model.listen(0,'127.0.0.1',r));const app=await startServer({port:0,provider:{apiKey:'fake',model:'fake',endpoint:`http://127.0.0.1:${model.address().port}/v1/chat/completions`}});t.after(async()=>{await app.close();model.closeAllConnections();await new Promise(r=>model.close(r));});
 const post=async(path,body)=>{const response=await fetch(app.url+path,{method:'POST',headers:{Origin:app.url,'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:response.status,value:await response.json()};};
 const opened=await post('/api/session',{config:{adult:true,scene:'S02',player:'unspecified',presentation:'any',avoid:[],mode:'spark',practiceRuleId:'D03-01'},roleId:'R01'});assert.equal(opened.status,201);assert.equal(opened.value.run.practice.turnLimit,3);assert.ok(opened.value.opening.line);
 let current=opened.value;for(let i=0;i<3;i++){const result=await post('/api/turn',{sessionId:current.sessionId,version:current.version,requestId:'p'+i,text:'好，你先说说。'});assert.equal(result.status,200);current=result.value;}
 assert.equal(current.run.phase,'ended');assert.equal(current.run.events.length,3);assert.equal(current.run.practice.completed,true);assert.equal((await post('/api/turn',{sessionId:current.sessionId,version:current.version,requestId:'p4',text:'继续'})).status,409);assert.match(calls[0].messages[0].content,/独立微练习/);assert.match(calls[0].messages[0].content,/D03-01/);assert.match(calls[0].messages[0].content,/counterexample/);
});
