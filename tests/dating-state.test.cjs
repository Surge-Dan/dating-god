const test=require('node:test');
const assert=require('node:assert/strict');
const engine=require('../dating-god/assets/engine.js');
const content=require('../dating-god/assets/content.js');
const cfg={adult:true,scene:'S02',player:'man',presentation:'woman',seed:1};
test('session preserves relationship dimensions independently and enforces a shorter time budget',()=>{
 const scene=engine.sceneById('S02'),duration=scene.duration;scene.duration=1;
 try {
 const run=engine.createRun({...cfg,stage:'steady',intent:'casual',exclusivity:'exclusive',mode:'spark',timeBudget:5,budget:1000},'R01');
 assert.equal(run.stage,'steady');assert.equal(run.intent,'casual');assert.equal(run.exclusivity,'exclusive');assert.equal(run.limit,5);
 let next=engine.act(run,engine.choices(run)[0].id,0);
 if(next.phase==='live')next=engine.act(next,engine.choices(next)[0].id,next.events.length);
 assert.equal(next.phase,'ended');assert.ok(next.elapsed<=5);
 } finally {scene.duration=duration;}
});
test('a second station is only committed after a separate confirmation and can be declined',()=>{
 const target=engine.sceneById('S07'),oldDuration=target.duration,oldAllowed=target.secondStationAllowed,oldHours=target.openingHours;target.duration=5;target.secondStationAllowed=true;target.openingHours=[6,24];
 try {
 let run=engine.createRun({...cfg,budget:10000},'R01');
 for(let n=0;n<2;n++)run=engine.act(run,engine.choices(run).find(a=>a.id!=='leave').id,run.events.length);
 assert.ok(engine.choices(run).some(a=>a.id==='station:S07'));
 const proposal=engine.act(run,'station:S07',run.events.length);
  target.openingHours=[22,24];assert.ok(!engine.choices(proposal).some(a=>a.id==='station-confirm'));target.openingHours=[6,24];
 assert.equal(proposal.scene,'S02');assert.equal(proposal.spent,run.spent);
  const tooLate={...proposal,elapsed:proposal.limit-1};
  assert.ok(!engine.choices(tooLate).some(a=>a.id==='station-confirm'));
 const declined=engine.act(proposal,'station-cancel',proposal.events.length);
 assert.equal(declined.scene,'S02');assert.ok(!engine.choices(declined).some(a=>a.id.startsWith('station:')));
 const confirmed=engine.act(proposal,'station-confirm',proposal.events.length);
 assert.equal(confirmed.scene,'S07');assert.equal(confirmed.stations.length,2);
 const restored=engine.replay(engine.end(confirmed),confirmed.events.length-1);
 assert.equal(restored.scene,'S02');assert.equal(restored.pendingStation,'S07');
 }finally{target.duration=oldDuration;target.secondStationAllowed=oldAllowed;target.openingHours=oldHours;}
});
test('difficulty can decrease but cannot silently increase',()=>{
 const run=engine.createRun({...cfg,mode:'hard'},'R01');
 assert.equal(engine.setMode(run,'spark').mode,'spark');
 assert.equal(engine.setMode(engine.setMode(run,'mellow'),'hard').mode,'mellow');
 const moved=engine.act(run,engine.choices(run)[0].id,0);
 const branch=engine.replay(engine.end(engine.setMode(moved,'mellow')),0);
 assert.equal(branch.mode,'mellow');
});
test('trusted action prerequisites, state patches and budget survive replay',()=>{
 const scene=content.scenes.find(s=>s.id==='S02');const old=scene.nodes.start;
 scene.nodes.start=[{id:'test-buy',label:'选择材料',to:'start',cost:3,minutes:1,patch:{material:'clay'},reply:'好'}, {id:'test-shape',label:'开始成型',to:'start',requires:{material:'clay'},minutes:1,reply:'慢慢来'}];
 try {let run=engine.createRun({...cfg,budget:1000},'R01');assert.ok(!engine.choices(run).some(a=>a.id==='test-shape'));run=engine.act(run,'test-buy',0);assert.equal(run.activityState.material,'clay');assert.ok(engine.choices(run).some(a=>a.id==='test-shape'));const branch=engine.replay(engine.end(run),0);assert.equal(branch.activityState.material,undefined);}finally{scene.nodes.start=old;}
});
