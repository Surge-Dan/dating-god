const test=require('node:test'),assert=require('node:assert/strict');const report=require('../dating-god/assets/report.js');
const run={events:[{label:'我想坐外面',reply:'正好，我也喜欢外面',inputType:'text'}],rehearsalTask:{duration:'short'}};
const valid={dimension:'表达',turn:1,quote:'想坐外面',partnerQuote:'正好',observation:'表达偏好',alternative:'外面如何？'};
test('report retains only genuine quotes from both speakers',()=>{assert.equal(report.validateAnalysis(run,{findings:[valid]}).findings.length,1);for(const patch of [{dimension:'诊断'},{turn:0},{turn:2},{turn:1.5},{quote:'不存在'},{partnerQuote:'不存在'},{observation:''},{alternative:' '},{quote:'a'.repeat(261)}])assert.equal(report.validateAnalysis(run,{findings:[{...valid,...patch}]}).findings.length,0);assert.equal(report.validateAnalysis({...run,events:[{...run.events[0],inputType:'action'}]},{findings:[valid]}).findings.length,0);assert.equal(report.validateAnalysis(run,{findings:[valid,valid]}).findings.length,1);assert.deepEqual(report.validateAnalysis(run,null),{findings:[]});});
const make=(duration)=>({events:Array.from({length:6},(_,i)=>({label:'x'.repeat(260),reply:'好的',inputType:'text'})),...(duration?{rehearsalTask:{duration}}:{})});
const many=Array.from({length:6},(_,i)=>({...valid,turn:i+1,quote:'x'.repeat(260),partnerQuote:'好的'}));
test('report enforces length boundaries and short/full evidence limits',()=>{for(const [duration,count] of [['short',2],['full',4],[null,4]]){const result=report.validateAnalysis(make(duration),{findings:many});assert.equal(result.findings.length,count);assert.deepEqual(result.findings[0],many[0]);}for(const field of ['quote','partnerQuote','observation','alternative']){assert.equal(report.validateAnalysis(run,{findings:[{...valid,[field]:7}]}).findings.length,0);assert.equal(report.validateAnalysis(run,{findings:[{...valid,[field]:'x'.repeat(261)}]}).findings.length,0);}assert.deepEqual(report.validateAnalysis(run,{findings:'invalid'}),{findings:[]});assert.equal(report.validateAnalysis({...run,events:[{reply:'正好'}]},{findings:[valid]}).findings.length,0);});

test('all five dimensions are accepted and invalid dimensions are rejected',()=>{
 for(const dimension of ['接话','表达','协商','尊重意愿','收尾']){
   assert.equal(report.validateAnalysis(run,{findings:[{...valid,dimension}]}).findings.length,1,dimension);
 }
 assert.equal(report.validateAnalysis(run,{findings:[{...valid,dimension:'诊断'}]}).findings.length,0);
});

test('non-array findings and events without replies never throw',()=>{
 for(const input of [{findings:7},{findings:'invalid'},{findings:{}},null,undefined])assert.deepEqual(report.validateAnalysis(run,input),{findings:[]});
 const noReply={events:[{label:'想坐外面',inputType:'text'}]};
 assert.deepEqual(report.validateAnalysis(noReply,{findings:[valid]}),{findings:[]});
});

test('summaries cannot leak long quotes through observation or alternative',()=>{
 const longRun={events:[{label:'我想坐在靠窗的位置，那里比较安静',reply:'正好，我也喜欢靠窗的位置，安静',inputType:'text'}],rehearsalTask:{duration:'short'}};
 const base={dimension:'表达',turn:1,quote:'靠窗的位置，那里比较安静',partnerQuote:'我也喜欢靠窗的位置',observation:'你直接说出了位置偏好',alternative:'下次也可以先问一句'};
 assert.equal(report.validateAnalysis(longRun,{findings:[base]}).findings.length,1);
 for(const patch of [
   {observation:'你说「我想坐在靠窗的位置，那里比较安静」这很好'},
   {alternative:'下次还说「靠窗的位置，那里比较安静」'},
   {observation:'靠窗的位置，那里比较安静',alternative:'换个说法'}
 ])assert.equal(report.validateAnalysis(longRun,{findings:[{...base,...patch}]}).findings.length,0);
 const shortQuote={...base,quote:'比较安静',observation:'你想坐靠窗的位置'};
 assert.equal(report.validateAnalysis(longRun,{findings:[shortQuote]}).findings.length,1);
});
