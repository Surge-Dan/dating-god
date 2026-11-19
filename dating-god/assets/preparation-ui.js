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
    ...base, scene:catalogScene?.id || base.scene, partnerSpec, sceneSpec,
    preparation:{
      brief:state.brief, focus:state.focus, assumptions, unknowns,
      claimedAction:state.claimedAction, question:state.question, fallback:state.fallback,
    },
  };
}
function exportConfig(s){return JSON.stringify(Object.fromEntries(Object.keys(create()).filter(k=>k!=='step').map(k=>[k,s[k]])),null,2);}
function importConfig(text){if(typeof text!=='string'||text.length>32768)throw Error('配置文件过大');const x=JSON.parse(text);const defaults=create();if(x.schemaVersion!==1||Object.keys(x).some(k=>!Object.hasOwn(defaults,k)))throw Error('配置版本或字段不支持');for(const k of ['brief','focus','source','template','place','activity','claimedAction','question','fallback'])if(x[k]!==undefined&&(typeof x[k]!=='string'||x[k].length>500))throw Error('配置字段不合法');if(!x.partnerSpec||typeof x.partnerSpec!=='object'||Array.isArray(x.partnerSpec)||!Array.isArray(x.locks))throw Error('对象配置不合法');if(x.locks.length>fields.length||x.locks.some(path=>!fields.some(([g,k])=>g+'.'+k===path)))throw Error('Invalid lock field');return {...defaults,...x,step:0};}
function render(s,library,{budgetFields="",adultField="",currentScene}={}){const b=(go,label)=>`<button type="button" data-go="${go}">${label}</button>`;const input=(name,label,value)=>`<label class="field"><span>${label}</span><input name="prep.${name}" maxlength="500" value="${esc(value)}"></label>`;const steps=['准备重点','捏一个对象','选择场景','确认开场'];let body='';
if(s.step===0)body=`<p class="subline">围绕一次具体约会练习。这些对象资料是模拟假设，不能预测真人。</p>${input('brief','这次约会和你在意的事（可留空）',s.brief)}<label class="field"><span>这次想练什么</span><select name="prep.focus">${['开场','接话','共同活动','买单','第二站','关系期待','结束'].map(x=>`<option ${x===s.focus?'selected':''}>${x}</option>`).join('')}</select></label>`;
if(s.step===1){body=`<div class="buttons">${b('prep-custom','自定义对象')}${b('prep-random','随机对象')}${b('prep-existing','使用现成人物')}</div>${s.source==='preset'?`<label class="field"><span>现成人物预设</span><select name="prep.presetId">${library.roles.map(r=>`<option value="${r.id}" ${s.presetId===r.id?'selected':''}>${esc(r.name)}</option>`).join('')}</select></label>`:''}<p class="subline">所有标签都可不填。不清楚保持未知；选择标签不代表得到任何亲密许可。</p>${input('name','配置称呼（无需真名）',s.partnerSpec.name||'')}<label class="field"><span>对象性别限制（可不指定）</span><select name="prep.presentation">${[['unspecified','不指定'],['woman','女性'],['man','男性'],['nonbinary','非二元']].map(([v,l])=>`<option value="${v}" ${s.partnerSpec.presentation===v?'selected':''}>${l}</option>`).join('')}</select></label>`;for(const [group,title] of [['appearance','外貌呈现'],['interaction','相处方式'],['lifestyle','生活偏好'],['conditions','本次边界']])body+=`<details class="setup-details" ${group==='interaction'?'open':''}><summary>${title}</summary><div class="form-grid">${fields.filter(f=>f[0]===group).map(([g,k,label,opts])=>{let value=s.partnerSpec[g]?.[k]||'';if(Array.isArray(value))value=value.join('，');return `<div class="prep-field"><label class="field"><span>${label}</span>${opts?`<select name="partner.${g}.${k}"><option value="${k==='hardNo'?'':'unknown'}">不清楚/未指定</option>${opts.split(',').map(p=>{const [v,l]=p.split(':');return `<option value="${v}" ${value===v?'selected':''}>${l}</option>`;}).join('')}</select>`:`<input name="partner.${g}.${k}" value="${esc(value==='unknown'?'':value)}" maxlength="160" placeholder="不清楚可留空">`}</label><label class="check"><input type="checkbox" name="lock.${g}.${k}" ${s.locks.includes(g+'.'+k)?'checked':''}>锁定</label></div>`;}).join('')}</div></details>`;}
if(s.step===2)body=`<label class="field"><span>活动模板</span><select name="prep.template"><option value="">${esc(sceneLabel(currentScene,library)||"沿用已选场景")}</option>${[...library.scenes.map(x=>[x.id,x.name]),['perler','拼豆'],['tennis','网球'],['track','操场相约']].map(([v,l])=>`<option value="${v}" ${s.template===v?'selected':''}>${esc(l)}</option>`).join('')}</select></label>${input('sceneCost','地点预计人均费用（元，可留空使用模板模拟值）',s.sceneCost)}${input('sceneDuration','活动预计时长（分钟，可留空使用模板默认值）',s.sceneDuration)}${input('place','地点名称（可选）',s.place)}<div class="track-fields"${s.template==="track"?"":" hidden"}><label class="field"><span>操场活动</span><select name="prep.activity"><option value="walk">散步</option><option value="jog" ${s.activity==='jog'?'selected':''}>慢跑</option></select></label><label class="check"><input type="checkbox" name="prep.accessConfirmed" ${s.accessConfirmed?'checked':''}>已确认可以进入</label></div><p class="subline">可按本次计划填写时间和花费。自填地点的开放时间和预约需另行确认。</p>${budgetFields}`;
if(s.step===3){const c=compile(s,{scene:currentScene},library).preparation;body=`<article class="ticket"><h2>本次预演卡</h2><p>重点：${esc(s.focus)}${s.brief ? ' · '+esc(s.brief) : ''}</p><p>对象假设：${esc(c.assumptions.join('；')||'未指定，使用中性模拟')}</p><p>关键未知：${esc(c.unknowns.join('、'))}</p><p>地点：${esc(s.place||sceneLabel(s.template||currentScene,library)||'沿用已选场景')}；本次不假定亲密接触许可。</p></article>${adultField}<div class="buttons"><button type="button" data-go="prep-auto" class="primary">开始预演</button>${b('prep-offline','用点选开始')}</div>`;}
return `<section class="panel preparation"><h1 tabindex="-1">${steps[s.step]}</h1>
<div class="prep-content${s.step===1?' partner-layout':''}"><div class="prep-main">${body}</div>${s.step===1?`<aside class="ticket partner-preview"><p class="meta">本场对象</p><h2 id="partner-preview-name">${esc(s.partnerSpec.name||'未命名对象')}</h2><p id="partner-preview-expression">${expressionLabel(s.partnerSpec.interaction?.expression)}</p><p class="subline">你可以先设定相处方式，其他保持未知。</p></aside>`:''}</div>
<div class="buttons">${s.step<3?`<button type="button" data-go="prep-next" class="primary">${['继续捏人','继续选场景','看看本场安排'][s.step]}</button>`:''}${s.step>0?b('prep-back','上一步'):''}${b('prep-exit','返回首页')}</div>
<details class="config-options"><summary>对象配置管理</summary><div class="buttons">${b('prep-save','保存配置')}${b('prep-export','导出配置')}${b('prep-load','读取配置')}${b('prep-delete','删除本机配置')}</div><label class="field"><span>粘贴已导出的配置</span><textarea name="prep-import" maxlength="32768"></textarea></label>${b('prep-import','导入配置')}</details></section>`;}
function expressionLabel(value){return ({reserved:'内敛',gradual:'慢热',outgoing:'外向'})[value]||'表达节奏未指定';}
return {create,compile,exportConfig,importConfig,render,fields,expressionLabel};});
