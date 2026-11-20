(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.DatingPreparation=factory();})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const fields=[
['appearance','hairLength','头发长度','short:短发,medium:中长,long:长发'],['appearance','hairTexture','头发形态','straight:直发,curly:卷发'],['appearance','hairstyle','当前发型','loose:披着,tied:扎起'],['appearance','height','身高描述',''],['appearance','bodyType','体型描述',''],['appearance','clothing','穿着',''],['appearance','visualStyle','视觉气质',''],
['interaction','expression','陌生情境表达','outgoing:外向表达,gradual:逐渐熟悉,reserved:偏简洁'],['interaction','warmth','情感表达','warm:温暖外露,restrained:克制'],['interaction','directness','表达方式','direct:直接,indirect:委婉'],['interaction','autonomy','自主与协商','independent:偏独立,collaborative:一起商量'],['interaction','humor','幽默方式','playful:接梗,self-deprecating:自嘲,plain:直白,serious:认真'],['interaction','curiosity','话题好奇心','curious:愿意追问,concrete:先聊具体事'],
['lifestyle','interests','爱好（逗号分隔）',''],['lifestyle','relationshipGoal','关系目标',''],['lifestyle','pace','生活节奏',''],['lifestyle','environment','环境偏好','quiet:偏安静,lively:偏热闹'],['lifestyle','spending','消费习惯','lean:节制,flexible:灵活'],['conditions','hardNo','本次明确不做','snap-photo:不拍照,no-second-station:不去第二站,stay:不延长停留']];
const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function create(){return {schemaVersion:1,source:'custom',presetId:'',brief:'',focus:'开场',step:0,partnerSpec:{schemaVersion:1,presentation:'unspecified',appearance:{hairLength:'unknown',hairTexture:'unknown',hairstyle:'unknown'},interaction:{expression:'unknown',warmth:'unknown',directness:'unknown',autonomy:'unknown',humor:'unknown',curiosity:'unknown'},lifestyle:{environment:'unknown',spending:'unknown'},conditions:{},provenance:{}},locks:[],sceneCost:'',sceneDuration:'',template:'',place:'',activity:'walk',accessConfirmed:false,claimedAction:'',question:'',fallback:''};}
const newTemplates={perler:"拼豆",tennis:"网球",track:"操场相约"};
const sceneLabel=(id,library)=>newTemplates[id]||library?.scenes.find(x=>x.id===id)?.name||"";
function compile(state, base, library) {
  const partnerSpec = JSON.parse(JSON.stringify(state.partnerSpec));
  if (partnerSpec.presentation==='unspecified' && ['man','woman'].includes(base.player)) {
    partnerSpec.presentation=base.player==='man'?'woman':'man';
  }
  const selected = fields.filter(([group,key]) => {
    const value = partnerSpec[group]?.[key];
    return value && value !== 'unknown' && (!Array.isArray(value) || value.length > 0);
  });
  const assumptions = selected.map(([group,key,label]) => label+'：'+[].concat(partnerSpec[group][key]).join('、'));
  const unknowns = fields.filter(field => !selected.includes(field)).map(field => field[2]);
  const catalogScene = library?.scenes.find(scene => scene.id === state.template);
  const template = state.template || base.scene;
  const place = state.place.trim();
  const hasOverride = place || state.sceneCost !== '' || state.sceneDuration !== '';
  const sceneSpec = (state.template && !catalogScene) || hasOverride ? {
    schemaVersion:1, template, place:place || catalogScene?.place || sceneLabel(template, library),
    activity:state.activity,
    ...(state.sceneCost !== '' ? {budget:Number(state.sceneCost)} : {}),
    ...(state.sceneDuration !== '' ? {duration:Number(state.sceneDuration)} : {}),
    accessConfirmed:state.accessConfirmed,
  } : undefined;
  return {
    ...base, scene:catalogScene?.id || base.scene, presentation:partnerSpec.presentation, partnerSpec, sceneSpec,
    preparation:{
      brief:state.brief, focus:state.focus, assumptions, unknowns,
      claimedAction:state.claimedAction, question:state.question, fallback:state.fallback,
    },
  };
}
function exportConfig(s){return JSON.stringify(Object.fromEntries(Object.keys(create()).filter(k=>k!=='step').map(k=>[k,s[k]])),null,2);}
function importConfig(text){if(typeof text!=='string'||text.length>32768)throw Error('配置文件过大');const x=JSON.parse(text);const defaults=create();if(x.schemaVersion!==1||Object.keys(x).some(k=>!Object.hasOwn(defaults,k)))throw Error('配置版本或字段不支持');for(const k of ['brief','focus','source','template','place','activity','claimedAction','question','fallback'])if(x[k]!==undefined&&(typeof x[k]!=='string'||x[k].length>500))throw Error('配置字段不合法');if(!x.partnerSpec||typeof x.partnerSpec!=='object'||Array.isArray(x.partnerSpec)||!Array.isArray(x.locks))throw Error('对象配置不合法');if(x.locks.length>fields.length||x.locks.some(path=>!fields.some(([g,k])=>g+'.'+k===path)))throw Error('Invalid lock field');return {...defaults,...x,step:0};}
function groupSummary(s,group,limit=Infinity) {
  const items=fields.filter(([name])=>name===group).flatMap(([,key,label,opts])=>{
    const value=s.partnerSpec[group]?.[key];
    if (!value||value==='unknown'||(Array.isArray(value)&&!value.length)) return [];
    return [].concat(value).map(item=>{
      const choice=opts?.split(',').map(pair=>pair.split(':')).find(([id])=>id===item);
      return choice?.[1]||`${label} ${item}`;
    });
  });
  return items.slice(0,limit).join('、')+(items.length>limit?`等${items.length}项`:'');
}
const isKnown=value=>Boolean(value&&value!=='unknown'&&(!Array.isArray(value)||value.length));
function assumptionCount(s,group){
  return fields.filter(([name,key])=>(!group||name===group)&&isKnown(s.partnerSpec[name]?.[key])).length;
}
function randomizableCount(s){
  return fields.filter(([g,k,,choices])=>choices&&k!=='hardNo'&&!s.locks.includes(g+'.'+k)).length;
}
function previewValues(s){
  return {
    'partner-preview-name':s.partnerSpec.name||'未命名对象',
    'partner-preview-expression':({woman:'女性',man:'男性',nonbinary:'非二元'})[s.partnerSpec.presentation]||'性别未指定',
    'partner-preview-traits':groupSummary(s,'interaction',4)||'尚未设置相处方式',
    'partner-preview-unknown':`${fields.length-assumptionCount(s)}项保持未知，现场按中性设定模拟。`,
    'interaction-count':`已设置${assumptionCount(s,'interaction')}/6项`,
    'builder-summary-count':`已设置${assumptionCount(s)}项`,
  };
}
function partnerFields(s,group) {
  return fields.filter(([name])=>name===group).map(([g,key,label,opts])=>{
    const value=[].concat(s.partnerSpec[g]?.[key]||'').join('，');
    const lockName=`lock.${g}.${key}`;
    return `<div class="prep-field"><label class="field"><span>${label}</span>${opts?
      `<select name="partner.${g}.${key}"><option value="${key==='hardNo'?'':'unknown'}">未指定</option>${opts.split(',').map(pair=>{
        const [id,text]=pair.split(':');
        return `<option value="${id}" ${id===value?'selected':''}>${text}</option>`;
      }).join('')}</select>`:
      `<input name="partner.${g}.${key}" value="${esc(value==='unknown'?'':value)}" maxlength="160" placeholder="可留空">`}
      </label><label class="lock-control" title="随机时保留${label}"><input type="checkbox" name="${lockName}" aria-label="随机时保留${label}" ${s.locks.includes(g+'.'+key)?'checked':''}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 0 1 6 0v3m-3 4v2"/></svg></label></div>`;
  }).join('');
}
function renderPartner(s,library,input,b,direct,canUndo) {
  const choices=[['appearance','外貌呈现'],['lifestyle','生活偏好'],['conditions','本次边界']];
  return `<div class="section-head builder-heading"><h2>设置本场对象</h2><div class="random-actions"><button type="button" data-go="prep-random" class="quiet"${randomizableCount(s)?"":" disabled"}>随机一组标签</button>${canUndo?b("prep-undo","撤销","quiet"):""}</div></div><p id="random-lock-note" class="subline"${randomizableCount(s)?" hidden":""}>先解锁至少一项可以随机的标签。</p>
    <div class="builder-identity">${input('name','称呼（可选）',s.partnerSpec.name||'')}<label class="field"><span>对象性别</span><select name="prep.presentation">${[['unspecified','不指定'],['woman','女性'],['man','男性'],['nonbinary','非二元']].map(([id,label])=>`<option value="${id}" ${s.partnerSpec.presentation===id?'selected':''}>${label}</option>`).join('')}</select></label></div>
    ${!direct?`<div class="buttons">${b('prep-custom','自定义对象')}${b('prep-existing','使用现成人物')}</div>`:""}
    ${s.source==='preset'?`<label class="field"><span>现成人物预设</span><select name="prep.presetId">${library.roles.map(r=>`<option value="${r.id}" ${s.presetId===r.id?'selected':''}>${esc(r.name)}</option>`).join('')}</select></label>`:''}
    <fieldset class="builder-core"><legend>相处方式</legend><p class="builder-count" id="interaction-count">${previewValues(s)['interaction-count']}</p><div class="builder-fields">${partnerFields(s,'interaction')}</div></fieldset>
    ${choices.map(([key,label])=>`<details class="setup-details builder-extra" data-group="${key}"><summary><strong>${label}</strong><span data-partner-summary="${key}">${esc(groupSummary(s,key,2)||'可选')}</span></summary><div class="builder-fields">${partnerFields(s,key)}</div></details>`).join('')}`;
}
function render(s,library,{budgetFields="",adultField="",currentScene,frame="",direct=false,sceneCards="",flowBar="",canUndo=false,issue=""}={}){const b=(go,label,style="")=>`<button type="button" data-go="${go}" class="${style}">${label}</button>`;const input=(name,label,value)=>`<label class="field"><span>${label}</span><input name="prep.${name}" maxlength="500" value="${esc(value)}"></label>`;const steps=['准备重点',direct?'角色库':'捏一个对象','选择场景','确认偏好'];let body='';
if(s.step===0)body=`<p class="subline">围绕一次具体约会练习。这些对象资料是模拟假设，不能预测真人。</p>${input('brief','这次约会和你在意的事（可留空）',s.brief)}<label class="field"><span>这次想练什么</span><select name="prep.focus">${['开场','接话','共同活动','买单','第二站','关系期待','结束'].map(x=>`<option ${x===s.focus?'selected':''}>${x}</option>`).join('')}</select></label>`;
if(s.step===1)body=renderPartner(s,library,input,b,direct,canUndo);
if(s.step===2)body=`${sceneCards?`${sceneCards}<div class="custom-summary">`:`<label class="field"><span>活动模板</span><select name="prep.template"><option value="">${esc(sceneLabel(currentScene,library)||"沿用已选场景")}</option>${[...library.scenes.map(x=>[x.id,x.name]),['perler','拼豆'],['tennis','网球'],['track','操场相约']].map(([v,l])=>`<option value="${v}" ${s.template===v?'selected':''}>${esc(l)}</option>`).join('')}</select></label>`}<details class="setup-details custom-scene-details" ${s.template==='track'?'open':''}><summary>地点、预计费用与时长</summary>${input('sceneCost','地点预计人均费用（元，可留空使用模板模拟值）',s.sceneCost)}${input('sceneDuration','活动预计时长（分钟，可留空使用模板默认值）',s.sceneDuration)}${input('place','地点名称（可选）',s.place)}<div class="track-fields"${s.template==="track"?"":" hidden"}><label class="field"><span>操场活动</span><select name="prep.activity"><option value="walk">散步</option><option value="jog" ${s.activity==='jog'?'selected':''}>慢跑</option></select></label><label class="check"><input type="checkbox" name="prep.accessConfirmed" ${s.accessConfirmed?'checked':''}>已确认可以进入</label></div><p class="subline">可按本次计划填写时间和花费。自填地点的开放时间和预约需另行确认。</p></details><details class="setup-details custom-scene-details"><summary>本场预算与可用时间</summary>${budgetFields}</details>${sceneCards?"</div>":""}`;
if(s.step===3){
  const {unknowns}=compile(s,{scene:currentScene},library).preparation;
  const selected=['interaction','appearance','lifestyle','conditions'].map(group=>groupSummary(s,group)).filter(Boolean);
  body=`${issue?`<aside class="plan-warning" role="alert" tabindex="-1"><h2>需要调整本场安排</h2><p>${esc(issue)}</p>${b("prep-back","返回选场景","quiet")}</aside>`:""}
    <article class="ticket prep-ticket"><h2>本次预演卡</h2><dl>
      <dt>对象</dt><dd>${esc(s.partnerSpec.name||'自定义对象')}</dd>
      <dt>地点</dt><dd>${esc(s.place||sceneLabel(s.template||currentScene,library)||'沿用已选场景')}</dd>
      <dt>对象设定</dt><dd>${esc(selected.join('；')||'未指定，使用中性模拟')}</dd>
    </dl>${unknowns.length?`<details><summary>${unknowns.length}项留白设定</summary><p>${esc(unknowns.join('、'))}</p></details>`:""}</article>
    <label class="field prep-focus"><span>这次想练什么</span><select name="prep.focus">${['开场','接话','共同活动','买单','第二站','关系期待','结束'].map(x=>`<option ${x===s.focus?'selected':''}>${x}</option>`).join('')}</select></label>
    <details class="setup-details prep-note"><summary>这次见面想补充的事（可选）</summary>${input("brief","约会准备备注",s.brief)}</details>
    ${adultField}<div class="buttons"><button type="button" data-go="prep-auto" class="primary">开始预演</button>${b('prep-offline','用点选开始')}</div>`;
}

const preview=previewValues(s);
return `<section class="panel preparation preparation-step-${s.step}${flowBar?" with-confirm":""}">${typeof frame==="object"?frame.crumb:""}<h1 tabindex="-1">${steps[s.step]}</h1>${typeof frame==="object"?frame.controls:frame}
<div class="prep-content${s.step===1?' partner-layout':''}"><div class="prep-main">${body}</div>${s.step===1?`<aside class="partner-preview"><p class="profile-meta">对象预览</p><h2 id="partner-preview-name">${esc(preview['partner-preview-name'])}</h2><p id="partner-preview-expression">${esc(preview['partner-preview-expression'])}</p><p id="partner-preview-traits">${esc(preview['partner-preview-traits'])}</p><p class="subline" id="partner-preview-unknown">${esc(preview['partner-preview-unknown'])}</p><p class="subline">锁住标签后，随机生成时会保留它们。</p></aside>`:""}</div>
${flowBar}<div class="buttons">${s.step<3&&!flowBar?`<button type="button" data-go="prep-next" class="primary">${['继续捏人','继续选场景','看看本场安排'][s.step]}</button>`:''}${s.step>0&&!flowBar?b('prep-back','上一步'):''}${b('prep-exit','返回首页','quiet')}</div>
<details class="config-options"><summary>对象配置管理</summary><div class="buttons">${b('prep-save','保存配置')}${b('prep-export','导出配置')}${b('prep-load','读取配置')}${b('prep-delete','删除本机配置')}</div><label class="field"><span>粘贴已导出的配置</span><textarea name="prep-import" maxlength="32768"></textarea></label>${b('prep-import','导入配置')}</details></section>`;}
function expressionLabel(value){return ({reserved:'内敛',gradual:'慢热',outgoing:'外向'})[value]||'表达节奏未指定';}
return {create,compile,exportConfig,importConfig,render,fields,expressionLabel,groupSummary,assumptionCount,randomizableCount,previewValues};});
