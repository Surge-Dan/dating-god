const test=require('node:test');

const assert=require('node:assert/strict');

let rules,core;

try {rules=require('../dating-god/assets/radar-rules.js');
core=require('../dating-god/assets/radar-core.js');
} catch {}
const snapshot=()=>({sessionId:'s',branchId:'b',activityId:'A06',eventId:'e2',events:[{id:'e1',order:1,actor:'character',target:'user',text:'我想自己看，不想听讲解',committed:true,status:'spoken',kind:'speech'},{id:'e2',order:2,actor:'user',target:'character',text:'你不懂，听我的',committed:true,status:'spoken',kind:'speech'}]});

const candidate=()=>({ruleId:'D03-05',eventId:'e2',actor:'user',target:'character',quote:'你不懂，听我的',priorEventIds:['e1'],premises:[{eventId:'e1',quote:'我想自己看，不想听讲解'}],premiseReason:'此前已明确想自己理解，这句仍继续教学',category:'friction',evidenceStatus:'supported',interpretation:'direct',exceptionCheck:{checked:true,applies:false,reason:'没有受邀讲解；此前已明确拒绝'},repair:'先停下，问对方想聊什么'});

test('180 distinct usable rules and 24 activity mappings retain premise, counterexample, repair and source IDs',()=>{assert.ok(rules,'rule library is implemented');
assert.equal(rules.rules.length,180);
assert.equal(new Set(rules.rules.map(r=>r.id)).size,180);
assert.equal(rules.activities.length,24);
for(const r of rules.rules){assert.ok(r.premise&&r.counterexample&&r.repair&&r.sourceIds.length&&r.entries.length);
assert.equal(r.version,rules.VERSION);
}});

test('visible projection excludes hidden persona and unsubmitted drafts and freezes result',()=>{assert.ok(core);
const s=core.createVisibleSnapshot({...snapshot(),hiddenPreference:'secret',draft:'secret'});
assert.equal(s.hiddenPreference,undefined);
assert.equal(s.draft,undefined);
assert.ok(Object.isFrozen(s.events));
assert.equal(s.events.length,2);
});

test('retrieval is bounded and uses activity rules',()=>{assert.ok(core);
const r=core.retrieveRules(snapshot(),{limit:8});
assert.ok(r.length<=8);
assert.ok(r.some(x=>x.id==='D03-05'));
});

test('verified direct event accepted; forged quote, wrong actor and later premises rejected',()=>{assert.ok(core);
assert.equal(core.validateCandidate(candidate(),snapshot()).valid,true);
for(const patch of [{quote:'不存在'},{actor:'character'},{premises:[{eventId:'e2',quote:'你不懂'}],priorEventIds:['e2']}])assert.equal(core.validateCandidate({...candidate(),...patch},snapshot()).valid,false);
});

test('quotation, negation, hypotheticals, unmet premises and normal exceptions cannot be negative events',()=>{assert.ok(core);
for(const interpretation of ['quoted','negated','hypothetical'])assert.equal(core.validateCandidate({...candidate(),interpretation},snapshot()).valid,false);
assert.equal(core.validateCandidate({...candidate(),exceptionCheck:{checked:true,applies:true,reason:'受邀讲解'}},snapshot()).valid,false);
assert.equal(core.validateCandidate({...candidate(),premises:[],priorEventIds:[]},snapshot()).valid,false);
for(const text of ['朋友说“你不懂，听我的”','我没有要求你听我的','假如我说你不懂，听我的呢']){const s=snapshot();
s.events[1].text=text;
assert.equal(core.validateCandidate({...candidate(),quote:text},s).valid,false);
}});

test('committed fact states, opposite-party attribution, version and event idempotence remain separate',()=>{assert.ok(core);
const s=snapshot();
s.events[1].actor='character';
s.events[1].target='user';
assert.equal(core.validateCandidate({...candidate(),actor:'character',target:'user'},s).event.owner,'other');
assert.equal(core.validateCandidate(candidate(),snapshot(),{seenEventIds:['s:b:e2']}).valid,false);
for(const status of ['draft','failed','cancelled']){const x=snapshot();
x.events[1].status=status;
assert.equal(core.validateCandidate(candidate(),x).valid,false);
}assert.equal(core.validateCandidate({...candidate(),ruleVersion:'old'},snapshot()).valid,false);
});

test('blocked action is reminder for attempted action, not executed fact; plain text is never physical execution',()=>{assert.ok(core);
const s=snapshot();
s.events[1]={id:'e2',order:2,actor:'user',target:'character',committed:true,status:'blocked',kind:'action',actionId:'a2',actionType:'photo',facts:{consent:false}};
const cards=core.detectActionReminders(s);
assert.equal(cards.length,1);
assert.equal(cards[0].factStatus,'blocked');
assert.equal(cards[0].ruleId,'D12-01');
assert.equal(core.detectActionReminders(snapshot()).length,0);
});

test('same event multiple labels merge, practice is independent and normal AA has no keyword verdict',()=>{assert.ok(core);
const c=candidate();
const r=core.validateCandidates([c,c],snapshot(),rules.rules);
assert.equal(r.accepted.length,1);
const p=core.selectPractice('D03-05',{activityId:'A06'});
assert.ok(p&&p.activityId!=='A06'&&p.turnLimit<=4&&p.turnLimit>=2);
assert.equal(core.detectActionReminders({...snapshot(),events:[{...snapshot().events[1],text:'我们AA吧，我预算不多'}]}).length,0);
});

test('visible facts cannot carry nested hidden data; target cutoff omits future events',()=>{const s=core.createVisibleSnapshot({...snapshot(),cutoffOrder:2,events:[...snapshot().events,{id:'e3',order:3,actor:'character',text:'后来才拒绝',committed:true,status:'spoken',facts:{need:{hiddenPreference:'secret'}}}]});
assert.equal(s.events.some(e=>e.id==='e3'),false);
const x=core.createVisibleSnapshot({...snapshot(),events:[{...snapshot().events[0],facts:{need:{hiddenPreference:'secret'}}}]});
assert.equal(JSON.stringify(x).includes('secret'),false);
});

test('physical action cannot claim executed state from speech, dedup main category has highest priority',()=>{const s=snapshot();
s.events[1].status='executed';
assert.equal(core.validateCandidate(candidate(),s).valid,false);
});

test('projection preserves authority marker all the way to accepted reminder',()=>{const s=core.createVisibleSnapshot(snapshot());
assert.equal(core.validateCandidate(candidate(),s).valid,true);
});

test('current character turn is attributable; preflight advice is explicit and cannot become negative fact',()=>{const s=snapshot();s.events.push({id:'e2:character',order:3,actor:'character',target:'user',text:'你不懂，听我的',status:'spoken',kind:'speech',committed:true});const c={...candidate(),eventId:'e2:character',actor:'character',target:'user'};assert.equal(core.validateCandidate(c,s).valid,true);const p=snapshot();p.sourceType='preflight';p.events[1].committed=false;p.events[1].status='draft';const r=core.validateCandidate(candidate(),p);assert.equal(r.valid,true);assert.equal(r.event.negative,false);assert.equal(r.event.sourceType,'preflight');});
test('offline engine offers one blocked photo attempt with authoritative consent and stable replay prefix',()=>{const engine=require('../dating-god/assets/engine.js');const config={adult:true,scene:'S02',player:'unspecified',presentation:'any',avoid:[],seed:7};let run=engine.createRun(config,engine.match(config)[0].id);assert.ok(engine.choices(run).some(a=>a.id==='snap-photo'));run=engine.act(run,'snap-photo',0);const e=run.events[0];assert.equal(e.executionStatus,'blocked');assert.equal(e.radarFacts.consent,false);assert.equal(e.actionType,'photo');assert.ok(e.canonicalEventId);assert.equal(engine.choices(run).some(a=>a.id==='snap-photo'),false);const cards=core.detectActionReminders({sessionId:'s',branchId:'b',eventId:e.eventId,events:[{...e,id:e.eventId,actor:'user',target:'character',kind:'action',actionId:e.action,status:e.executionStatus,facts:e.radarFacts,committed:true}]});assert.equal(cards[0].ruleId,'D12-01');run=engine.act(run,engine.choices(run).find(a=>a.id!=='leave').id,1);run=engine.end(run);const replay=engine.replay(run,1);assert.ok(replay);assert.equal(replay.events[0].canonicalEventId,e.canonicalEventId);});


test("retrieval recognizes a digital privacy topic outside the activity shortlist",()=>{const selected=core.retrieveRules({activityId:"A01",events:[{text:"你必须给我你的密码和定位，不然就别联系我"}]},{limit:12});assert.ok(selected.some(r=>["D12-06","D13-04","D18-08"].includes(r.id)));});
