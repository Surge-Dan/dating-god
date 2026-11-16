(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./radar-rules.js'));
else root.RadarCore=factory(root.RadarRules);
})(typeof globalThis!=='undefined'?globalThis:this,function(catalog){'use strict';

const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);
Object.freeze(x);
}return x;
};

const fields=(x,keys)=>Object.fromEntries(keys.filter(k=>x[k]!==undefined&&(x[k]===null||['string','number','boolean'].includes(typeof x[k]))).map(k=>[k,x[k]]));

const invalidStates=new Set(['draft','failed','cancelled','pending']);


function createVisibleSnapshot(input={}){const out=fields(input,['sessionId','branchId','activityId','eventId','nodeId','sourceType','cutoffOrder']);
out.events=(input.events||[]).filter(e=>e.committed===true&&!invalidStates.has(e.status)&&(!Number.isFinite(input.cutoffOrder)||e.order<=input.cutoffOrder)).map((e,index)=>({...fields(e,['id','canonicalEventId','committed','actor','target','text','status','kind','actionId','actionType','order']),order:Number.isFinite(e.order)?e.order:index,facts:fields(e.facts||{},['consent','refused','withdrawn','scopeAllowed','safetyAllowed','exitBlocked','requiresConsent','ruleId','location','object','amount','need','agreement'])}));
return freeze(out);
}

function retrieveRules(snapshot={},options={}){const activity=catalog.activities.find(a=>a.id===snapshot.activityId);
const text=(snapshot.events||[]).map(e=>e.text||'').join(' ');
const terms=[...new Set([...(text.match(/[a-z]{3,}/gi)||[]),...Array.from(text.slice(-1600),(_,i)=>text.slice(-1600).slice(i,i+2)).filter(t=>/^[\u4e00-\u9fff]{2}$/.test(t))])];
return catalog.rules.map((r,index)=>({r,index,score:(activity&&activity.ruleIds.includes(r.id)?8:0)+terms.reduce((n,t)=>n+(r.premise.includes(t)?t.length:0),0)+(r.category==='boundary'?1:0)})).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,Math.max(1,Math.min(24,options.limit||12))).map(x=>x.r);
}

function validateCandidate(c,snapshot={},options={}){const fail=reason=>({valid:false,reason});
if(!c||typeof c!=='object')return fail('invalid_candidate');
const r=catalog.getRule(c.ruleId);
if(!r)return fail('unknown_rule');
if(c.ruleVersion&&c.ruleVersion!==r.version)return fail('rule_version');
if(options.allowedRuleIds&&!options.allowedRuleIds.includes(r.id))return fail('outside_retrieval');
const events=snapshot.events||[];
const e=events.find(x=>x.id===c.eventId);
const preflight=snapshot.sourceType==='preflight'&&e?.status==='draft'&&e?.kind==='speech';
if(!e||(!preflight&&(e.committed!==true||invalidStates.has(e.status))))return fail('uncommitted_event');
if(e.kind!=='action'&&['executed','blocked','requested'].includes(e.status))return fail('physical_state_on_speech');
if(snapshot.eventId&&snapshot.eventId!==e.id&&snapshot.eventId+':character'!==e.id)return fail('wrong_target_event');
if(!['user','character'].includes(e.actor)||c.actor!==e.actor||c.target!==e.target)return fail('wrong_subject');
if(c.category!==r.category)return fail('wrong_category');
if(c.evidenceStatus!=='supported')return fail('needs_clarification');
if(c.interpretation!=='direct')return fail('not_direct');
if(e.kind!=='action'&&(/(?:朋友|别人|他|她)(?:说|要求)|(?:假如|假设|如果我说)|我(?:并)?(?:没有|没|不曾)(?:要求|让|逼|拍|拉)/.test(e.text||'')))return fail('ambiguous_or_nonasserted');
if(!c.exceptionCheck||c.exceptionCheck.checked!==true||c.exceptionCheck.applies!==false||!c.exceptionCheck.reason)return fail('exception_unchecked');
if(!c.premiseReason)return fail('premise_unexplained');
if(e.kind==='action'){if(!c.actionId||c.actionId!==e.actionId)return fail('action_evidence_missing');
}
else if(!c.quote||!(e.text||'').includes(c.quote))return fail('quote_missing');
const before=events.filter(p=>p.order<e.order);
for(const id of c.priorEventIds||[])if(!before.some(p=>p.id===id))return fail('future_or_unknown_premise');
for(const p of c.premises||[]){const prior=before.find(x=>x.id===p.eventId);
if(!prior||!p.quote||!(prior.text||'').includes(p.quote))return fail('premise_quote_missing');
}
if(r.requiresPriorEvidence&&!(c.premises||[]).length&&!(e.kind==='action'&&e.facts&&(e.facts.consent===false||e.facts.refused||e.facts.withdrawn||e.facts.scopeAllowed===false)))return fail('missing_prior_evidence');
const canonicalEventId=e.canonicalEventId||e.id;
const key=[snapshot.sessionId,snapshot.branchId,canonicalEventId].join(':');
if((options.seenEventIds||[]).includes(key))return fail('duplicate_event');
return {valid:true,event:{id:key,canonicalEventId,eventId:e.id,sessionId:snapshot.sessionId,branchId:snapshot.branchId,activityId:snapshot.activityId,ruleId:r.id,ruleVersion:r.version,ruleIds:[r.id],category:r.category,owner:e.actor==='user'?'self':'other',actor:e.actor,target:e.target,quote:c.quote||'',actionId:e.actionId,factStatus:e.status,title:r.title,explanation:c.premiseReason,premiseReason:c.premiseReason,repair:c.repair||r.repair,counterexample:r.counterexample,sourceIds:r.sourceIds,priorEventIds:c.priorEventIds||[],evidenceStatus:'supported',sourceType:preflight?'preflight':'simulation',negative:!preflight&&(r.category==='boundary'||r.category==='friction')}};
}

function validateCandidates(raw,snapshot,selectedRules){const list=Array.isArray(raw)?raw:raw&&raw.candidates;
const accepted=[],rejected=[];
if(!Array.isArray(list))return {accepted,rejected:[{reason:'invalid_output'}],status:'partial'};
const allowedRuleIds=selectedRules&&selectedRules.map(r=>typeof r==='string'?r:r.id);
for(const c of list){const result=validateCandidate(c,snapshot,{allowedRuleIds});
if(!result.valid){rejected.push({candidate:c,reason:result.reason});
continue;
}const existing=accepted.find(e=>e.id===result.event.id);
if(existing){if(!existing.ruleIds.includes(c.ruleId))existing.ruleIds.push(c.ruleId);
continue;
}accepted.push(result.event);
}const priority={boundary:0,friction:1,negotiation:2,care:3};
accepted.sort((a,b)=>priority[a.category]-priority[b.category]);
return {accepted,rejected,status:rejected.length?'partial':'complete'};
}

function detectActionReminders(snapshot={}){const events=snapshot.events||[];
const cards=[];
for(const e of events){if(e.id!==snapshot.eventId||e.kind!=='action'||!e.actionId||e.committed!==true||invalidStates.has(e.status))continue;
const f=e.facts||{};
let id=null;
if(f.exitBlocked)id='D17-02';
else if(f.safetyAllowed===false)id='D08-05';
else if(f.consent===false||f.refused===true||f.withdrawn===true||f.scopeAllowed===false){const action=e.actionType||'';
id=/photo|camera|拍照|拍摄/.test(action)?'D12-01':/publish|share/.test(action)?'D12-02':/touch|hug|hand|牵手|拥抱/.test(action)?'D11-01':/drink|alcohol/.test(action)?'D10-01':/food/.test(action)?'D06-01':/leave|transport/.test(action)?'D17-03':null;
}
if(!id)continue;
const r=catalog.getRule(id);
const result=validateCandidate({ruleId:id,eventId:e.id,actor:e.actor,target:e.target,actionId:e.actionId,category:r.category,evidenceStatus:'supported',interpretation:'direct',premiseReason:'引擎确认授权、拒绝或安全前提未满足',exceptionCheck:{checked:true,applies:false,reason:'由当前动作的引擎事实核对'},repair:r.repair},snapshot);
if(result.valid)cards.push(result.event);
}return cards;
}

function selectPractice(ruleId,options={}){const r=catalog.getRule(ruleId);
if(!r)return null;
const mapped=catalog.activities.filter(a=>a.ruleIds.includes(r.id)&&a.id!==options.activityId);
const activity=mapped[0]||catalog.activities.find(a=>a.id!==options.activityId);
return {ruleId:r.id,ruleVersion:r.version,activityId:activity.id,activityName:activity.name,turnLimit:3,sourceType:'practice',goal:r.repair,opening:'这是一场独立的短练习。'+activity.name+'中，双方先说说各自希望怎样参与。',normalExample:r.counterexample,comparableOpportunity:false,entries:r.entries};
}
return Object.freeze({VERSION:catalog.VERSION,createVisibleSnapshot,retrieveRules,validateCandidate,validateCandidates,detectActionReminders,selectPractice});
});
