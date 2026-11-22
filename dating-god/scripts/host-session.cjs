'use strict';

// Local protocol, not a model client: the invoking agent supplies interpretation
// and wording. Only the shared engine can change activity and consent state.
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const engine = require('../assets/engine.js');
const content = require('../assets/content.js');
const partner = require('../assets/partner-model.js');
const scenes = require('../assets/preparation-scenes.js');
const radar = require('../assets/radar-core.js');
const report = require('../assets/report.js');
const { MODES, MAX_INPUT, SCHEMA, SEMANTIC_SCHEMA, bad, conflict, copy, exactKeys,
  validateSetup, proposalActions, semanticActions, assertConsistentOutput,
  messagesFor, freeCandidate, decidePartner, radarEnabled } = require('./turn-contract.cjs');
const LIMIT = 8 * 1024 * 1024;
const canonical = value => JSON.stringify(value, function (_key, item) {
  return item && typeof item==='object' && !Array.isArray(item)
    ? Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])) : item;
});

function view(state) {
  const run = state.run, role = engine.resolveRole(run), scene = engine.resolveScene(run);
  return { sessionId:state.sessionId, version:state.version, phase:run.phase,
    elapsed:run.elapsed, remainingMinutes:run.limit-run.elapsed, eventCount:run.events.length,
    role:{id:role.id,name:role.name,bio:role.bio}, scene:{id:scene.id,name:scene.name,place:scene.place},
    choices:engine.choices(run).map(a=>({id:a.id,label:a.label})),
    event:run.events.at(-1) || null, opening:state.opening };
}

function catalog(config) {
  const cfg = config && validateSetup(config);
  return { scenes:content.scenes.map(s=>({id:s.id,name:s.name,cost:s.cost,duration:s.duration})),
    roles:(cfg?engine.match(cfg):content.roles).map(r=>({id:r.id,name:r.name,presentation:r.presentation,bio:r.bio,scenes:r.scenes})),
    partnerFields:partner.definitions, sceneTemplates:scenes.templates,
    modes:MODES, semanticSchema:SEMANTIC_SCHEMA, replySchema:SCHEMA };
}

function checkSemantic(value,run) {
  exactKeys(value,['kind','actionId','topicRelevant','needsClarification']);
  if (!SEMANTIC_SCHEMA.properties.kind.enum.includes(value.kind) || typeof value.topicRelevant!=='boolean' || typeof value.needsClarification!=='boolean' || !(value.actionId===null || typeof value.actionId==='string')) throw bad('语义说明无效，请按semanticSchema重新整理。');
  if (value.actionId!==null && (!['performed','proposed'].includes(value.kind) || !(value.kind==='performed'?semanticActions(run):proposalActions(run)).some(a=>a.id===value.actionId))) throw bad('语义说明引用了当前不可执行或不可提议的动作。');
  return value;
}

function checkReply(value) {
  exactKeys(value,['reply','detail','actionId']);
  if (typeof value.reply!=='string' || !value.reply.trim() || value.reply.length>500 || typeof value.detail!=='string' || value.detail.length>300 || value.actionId!==null) throw bad('宿主只提交reply、detail、actionId:null；动作由prepare阶段确认。');
  return {reply:value.reply.trim(),detail:value.detail.trim(),actionId:null};
}

function visibleSnapshot(state) {
  const events=[];
  for (const e of state.run.events) {
    events.push({id:e.eventId,canonicalEventId:e.canonicalEventId,order:events.length,actor:'user',target:'character',text:e.label,committed:true,status:e.executionStatus||'spoken',kind:['say','boundary'].includes(e.action)?'speech':'action',actionId:e.action,actionType:e.actionType||e.action,facts:e.radarFacts||{}});
    events.push({id:e.eventId+':character',order:events.length,actor:'character',target:'user',text:e.reply,committed:true,status:'spoken',kind:'speech'});
  }
  return radar.createVisibleSnapshot({sourceType:'simulation',sessionId:state.sessionId,branchId:state.run.runId,
    activityId:engine.resolveScene(state.run).activityId||state.run.scene,eventId:state.run.events.at(-1)?.eventId,events});
}

function finish(state,candidate,requestId,fingerprint,commitFingerprint) {
  const e=candidate.events.at(-1);
  e.eventId ||= randomUUID(); e.canonicalEventId ||= e.eventId;
  e.executionStatus ||= ['say','boundary','leave'].includes(e.action)?'spoken':'requested';
  state.run=candidate; state.pending=null; state.version++;
  state.receipts.push({requestId,fingerprint,commitFingerprint,eventId:e.eventId});
  const snapshot=visibleSnapshot(state);
  return {state,view:{...view(state),committed:true,reminders:radar.detectActionReminders(snapshot),coachAvailable:state.run.radarEnabled}};
}

function dispatch(source,command,input={}) {
  if (command==='catalog') { exactKeys(input,['config']); return {state:source,view:catalog(input.config)}; }
  if (command==='partner') {
    exactKeys(input,['mode','spec','seed','locked','json']);
    if(!['build','random','import'].includes(input.mode)) throw bad('对象模式为build/random/import。');
    let value;
    if(input.mode==='import') value=partner.importConfig(input.json);
    else {
      const spec=partner.build(input.spec||{});
      if(input.seed!==undefined && (!Number.isInteger(input.seed)||input.seed<0||input.seed>0xffffffff)) throw bad('随机种子无效。');
      if(input.locked!==undefined) partner.build(input.locked);
      value=input.mode==='random'?partner.random(spec,input.seed??1,input.locked||{}):spec;
    }
    return {state:source,view:{partnerSpec:value,json:partner.exportConfig(value)}};
  }
  if (command==='start') {
    if (source) throw conflict('已有本场记录，请使用新状态文件或先清空。');
    exactKeys(input,['config','roleId']);
    const cfg=validateSetup(input.config);
    if(cfg.practiceRuleId) throw bad('宿主入口请用一场普通预演处理练习；网页独立微练习仍在原入口。');
    const matches=engine.match(cfg);
    const roleId=input.roleId ?? matches[0]?.id;
    if(typeof roleId!=='string' || !matches.some(r=>r.id===roleId)) throw bad('没有满足对象、场景、时间与预算条件的人物，请调整配置。');
    const run=engine.createRun(cfg,roleId);
    run.radarEnabled=radarEnabled(cfg.radarEnabled);
    run.preparation=copy(cfg.preparation||{});
    const state={schemaVersion:1,sessionId:randomUUID(),version:0,run,opening:engine.opening(run),original:null,replayUsed:false,pending:null,receipts:[],cancelled:[]};
    return {state,view:view(state)};
  }
  if(!source || source.schemaVersion!==1 || !Number.isInteger(source.version) || !source.run || !Array.isArray(source.receipts) || !Array.isArray(source.cancelled)) throw bad('没有可用的本场文件，请先start。');
  const state=copy(source), run=state.run;
  if(command==='status') { exactKeys(input,[]); return {state,view:view(state)}; }
  if(command==='coach') {
    exactKeys(input,['candidates']);
    if(!run.radarEnabled) throw conflict('本场已关闭避雷提醒。');
    const snapshot=visibleSnapshot(state),rules=radar.retrieveRules(snapshot);
    if(input.candidates!==undefined && (!Array.isArray(input.candidates)||input.candidates.length>12)) throw bad('候选提醒需为不超过12条的数组。');
    return {state,view:input.candidates===undefined?{snapshot,rules,coverage:'等待宿主依据原话和正常反例检查，未检查不等于没有问题。'}:{evaluation:radar.validateCandidates(input.candidates,snapshot,rules)}};
  }
  if(command==='export') {
    exactKeys(input,['selected','accepted','confirmed','note','includeNote','expectation','includeExpectation','nickname','includeExperiment','includeFull']);
    if(run.phase!=='ended') throw conflict('先散场再生成回看。');
    if(Object.entries(input).some(([k,v])=>['confirmed','includeNote','includeExpectation','includeExperiment','includeFull'].includes(k)?typeof v!=='boolean':k==='selected'?!Number.isInteger(v):typeof v!=='string'||v.length>1200)) throw bad('回看确认信息无效。');
    const original=state.original||run, branch=state.original?run:null;
    const accepted=report.claim(original,input,branch);
    return {state,view:{html:report.html(original,branch,input),card:accepted?report.card(original,input,branch):null}};
  }
  if(command==='control') {
    exactKeys(input,['version','command','index','mode']);
    if(input.version!==state.version) throw conflict('本场已变化，请读取status后再操作。');
    if(!['pause','resume','end','cancel','replay','discard','set-mode'].includes(input.command)) throw bad('控制操作无效。');
    if(input.command==='discard') return {state:null,view:{discarded:true}};
    if(input.command==='replay') {
      if(state.replayUsed || state.pending) throw conflict('本场已重演，或仍有未提交回合。');
      const branch=engine.replay(run,input.index);
      if(!branch) throw conflict('只能从已结束原场的有效回合重演。');
      state.original=copy(run); state.run=branch; state.replayUsed=true;
    } else if(input.command==='set-mode') {
      if(!['live','paused'].includes(run.phase) || !MODES.includes(input.mode) || MODES.indexOf(input.mode)>MODES.indexOf(run.mode)) throw bad('现场只支持降低强度。');
      state.run=engine.setMode(run,input.mode);
    } else if(input.command!=='cancel') state.run=engine[input.command](run);
    if(state.pending) state.cancelled.push(state.pending.requestId);
    state.pending=null; state.version++;
    return {state,view:view(state)};
  }
  if(command==='prepare') {
    exactKeys(input,['version','requestId','text','actionId','semantic']);
    if(typeof input.requestId!=='string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(input.requestId) || !Number.isInteger(input.version) || (Object.hasOwn(input,'text')===Object.hasOwn(input,'actionId'))) throw bad('需要version、requestId与一种输入。');
    if(input.text!==undefined && (typeof input.text!=='string'||!input.text.trim()||input.text.length>MAX_INPUT)) throw bad('请输入1至1200字。');
    if(input.actionId!==undefined && typeof input.actionId!=='string') throw bad('动作无效。');
    const fingerprint=canonical(input);
    const receipt=state.receipts.find(r=>r.requestId===input.requestId);
    if(receipt) { if(receipt.fingerprint!==fingerprint) throw conflict('请求编号不能用于不同内容。'); return {state,view:{...view(state),committed:true,alreadyCommitted:true}}; }
    if(input.version!==state.version || run.phase!=='live' || state.cancelled.includes(input.requestId)) throw conflict('本场已变化、暂停、结束或该请求已取消。');
    if(state.pending) {
      if(state.pending.fingerprint!==fingerprint) throw conflict('请先提交或取消当前回合。');
      return {state,view:{...view(state),task:state.pending.task}};
    }
    if(run.events.length>=200) throw conflict('本场已达到200回合，请散场回看。');
    let candidate,deterministic=false;
    if(input.actionId!==undefined) {
      if(input.semantic!==undefined) throw bad('点选动作无需semantic。');
      const action=engine.choices(run).find(a=>a.id===input.actionId);
      if(!action) throw bad('当前不能执行这个动作。');
      candidate=engine.act(run,input.actionId,run.events.length);
      deterministic=Boolean(action.requiresConsent||candidate.events.at(-1).executionStatus==='blocked')||['leave','stay','stroll','invite','weekend','confirm','station','station-confirm','station-cancel'].includes(action.type)||candidate.phase==='ended';
    } else {
      candidate=freeCandidate(run,input.text.trim());
      deterministic=candidate.events.at(-1).source==='engine';
      if(!deterministic) {
        const semantic=checkSemantic(input.semantic,run);
        if(semantic.kind==='performed'&&semantic.actionId) {
          candidate=engine.act(run,semantic.actionId,run.events.length);
          const e=candidate.events.at(-1); e.actionLabel=e.label; e.label=input.text.trim(); e.interpretedAction=semantic.actionId;
          deterministic=Boolean(e.executionStatus==='blocked'||candidate.phase==='ended');
        }
        if(!deterministic) candidate=decidePartner(run,candidate,input,semantic);
      }
    }
    candidate.events.at(-1).source=deterministic?'engine':'host';
    if(deterministic) return finish(state,candidate,input.requestId,fingerprint,null);
    const task={kind:'wording',schema:SCHEMA,messages:messagesFor({run,mode:run.mode,opening:state.opening},input,candidate)};
    task.messages[0].content+='\n宿主模式：actionId必须为null，动作已由本地引擎处理。只输出本轮台词，不调用外部模型接口。';
    if(candidate.partnerDecision) task.messages[0].content+='\n本轮已确定策略，不可重选：'+JSON.stringify(candidate.partnerDecision)+'。detail必须为空，小动作由引擎呈现；refuse必须明确拒绝，clarify必须澄清，end必须收尾。';
    state.pending={requestId:input.requestId,fingerprint,input,candidate,task};
    return {state,view:{...view(state),task}};
  }
  if(command==='commit') {
    exactKeys(input,['version','requestId','result']);
    const receipt=state.receipts.find(r=>r.requestId===input.requestId);
    const commitFingerprint=canonical(input);
    if(receipt) { if(receipt.commitFingerprint!==commitFingerprint) throw conflict('已提交请求不能修改或再次生成。'); return {state,view:{...view(state),committed:true,alreadyCommitted:true}}; }
    if(input.version!==state.version || !state.pending || input.requestId!==state.pending.requestId || run.phase!=='live') throw conflict('回合已取消、过期或尚未准备。');
    const result=checkReply(input.result),p=state.pending,candidate=p.candidate;
    const strategy=candidate.partnerDecision?.strategy;
    if(strategy && (result.detail!=='' || (strategy==='refuse'&&!/不|拒绝|先别|算了|改天/.test(result.reply)) || (strategy==='clarify'&&!/[？?]|先确认|说清|想知道|问清/.test(result.reply)))) throw bad('措辞与已确定策略不一致，保留原策略重新措辞。');
    assertConsistentOutput(run,p.input,candidate,result);
    const e=candidate.events.at(-1);e.reply=result.reply;e.detail=[e.detail,result.detail].filter(Boolean).join(' ');
    if(strategy==='end') { candidate.phase='ended';candidate.proposal=null;candidate.outcome='对象按本次条件结束了预演。'; }
    return finish(state,candidate,p.requestId,p.fingerprint,commitFingerprint);
  }
  throw bad('未知命令。可用catalog/partner/start/status/prepare/commit/control/coach/export。');
}

function readJSON(file) {
  const bytes=fs.readFileSync(file);
  if(bytes.length>LIMIT) throw bad('本场文件过大。');
  return JSON.parse(bytes.toString('utf8'));
}

function cli(args) {
  const [command,...rest]=args,options={};
  for(let i=0;i<rest.length;i+=2) {
    if(!['--state','--input','--out'].includes(rest[i]) || !rest[i+1] || Object.hasOwn(options,rest[i])) throw bad('命令参数无效。');
    options[rest[i]]=rest[i+1];
  }
  const raw=options['--input']?fs.readFileSync(options['--input'],'utf8'):(process.stdin.isTTY||['catalog','status'].includes(command)?'{}':fs.readFileSync(0,'utf8'));
  if(Buffer.byteLength(raw)>32768) throw bad('输入文件过大。');
  const input=raw.trim()?JSON.parse(raw):{};
  if(['catalog','partner'].includes(command)) return dispatch(null,command,input).view;
  if(!options['--state']) throw bad('请指定本场--state文件；不要写入Skill安装目录或公开仓库。');
  const statePath=path.resolve(options['--state']),lockPath=statePath+'.lock';
  let lock;
  try { lock=fs.openSync(lockPath,'wx',0o600); }
  catch(error) { if(error.code==='EEXIST') throw conflict('本场有其他操作或残留锁；确认没有在途进程后再处理锁文件。'); throw error; }
  let temp;
  try {
    const state=fs.existsSync(statePath)?readJSON(statePath):null;
    const outcome=dispatch(state,command,input);
    if(options['--out']) {
      if(command!=='export') throw bad('--out只用于export。');
      const dir=path.resolve(options['--out']); fs.mkdirSync(dir,{recursive:true});
      const files={review:path.join(dir,'date-review.html'),...(outcome.view.card?{card:path.join(dir,'dating-card.svg')}:{})};
      for(const file of Object.values(files)) if(fs.existsSync(file)) throw conflict('导出文件已存在，请选择新的输出目录。');
      fs.writeFileSync(files.review,outcome.view.html,{flag:'wx',mode:0o600});
      if(files.card) fs.writeFileSync(files.card,outcome.view.card,{flag:'wx',mode:0o600});
      return files;
    }
    if(!['status','coach','export'].includes(command)) {
      if(outcome.state===null) { if(fs.existsSync(statePath)) fs.unlinkSync(statePath); }
      else {
        const data=JSON.stringify(outcome.state);
        if(Buffer.byteLength(data)>LIMIT) throw bad('本场记录过大，请先回看并清空。');
        temp=statePath+'.'+randomUUID()+'.tmp';fs.writeFileSync(temp,data,{flag:'wx',mode:0o600});fs.renameSync(temp,statePath);temp=null;
      }
    }
    return outcome.view;
  } finally {
    if(temp && fs.existsSync(temp)) fs.unlinkSync(temp);
    fs.closeSync(lock);fs.unlinkSync(lockPath);
  }
}

if(require.main===module) {
  try { process.stdout.write(JSON.stringify(cli(process.argv.slice(2)))+'\n'); }
  catch(error) { process.stderr.write(JSON.stringify({error:{code:error.code||'LOCAL_ERROR',message:error.message}})+'\n');process.exitCode=1; }
}
module.exports={dispatch,catalog,cli};
