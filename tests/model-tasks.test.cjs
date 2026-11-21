const test=require('node:test');
const assert=require('node:assert/strict');
const {createDialogueCore}=require('../dating-god/scripts/dialogue-core.cjs');
function fixture(t){
 const original=global.fetch;let pending=null;const calls=[];
 global.fetch=async(url,options)=>{calls.push(options);if(pending)await pending;const properties=JSON.parse(options.body).response_format.json_schema.schema.properties;const value=properties.line?{line:'我想慢慢聊。'}:properties.findings?{findings:[]}:{reply:'好，我们慢慢聊。',detail:'',actionId:null,suggestions:[]};return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify(value)}}],usage:{prompt_tokens:10,completion_tokens:5,total_tokens:15}}));};
 const core=createDialogueCore({provider:{apiKey:'test-only',model:'test-only'}});
 t.after(()=>{core.close();global.fetch=original;});
 const open=()=>core.open({config:{adult:true,scene:'S02',player:'unspecified',presentation:'any',mode:'spark'},roleId:'R01',task:{kind:'practice',goal:'开场',duration:'short',style:'natural'}});
 return {core,open,calls,delay(){let release;pending=new Promise(r=>release=r);return release;}};
}
test('polish and cached report count actual provider usage once',async t=>{
 const {core,open}=fixture(t);let s=open();await core.polish({sessionId:s.sessionId,version:0,text:'慢慢聊'});
 let usage=core.control({sessionId:s.sessionId,command:'status'}).telemetry;assert.equal(usage.requests,1);assert.equal(usage.totalTokens,15);
 for(let i=0;i<3;i++)s=await core.turn({sessionId:s.sessionId,version:s.version,requestId:'usage-'+i,text:'你喜欢什么书？'});
 core.control({sessionId:s.sessionId,command:'end'});await core.report({sessionId:s.sessionId});await core.report({sessionId:s.sessionId});
 usage=core.control({sessionId:s.sessionId,command:'status'}).telemetry;assert.equal(usage.requests,5);assert.equal(usage.succeeded,5);assert.equal(usage.totalTokens,75);
});
test('discard cancels polish and refuses a late provider response',async t=>{
 const {core,open,calls,delay}=fixture(t);const s=open();const release=delay();
 const promise=core.polish({sessionId:s.sessionId,version:0,text:'慢慢聊'});const rejected=assert.rejects(promise);
 core.control({sessionId:s.sessionId,command:'discard'});const aborted=calls[0].signal.aborted;release();await rejected;assert.equal(aborted,true);
});
test('invalid polish is counted as a failed provider result',async t=>{const {core,open}=fixture(t);global.fetch=async()=>new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:'{"line":""}'}}],usage:{prompt_tokens:10,completion_tokens:5,total_tokens:15}}));const s=open();await assert.rejects(core.polish({sessionId:s.sessionId,version:0,text:'慢慢聊'}));const usage=core.control({sessionId:s.sessionId,command:'status'}).telemetry;assert.equal(usage.succeeded,0);assert.equal(usage.failed,1);assert.equal(usage.totalTokens,15);});
