(function () {
  const app = document.getElementById("app");
  const status = document.getElementById("status");
  const engine = window.DatingEngine;
  const library = window.DatingContent;
  const report = window.DatingReport;
  const display = { woman: "女性", man: "男性", nonbinary: "非二元" };
  const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

  const radar = window.RadarUI.create({api,status,onPractice:startPractice,getDraft:()=>utterance,setDraft:text=>{utterance=String(text);const input=app.querySelector('[name="utterance"]');if(input)input.value=utterance;}});
  let preparation = window.DatingPreparation.create();
  let importText = "";
  let modelMode = false;
  let session = null;
  let busy = false;
  let generation = 0;
  let utterance = "";
  let modelOpening, originalOpening;
  let retryTurn = null;
  const modes = {mellow:"新手尝鲜",spark:"心动试探",tension:"暧昧过招",hard:"地狱修罗场"};
  const modeHelp = {mellow:"先从具体小事开口，也可以直接表达需要。",spark:"留意对方有没有回问，给试探留一点余地。",tension:"可能出现含糊回应与期待落差，可以澄清，也可以收回提议。",hard:"关系张力更高。你可以放慢、拒绝或离开，不必证明自己。"};
  async function api(path, body) {
    const response = await fetch(path, body ? {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)} : {});
    const value = await response.json();
    if (!response.ok) {
      const error = new Error(value.error?.message || "本地服务请求失败，请重试。");
      error.code = value.error?.code;
      throw error;
    }
    return value;
  }
  async function readConnection() {
    if (!/^https?:$/.test(window.location?.protocol || "")) return "local-service";
    try { return (await api("/api/config")).available ? "configured" : "unconfigured"; }
    catch { return "unreachable"; }
  }
  async function detectModel() {
    busy = true;
    const ticket = ++generation;
    try {
      const connection = await readConnection();
      if (ticket !== generation) return false;
      homeConnection = connection;
      return connection === "configured";
    }
    finally { if (ticket === generation) busy = false; }
  }
  async function fetchModel(path, body) {
    try { return await api(path,body); }
    catch(error){
      if(task&&path==="/api/turn"&&(!error.code||error.code==="CONFLICT")){
        try {
          const latest=await api("/api/control",{sessionId:body.sessionId,command:"status",requestId:body.requestId});
          if(latest.committed)return latest;
          error.deliveryUncertain=Boolean(latest.pending);
          error.syncState=latest;
        } catch(statusError) {
          if(statusError.code==="SESSION_NOT_FOUND")throw statusError;
          error.deliveryUncertain=true;
        }
      }
      throw error;
    }
  }
  async function modelRequest(path, body, done) {
    if (busy) return;
    busy = true;
    const ticket = ++generation;
    if (screen === "live") show("live");
    try {
      const value = await fetchModel(path, body);
      if (ticket !== generation) return;
      session = {sessionId:value.sessionId, version:value.version};
      run = value.run;
      radar.setContext(run);
      radar.attach(value.sessionId,run?.branchFrom !== null,!!run?.practiceRuleId);
      if (value.radar) radar.update(value.radar);
      busy = false;
      done(value);
    } catch (error) {
      if (ticket !== generation) return;
      busy = false;
      const latest=error.syncState;
      if(latest&&session&&latest.sessionId===session.sessionId&&latest.run&&Number.isInteger(latest.version)&&latest.version>=session.version){
        session={sessionId:latest.sessionId,version:latest.version};
        run=latest.run;
        radar.setContext(run);
        radar.attach(latest.sessionId,run?.branchFrom!==null,!!run?.practiceRuleId);
        if(latest.radar)radar.update(latest.radar);
        if(screen==="live"&&run.phase==="ended")return finish();
      }
      if(task&&path==="/api/session"){
        const entry={taskSetup:"task-start",preparation:"prep-auto",invitation:"meet"}[screen];
        if(entry)return connectionFailed(entry,error);
      }
      if (screen === "live"&&task) {
        if(error.deliveryUncertain&&retryTurn)retryTurn.uncertain=true;
        liveError=error.code==="SESSION_NOT_FOUND"?"本场已失效。你可以查看已经确认的对话，或保留设置重新开始。":retryTurn?.uncertain?"暂时没能确认这句是否送达。核对之后再发送。":error.message;
        if(error.code==="SESSION_NOT_FOUND")sessionExpired=true;
        show("live","",false);
      } else if (screen === "live") show("live", error.message);
      else status.textContent = error.message;
    }
  }
  async function control(command, extra = {}) {
    ++generation;
    busy = false;
    if (!session) return;
    const pending=retryTurn;
    const requestId=pending&&["cancel","pause","end"].includes(command)?pending.requestId:null;
    return modelRequest("/api/control", {sessionId:session.sessionId, command, ...extra,...(requestId?{requestId}:{})}, value => {
      if(value.committed&&pending?.text===utterance.trim())utterance="";
      retryTurn=null;triedTurn="";liveError="";
      if (command === "end"||run.phase==="ended"&&command!=="replay") finish();
      else {
        if(command==="replay"){
          modelOpening=value.opening||originalOpening;
          utterance="";triedTurn="";polish=null;coachOpen=false;selectedDraft=-1;suggestionText="";
        }
        show("live",command==="cancel"?(value.committed?"这句已发出，回应已同步。":"已取消等待，未发出的草稿还在。"):"");
      }
    });
  }
  async function sendModel(payload) {
    if (!session || busy || run.phase !== "live") return;
    if(retryTurn?.uncertain){
      const pending=retryTurn;
      return modelRequest("/api/control",{sessionId:session.sessionId,command:"status",requestId:pending.requestId},value=>{
        if(value.committed&&pending.text===utterance.trim())utterance="";
        if(!value.pending){retryTurn=null;triedTurn="";liveError="";}
        if(run.phase==="ended")finish();else show("live",value.committed?"这句已发出，回应已同步。":value.pending?"这句仍在处理。":"这句没有发出，可以重新发送。");
      });
    }
    liveError="";
    radar.before();
    if(task)triedTurn=payload.text||"";
    const identity = JSON.stringify({...session, ...payload});
    if (!retryTurn || retryTurn.identity !== identity) retryTurn = {identity, requestId:crypto.randomUUID(),text:payload.text};
    return modelRequest("/api/turn", {...session, requestId:retryTurn.requestId, ...payload}, () => {
      retryTurn = null;
      if(payload.text)utterance="";
      selectedDraft=-1;suggestionText="";coachOpen=false;triedTurn="";polish=null;
      if (run.phase === "ended") finish();
      else show("live");
    });
  }
  const goals=["刚坐下不知道说什么","聊成一问一答","想说不同意见","不知道怎么结束","想提出下次见面"];
  let task=null, analysis=null, reportLoading=false, reportError="", coachOpen=false;
  let polish=null, polishRequest=null;
  let checklist={}, includeFull=false, selectedDraft=-1, suggestionText="", triedTurn="";
  const goalNotes=["找一句不生硬的开场。","接住对方刚说的一个细节。","说出自己的偏好，给对方留个选择。","对方要走时，把话自然收住。","表达兴趣，也给彼此留点空间。"];
  const goalActivities=["A01","A08","A02","A08","A05"];
  const moments=["opening","follow-up","disagree","close","next-date"];
  const momentNotes={opening:"刚见面，话题还没展开。", "follow-up":"对方会先说一件具体的事。", disagree:"对方会提出一个可商量的选择。", close:"见面快结束了，你可以决定怎样道别。", "next-date":"见面快结束了，你可以表达是否想再见。"};
  let failedEntry=null;
  let failedScreen=null, homeConnection=null, legacyNotes=false, legacyError=false, offline=null, reportScroll=0;
  let connectionError="", picker=null, homeSceneId=null, appliedPartner=null, appliedScene=null, sceneDraft=null;
  let pendingKind="", setupNumbers={}, modeExplicit=false;
  let liveError="", sessionExpired=false, pendingReplay=null;
  function connectionOptions(home=false){
    if(homeConnection===null||homeConnection==="configured"&&failedScreen!==screen)return "";
    const missing=homeConnection==="unconfigured", local=homeConnection==="local-service";
    const title=failedScreen===screen&&connectionError?connectionError:missing?"自由聊天尚未连接":local?"自由聊天需要本地服务":"暂时连不到本地服务";
    return `<aside class="connection-note" data-state="${homeConnection==="unreachable"?"error":""}" tabindex="-1"><strong>${esc(title)}</strong><p>${home?"你可以先浏览人物和场景。":"本场的设置还在。收尾示例使用预设选项。"}</p><div class="buttons connection-actions">${button("connection-help","查看连接方式","quiet")}${!home&&failedScreen===screen&&!missing&&!local?button("retry-connection","重试连接","quiet"):""}${home?"":button("offline-practice","看收尾演练示例")}</div></aside>`;
  }
  function connectionFailed(entry,error){
    failedEntry=entry;
    failedScreen=screen;
    connectionError=error?.code==="NOT_CONFIGURED"?"自由聊天尚未连接":error?.message||"";
    if(error?.code==="NOT_CONFIGURED")homeConnection="unconfigured";
    show(screen,"",false);
    app.querySelector(".connection-note")?.focus();
  }
  function newTask(kind) {
    if(suspended||screen==="live"||busy)return;
    if(task?.kind===kind&&!run){show("taskSetup");return;}
    reset(null);
    task={kind,goal:kind==="practice"?"":"自然开场",duration:kind==="practice"?"short":"full",style:"natural"};
    recommendTaskScene();
    show("taskSetup");
  }

  function requestTask(kind, opener) {
    if(task&&!run&&task.kind!==kind&&(preferredRoleId||appliedPartner||!taskSceneDefault||task.context||checklist.plan||task.kind==="practice"&&task.goal)){
      pendingKind=kind;
      openFlowDialog("switch-task",opener);
      return;
    }
    newTask(kind);
  }

  function ensureTask() {
    if (!task || run) newTask("rehearsal");
  }

  function chooseForTask(sceneId) {
    ensureTask();
    config.scene=sceneId;
    appliedScene=null;
    taskSceneDefault=false;
    planIssue="";
  }

  function openPicker(kind, opener) {
    const nested=Boolean(picker);
    picker={kind,origin:picker?.origin||screen,opener:picker?.opener||opener};
    if(kind==="role"){
      selectedRoleId=preferredRoleId;
      roleDetailOpen=false;
    } else if(kind==="scene") {
      sceneCatalogSelected=config.scene;
      sceneCatalogSource="本场已选";
      sceneCatalogCategory="全部";
    } else if(kind==="partner") {
      preparation=appliedPartner?JSON.parse(JSON.stringify(appliedPartner)):window.DatingPreparation.create();
      preparation.step=1;
      directPreparation=true;
      partnerUndo=null;
      activeBuilderGroup="";
    } else if(kind==="custom-scene") {
      sceneDraft=appliedScene?{...appliedScene}:{schemaVersion:1,template:sceneCatalogSelected||config.scene,place:"",activity:"walk",accessConfirmed:false};
    }
    const destination={role:"roles",scene:"sceneCatalog",partner:"preparation","custom-scene":"sceneEditor"}[kind];
    show(destination,"",true,{replace:nested});
  }

  let focusAfterReturn="";
  function returnFromPicker(apply=false) {
    const previous=picker;
    if(!previous)return;
    picker=null;
    const destination=apply?"taskSetup":previous.origin;
    if(destination===previous.origin&&window.history?.state?.picker){
      focusAfterReturn=previous.opener;
      window.history.back();
    } else {
      show(destination,"",true,{replace:true});
      app.querySelector(`[data-go="${previous.opener}"]`)?.focus();
    }
  }
  let screen;
  let config;
  let run;
  let original;
  let alternative;
  let draft;
  let candidates;
  let candidateIndex;
  let hint;
  let cardPreviewUrl;
  let homeRecommendations = [];
  let homeRerolling = false;
  let roleLimit = 12;
  let partnerUndo = null;
  let activeBuilderGroup="";
  let suspended = false;
  let quickEntry = false;
  let directPreparation = false;
  let preferredRoleId = null;
  let selectedRoleId = null;
  let roleSearch = "";
  let roleDetailOpen = false;
  let sceneCatalogSelected = null;
  let sceneCatalogCategory = "全部";
  let sceneCatalogSource = "";
  let catalogFromPlan = false;
  let homeCategory = "全部";
  let roleGender = "";
  let roleTrait = "";
  let settingsCategory = "全部";
  let customCategory = "全部";
  let planIssue = "";
  let preparationIssue = "";
  let confirming = false;
  let sceneFirst = false;

  function shuffle(items, random) {
    const result = [...items];
    for (let i=result.length-1;i>0;i--) {
      const j=Math.floor(random()*(i+1));
      [result[i],result[j]]=[result[j],result[i]];
    }
    return result;
  }
  const secureRandom = () => crypto.getRandomValues(new Uint32Array(1))[0]/0x100000000;
  function dealHomeScenes(category, previous=[], random=secureRandom) {
    const old=new Set(previous.map(item=>item.id));
    const candidates=shuffle(byCategory(category),random).sort((a,b)=>Number(old.has(a.id))-Number(old.has(b.id)));
    const chosen=[];
    if (category==="全部") {
      const categories=new Set();
      for (const item of candidates) {
        if (categories.has(item.category)) continue;
        chosen.push(item);
        categories.add(item.category);
        if (chosen.length===4) break;
      }
    }
    for (const item of candidates) {
      if (chosen.length===4) break;
      if (!chosen.includes(item)) chosen.push(item);
    }
    const result=shuffle(chosen,random);
    if (result.length>1 && result.every((item,i)=>item.id===previous[i]?.id)) result.push(result.shift());
    return result;
  }

  function reset(next = "cover") {
    ++generation; retryTurn = null; busy = false; session = null; modelMode = false; utterance = "";
    preparation = window.DatingPreparation.create();
    failedScreen=null;offline=null;taskSceneDefault=true;primarySessionId=null;task=null;polish=null;polishRequest=null;analysis=null;reportLoading=false;reportError="";coachOpen=false;checklist={};includeFull=false;selectedDraft=-1;suggestionText="";triedTurn="";
    picker=null;appliedPartner=null;appliedScene=null;sceneDraft=null;connectionError="";liveError="";sessionExpired=false;pendingReplay=null;setupNumbers={};pendingKind="";modeExplicit=false;
    if(!homeRecommendations.length)homeRecommendations=dealHomeScenes(homeCategory);
    homeRerolling=false;roleLimit=12;partnerUndo=null;activeBuilderGroup="";suspended=false;
    quickEntry = directPreparation = false;
    importText = "";
    preferredRoleId = null;
    selectedRoleId = null;
    roleSearch = "";
    roleDetailOpen = false;
    sceneCatalogSelected = null;
    sceneCatalogCategory = "全部";
    sceneCatalogSource="";catalogFromPlan=false;
    settingsCategory = customCategory = "全部";
    roleGender = roleTrait = planIssue = preparationIssue = "";
    confirming = sceneFirst = false;
    config = {
      stage:"first", intent:"undecided", exclusivity:"unspecified", budget:300, timeBudget:180, alcohol:false, experience:"novice", diet:"",
      mode: "mellow", adult: false, presentation: "unspecified", player: "unspecified", traits: [],
      interest: "", scene: "S02", avoid: [], nickname: "", expectation: "",
      surprise: false, guidance: false, seed: crypto.getRandomValues(new Uint32Array(1))[0],
    };
    run = original = alternative = null;
    modelOpening=originalOpening=null;
    draft = {
      selected: null, note: "", accepted: "", confirmed: false,
      includeNote: false, includeExperiment: false, includeExpectation: false,
    };
    candidates = [];
    candidateIndex = 0;
    hint = false;
    if(next)show(next, "", true, {replace:true});
  }

  const button = (id, label, style = "") =>
    `<button type="button" data-go="${id}" class="${style}">${label}</button>`;
  const heading = (index, title, desc = "") =>
    `<p class="kicker">${index}</p><h1 tabindex="-1">${title}</h1>${desc ? `<p class="subline">${desc}</p>` : ""}`;
  const option = (value, label, active) =>
    `<option value="${value}"${value === active ? " selected" : ""}>${label}</option>`;
  const check = (name, label, checked, value = "") =>
    `<label class="check"><input type="checkbox" name="${name}" value="${value}"${checked ? " checked" : ""}> <span>${label}</span></label>`;

  const icon = name => window.DatingIcons?.[name] || "";

  const tones = {"吃喝":"food","文娱":"culture","户外":"outdoors","游戏":"games","手作":"craft","运动":"sport","夜间":"night","逛街":"shops"};
  function categoryIcon(category) {
    const tone=tones[category]||"outdoors";
    return `<span class="category-icon tone-${tone}" aria-hidden="true">${icon(tone)}</span>`;
  }
  function categoryFilters(kind, selected, categories=Object.keys(tones)) {
    return `<div class="filter-chips" role="group" aria-label="场景分类">${["全部",...categories].map(category=>`<button type="button" data-${kind}-category="${category}" aria-pressed="${selected===category}">${category}</button>`).join("")}</div>`;
  }
  const byCategory = category => library.scenes.filter(scene=>category==="全部"||scene.category===category);
  const sceneFacts = scene => `${scene.duration}分钟 · 模拟人均${scene.cost}元`;
  function sceneCard(scene, attribute, { selected, issue } = {}) {
    return `<button type="button" class="scene-tile choice-card tone-${tones[scene.category]||"outdoors"}" data-${attribute}="${esc(scene.id)}"${selected===undefined?"":` aria-pressed="${selected}"`}>
      <span class="scene-tile-top">${categoryIcon(scene.category)}<span>${esc(scene.category)}</span></span>
      <strong>${esc(scene.name)}</strong>
      <span class="scene-description">${esc(scene.description||scene.intro)}</span>
      <small>${scene.metrics||sceneFacts(scene)}${issue?` <span class="scene-warning">${esc(issue)}</span>`:""}</small></button>`;
  }
  function homeSceneCards() {
    return homeRecommendations.map(scene=>sceneCard(scene,"home-scene",{selected:scene.id===homeSceneId})).join("");
  }
  function homeRefresh() {
    const count=byCategory(homeCategory).length;
    return `<button type="button" data-go="reroll" class="quiet refresh-button"${count<2?" disabled":""}>${icon("refresh")}${count>1&&count<=4?"换个顺序":"换一组推荐"}</button>${count===1?'<small class="subline">此分类只有1个场景</small>':""}`;
  }
  function cover() {
    if (suspended) return `<section class="panel suspended-view"><h1 tabindex="-1">本场已暂停</h1><p>你的进度还在。可以回来继续，或结束后去回看。</p><div class="buttons">${button("return-live","返回约会现场","primary")}${button("end-suspended","结束并回看")}</div></section>`;
    return `<section class="cover home-page">
      <header class="home-heading"><h1 tabindex="-1">约会预演</h1><p class="home-deck">先模拟一场约会，再复盘自己的选择。</p></header>
      ${task&&!run?`<aside class="session-resume"><strong>还有一场在准备</strong><p>${esc(task.goal||task.context||"尚未选练习重点")} · ${esc(setupScene()?.name||"场景待选")}</p>${button("continue-setup","继续准备","primary")}</aside>`:""}
      <div class="home-layout">
        <article class="start-panel task-card"><span class="task-tag">赴约前预演</span><h2>我快要去约会了</h2><p>按你的情况选对象和地点，练完带走一张赴约清单。</p>${button("new-rehearsal","准备这次见面","primary")}</article>
        <article class="practice-slip task-card"><span class="task-tag">约会能力练习</span><h2>我想练一个约会瞬间</h2><p>比如TA说还有事，你怎么收尾？练完带走一句可以重试的话。</p>${button("new-practice","挑一个想练的时刻")}</article>
      </div>
      <p class="home-sample">${button("offline-practice","先看一个2分钟的收尾示例 →","quiet")}</p>
      <aside class="review-preview" aria-label="复盘预览"><header><h2>复盘长这样</h2><p>示例 · 公园散步</p></header><blockquote><p><strong>TA</strong> 我得先走了，晚点还有事。</p><p><strong>你</strong> 这么快啊，不能再走会儿吗？</p></blockquote><p class="preview-takeaway"><strong>下次可试</strong> 好呀，今天聊得挺开心。下次有空再散步。</p></aside>
      <div id="home-connection">${connectionOptions(true)}</div>
      <section class="home-scenes" aria-labelledby="home-scenes-title">
        <div class="section-head"><h2 id="home-scenes-title">探索场景</h2>${button("all-scenes","浏览全部场景 →","quiet")}</div>
        <div class="filter-bar">${categoryFilters("home",homeCategory)}<div id="home-refresh">${homeRefresh()}</div></div>
        <div id="home-scene-preview">${homeScenePreview()}</div><p id="recommendation-update" class="sr-only" aria-live="polite"></p><div class="home-scene-list" id="home-scene-grid">${homeSceneCards()}</div>
      </section>
      <p class="home-note">场景与人物为虚构设定。成年确认后可以开始预演。</p>
    </section>`;
  }

  function scenePreview(scene, action="", label="") {
    if (!scene) return "";
    return `<aside class="catalog-preview ticket"><h2 tabindex="-1">${esc(scene.name)}</h2><p>${esc(scene.description||scene.intro)}</p><p class="meta">${esc(sceneFacts(scene))}</p>${action?button(action,label,"primary"):""}</aside>`;
  }

  function homeScenePreview(){
    return scenePreview(engine.sceneById(homeSceneId),"use-home-scene","用这个场景准备一场");
  }

  const roleLabels = {woman:"女性",man:"男性",nonbinary:"非二元",unspecified:"未指定"};
  function roleTabs(custom) {
    return `<div class="segment library-tabs" role="group" aria-label="选人方式">
      <button type="button" data-go="roles" aria-pressed="${!custom}">现成角色</button>
      <button type="button" data-go="custom-entry" aria-pressed="${custom}">自己捏人</button>
    </div>`;
  }
  function crumb(label, go="home", parent="首页") {
    return `<div class="breadcrumb">${button(go,parent,"quiet")}<span aria-hidden="true">/</span><span>${label}</span></div>`;
  }
  function steps(current) {
    return `<ol class="flow-steps" aria-label="赴约进度">${["选人","选场景","确认偏好","开始预演"].map((label,index)=>`<li${index===current?' aria-current="step"':""} class="${index<current?"done":""}"><span aria-hidden="true">${index<current?"✓":index+1}</span>${label}</li>`).join("")}</ol>`;
  }
  function avatar(role, large=false) {
    const tone=tones[engine.sceneById(role.scenes[0])?.category]||"culture";
    return `<span aria-hidden="true" class="role-initial tone-${tone}${large?" role-initial-large":""}">${esc(role.name.slice(0,1))}</span>`;
  }
  function filteredRoles() {
    const query=roleSearch.trim().toLocaleLowerCase();
    return library.roles.filter(role=>{
      const search=[role.name,role.bio,...role.interests.map(id=>library.interests[id]||id),...role.traits.map(id=>library.traits[id]||id)].join(" ").toLocaleLowerCase();
      return (!query||search.includes(query))&&(!roleGender||role.presentation===roleGender)&&(!roleTrait||role.traits.includes(roleTrait));
    });
  }
  function roleLibrary() {
    const roles=filteredRoles();
    const selected=engine.roleById(selectedRoleId);
    const visible=roles.slice(0,roleLimit);
    if (selected && roles.includes(selected) && !visible.includes(selected)) visible[visible.length-1]=selected;
    const choosing=picker?.kind==="role";
    const title=choosing?"为本场选对象":"角色库";
    const chooseLabel=choosing?"使用这个对象":"用这个角色准备一场";
    const outside=selected&&!roles.includes(selected);
    const badge = selected && engine.sceneById(selected.scenes[0])?.category;
    const supportsScene = role => role.scenes.includes(appliedScene?window.DatingPreparationScenes.compatibilitySceneId(appliedScene.template):config.scene);
    return `<section class="panel role-library${selected?" has-role-choice":""}">
      ${choosing?crumb(title,"cancel-picker","返回本场"):crumb(title)}<div class="section-head"><h1 tabindex="-1">${title}</h1>${button("random-role","按条件推荐一位","quiet")}</div>
      ${roleTabs(false)}
      ${choosing?`<div class="context-strip"><span>本场地点 <strong>${esc(setupScene()?.name||"尚未选择")}</strong></span></div>`:""}
      <div class="library-toolbar"><label class="search-field"><span class="sr-only">搜索角色</span><input name="role-search" type="text" inputmode="search" value="${esc(roleSearch)}" placeholder="搜名字、兴趣或相处方式" autocomplete="off"></label>
      <label><span class="sr-only">按性别筛选</span><select name="role-gender">${[["","全部性别"],["woman","女性"],["man","男性"]].map(([key,label])=>option(key,label,roleGender)).join("")}</select></label>
      <label><span class="sr-only">按相处节奏筛选</span><select name="role-trait">${[["","所有相处节奏"],...Object.entries(library.traits)].map(([key,label])=>option(key,esc(label),roleTrait)).join("")}</select></label></div>
      <div class="library-layout"><section class="role-results"><div class="section-head"><h2>现成角色</h2><span class="library-count" aria-live="polite">${roles.length}位角色</span></div>
      <div class="role-list">${roles.length?visible.map(role=>`<button type="button" data-role="${esc(role.id)}" class="role-row choice-card" aria-pressed="${selected?.id===role.id}">${avatar(role)}
        <span class="role-row-copy"><strong>${esc(role.name)}${choosing?`<b class="compat-tag${supportsScene(role)?"":" not-compatible"}">${supportsScene(role)?"适配本场":"场景不适配"}</b>`:""}</strong><small>${role.age}岁 · ${esc(roleLabels[role.presentation])} · ${esc(role.traits.slice(0,2).map(id=>library.traits[id]).join("、"))}</small><span>${esc(role.bio)}</span></span></button>`).join(""):`<div class="empty-filter">${icon("people")}<h3>没有符合筛选的角色</h3><p>试试少选一个条件，或按你的印象捏人。</p>${button("clear-role-search","清空筛选","primary")} ${button("custom-entry","自己捏人","quiet")}</div>`}</div>${roles.length>roleLimit?button("more-roles",`加载更多角色（还有${roles.length-roleLimit}位）`,"more-roles"):""}</section>
      ${selected?`<aside class="role-profile tone-${tones[badge]||"culture"} ${roleDetailOpen?"profile-open":""}" id="role-details">
        <div class="profile-top">${avatar(selected,true)}<div><h2 tabindex="-1">${esc(selected.name)}</h2><p>${selected.age}岁 · ${esc(roleLabels[selected.presentation])}</p></div></div>
        <div class="profile-body"><p>${esc(selected.bio)}</p><blockquote>“${esc(selected.greeting)}”</blockquote>
        <dl><dt>兴趣</dt><dd>${esc(selected.interests.map(id=>library.interests[id]).filter(Boolean).join("、"))}</dd><dt>常见场景</dt><dd>${esc(selected.scenes.map(id=>engine.sceneById(id)?.name).filter(Boolean).join("、"))}</dd><dt>适合模式</dt><dd>${esc((selected.modes||Object.keys(modes)).map(id=>modes[id]).join("、"))}</dd></dl></div>
        <div class="buttons profile-actions">${button("role-list-close","收起档案","quiet")}${button("choose-role-profile",chooseLabel,"primary")}</div>
        </aside>`:'<aside class="role-profile role-placeholder" id="role-details"><h2>先选一位角色</h2><p>点按角色卡，查看开场方式与适合的场景。</p></aside>'}</div>
      ${selected?selectionBar("role-confirm-bar",selected.name,outside?"当前筛选未显示":"","choose-role",chooseLabel,{extra:button("role-list",roleDetailOpen?"收起档案":"查看档案","quiet")}):""}
    </section>`;
  }

  function selectionBar(id, label, detail, action, title, {disabled=false,extra="",leading=""}={}) {
    return `<div id="${id}" class="scene-confirm-bar"><div class="selection-summary" aria-live="polite">${leading}<div><strong>${esc(label)}</strong>${detail?`<small>${esc(detail)}</small>`:""}</div></div>
      <div class="selection-actions">${extra}<button type="button" data-go="${action}" class="primary"${disabled?" disabled":""}>${title}</button></div></div>`;
  }

  function catalogCards() {
    return byCategory(sceneCatalogCategory).map(scene=>sceneCard(scene,"scene-choice",{selected:sceneCatalogSelected===scene.id})).join("");
  }
  function catalogBar() {
    const selected=engine.sceneById(sceneCatalogSelected);
    const outside=selected&&sceneCatalogCategory!=="全部"&&selected.category!==sceneCatalogCategory;
    const choosing=picker?.kind==="scene";
    const issue=choosing&&selected&&sceneIssue(selected);
    return selectionBar("catalog-bar", selected?.name||"先选一个场景",
      selected?[outside?"在当前分类外":"",issue||sceneFacts(selected),sceneCatalogSource].filter(Boolean).join(" · "):"",
      "use-scene",choosing?"使用这个场景":"用这个场景准备一场",{disabled:!selected});
  }
  function sceneCatalog() {
    const count=byCategory(sceneCatalogCategory).length;
    const choosing=picker?.kind==="scene";
    const title=choosing?"为本场选场景":"场景";
    return `<section class="panel scene-catalog with-confirm">${choosing?crumb(title,"cancel-picker","返回本场"):crumb(title)}
      <div class="section-head"><h1 tabindex="-1">${title}</h1><span id="catalog-count" class="library-count" aria-live="polite">${sceneCatalogCategory} · ${count}种</span></div>
      <p class="subline">${choosing?"应用场景后返回本场，已选对象会保留。":"选中场景可以先了解现场，再决定是否用它准备一场。"}</p>
      ${button("edit-custom-scene","自定义地点","quiet")}
      <div id="catalog-preview">${scenePreview(engine.sceneById(sceneCatalogSelected))}</div>
      ${categoryFilters("scene",sceneCatalogCategory)}
      <div id="catalog-grid" class="scene-grid">${catalogCards()}</div>${catalogBar()}</section>`;
  }
  function taskSetup() {
    const short=task.kind==="practice";
    const radios=(name,values,notes={})=>Object.entries(values).map(([key,label])=>`<label class="task-choice"><input type="radio" name="task-${name}" value="${key}"${task[name]===key?" checked":""}><span>${label}${notes[key]?`<small>${notes[key]}</small>`:""}</span></label>`).join("");
    const scene=setupScene();
    const match=resolveSetup();
    const role=appliedPartner?appliedPartner.partnerSpec.name||"自定义对象":engine.roleById(preferredRoleId)?.name||match.role?.name||"按条件匹配";
    const summary=`<aside class="${short?"moment-preview":"prep-summary"}" aria-label="本场安排">
      <h2>${short?"即将进入的场面":"本场安排"}</h2>
      <p id="moment-note">${esc(momentNotes[task.moment]||"对方会从眼前的情境开口。")}</p>
      <dl><dt>对象</dt><dd id="task-role-note">${esc(role)}${!appliedPartner&&!preferredRoleId&&match.role?" · 推荐":""}</dd><dt>地点</dt><dd id="task-scene-note">${esc(scene?.name||"未选择")}${taskSceneDefault?" · 推荐":""}</dd></dl>
      <div class="buttons prep-edit-actions">${button("edit-role","换对象","quiet")}${button("edit-scene","换场景","quiet")}${button("task-custom","自己捏人","quiet")}</div>
    </aside>`;
    const fields=short?`<div class="task-goals" role="group" aria-label="练习重点">${goals.map((goal,index)=>`<button type="button" class="choice-card" data-task-goal="${esc(goal)}" aria-pressed="${task.moment===moments[index]}"><strong>${esc(goal)}</strong><small>${goalNotes[index]}</small></button>`).join("")}</div>`:`<label class="field">这次想练什么<input name="task-goal" aria-describedby="task-error" value="${esc(task.goal)}" maxlength="160" placeholder="例如，第一次见面怎样自然开场"></label>`;
    const edits=`${fields}<label class="field">${short?"写一句自己的情况":"补充这次的情况（选填）"}<input name="task-context" aria-describedby="task-error" value="${esc(task.context||"")}" maxlength="160" placeholder="例如，结束前想说明我想自己回去"></label>
      ${short?"":`<label class="field">你已确认的安排（选填）<textarea name="task-plan" maxlength="240" placeholder="例如，晚上七点见，对方八点半要离开">${esc(checklist.plan||"")}</textarea></label>`}
      <details class="setup-details"><summary>更多设定</summary><section class="task-arrangement"><div class="task-arrangement-grid"><fieldset><legend>练习长度</legend><div class="task-choice-row">${radios("duration",{short:"练一小段",full:"完整练一场"})}</div></fieldset>
      <fieldset><legend>对方的说话节奏</legend><div class="task-choice-row">${radios("style",{natural:"自然日常",warm:"活泼",quiet:"慢热",direct:"直率"})}</div></fieldset></div></section>${short?"":preferenceFields()}</details>`;
    return `<section class="panel task-setup${short?" moment-panel":" preparation-page"}">${crumb(short?"找个练习":"赴约前预演")}<h1 tabindex="-1">${short?"挑一个你想练的瞬间":"本场准备"}</h1>
      ${short?`${edits}${summary}`:`<div class="prep-layout">${summary}<div class="prep-fields">${edits}</div></div>`}
      ${check("adult","我已年满18岁，了解这是虚构情境",config.adult)}
      <p class="subline">自由聊天会把必要设定和已发送的对话交给模型服务。可以省略姓名、联系方式和精确地址。</p>
      <p class="form-error" id="task-error" role="alert">${esc(planIssue)}</p>
      <div class="buttons">${button("task-start",short?"开始自由练习":"开始预演","primary")}</div>
      <div id="setup-connection">${connectionOptions()}</div></section>`;
  }
  let taskSceneDefault=true;
  function setupScene() {
    return appliedScene ? window.DatingPreparationScenes.build(appliedScene) : engine.sceneById(config.scene);
  }

  function setupConfig() {
    const sceneSpec=appliedScene||undefined;
    if (!appliedPartner) return {...config,sceneSpec};
    const partner=window.DatingPreparation.compile(appliedPartner, config, library);
    return {...partner,scene:config.scene,sceneSpec};
  }

  function resolveSetup() {
    const next=setupConfig();
    const eligible=mode=>engine.match({...next,adult:true,mode}).find(item=>!preferredRoleId||item.id===preferredRoleId);
    const candidates=modeExplicit?[next.mode]:[next.mode,"spark","mellow","tension","hard"];
    for(const mode of new Set(candidates)){
      const role=eligible(mode);
      if(role)return {role,config:{...next,mode}};
    }
    return {role:null,config:next};
  }

  function setTaskMomentFromContext(value) {
    if (/自己.{0,3}(回家|回去|走)|收尾|道别|散场|先走|早点回|结束/.test(value)) return "close";
    if (/下次|再约|再见面/.test(value)) return "next-date";
    if (/不同意见|换个|不太想|分歧/.test(value)) return "disagree";
    if (/接话|接住|冷场|怎么接/.test(value)) return "follow-up";
    if (/开场|刚见面|第一句/.test(value)) return "opening";
    return undefined;
  }

  function clearTaskError(){
    planIssue="";
    const error=app.querySelector("#task-error");
    if(error?.nodeType)error.textContent="";
  }
  function recommendTaskScene(){
    if(taskSceneDefault){
      const activity=task.kind==="practice"?goalActivities[moments.indexOf(task.moment)]:"A01";
      config.scene=library.scenes.find(scene=>scene.activityId===activity)?.id||"S02";
    }
    const note=app.querySelector("#task-scene-note");
    if(note?.nodeType)note.textContent=(setupScene()?.name||"未选择")+(taskSceneDefault?" · 推荐":"");
    const description=app.querySelector("#moment-note");
    if(description?.nodeType)description.textContent=momentNotes[task.moment]||"对方会从眼前的情境开口。";
    const roleNote=app.querySelector("#task-role-note");
    if(roleNote?.nodeType&&!appliedPartner&&!preferredRoleId){const role=resolveSetup().role;roleNote.textContent=role?`${role.name} · 推荐`:"按条件匹配";}
  }
  const recordKey="dating-rehearsals-v1";
  let recordKind="",recordScene="";
  function readRecords(){
    const rows=JSON.parse(window.localStorage?.getItem(recordKey)||"[]");
    if(!Array.isArray(rows)||rows.some(item=>typeof item?.id!=="string"||typeof item?.task?.goal!=="string"))throw new Error("无法读取复盘摘要");
    return rows;
  }
  function savedRecords(){try{return readRecords();}catch{return [];}}
  function recordCards(rows){
    const filtered=rows.filter(item=>(!recordKind||item.task.kind===recordKind)&&(!recordScene||item.scene===recordScene));
    return filtered.map(item=>`<article class="ticket"><p class="meta">${esc(item.date||"日期未记录")} · ${item.task.kind==="practice"?"能力练习":"赴约预演"} · ${esc(engine.sceneById(item.scene)?.name||"场景未记录")}</p><h2>${esc(item.task.goal)}</h2><p>${esc(item.summary||"摘要未记录")}</p><div class="buttons"><button type="button" data-record-retry="${esc(item.id)}">按这份设定再练</button><button type="button" data-record-delete="${esc(item.id)}" class="quiet">删除摘要</button></div></article>`).join("")||"<p>没有符合当前筛选的摘要。</p>";
  }
  function savedReviews(){
    let rows, failed=false;
    try{rows=readRecords();}catch{rows=[];failed=true;}
    const sceneIds=[...new Set(rows.map(item=>item.scene))].filter(id=>engine.sceneById(id));
    if(!sceneIds.includes(recordScene))recordScene="";
    return `<section class="panel journal-page">${crumb("已保存复盘")}<h1 tabindex="-1">已保存复盘</h1><p class="subline">这里只显示你主动保存的摘要。完整对话可在散场时下载。</p>
      ${rows.length?`<div class="field-row"><label class="field">练习类型<select name="record-kind">${[["","全部类型"],["practice","能力练习"],["rehearsal","赴约预演"]].map(([id,label])=>option(id,label,recordKind)).join("")}</select></label><label class="field">场景<select name="record-scene">${option("","全部场景",recordScene)}${sceneIds.map(id=>option(id,esc(engine.sceneById(id).name),recordScene)).join("")}</select></label></div>`:""}
      <div class="record-stack" id="record-stack">${rows.length?recordCards(rows):failed?`<p role="alert">目前无法读取摘要。已有下载仍可从下载文件夹查看。</p>${button("saved-reviews","重新读取")}`:`<p>还没有保存的复盘。</p>${button("new-practice","开始练习","primary")}`}</div>
      ${legacyNotes||legacyError?button("legacy-journal","管理旧笔记","quiet"):""}</section>`;
  }
  const offlineId="natural-close-v1";
  function offlineView(){
    const scenario=window.DatingPracticeScenarios.get(offlineId);
    const node=scenario.nodes[offline.nodeId];
    const exit=offline.from==="cover"?"返回首页":"回到原来的设置";
    return `<section class="panel task-setup offline-view">${crumb("收尾短练","offline-return",exit)}<p class="meta">点选短练 · 公园散步</p>
      <h1 tabindex="-1">${esc(scenario.title)}</h1><p>点选并确认一句回应，看看对方怎么接。练完可以带走一句参考说法。</p>
      ${!config.adult?check("adult","我已年满18岁，知道这是虚构模拟",false)+button("offline-adult","进入短练","primary"):`<div class="messages">${offline.turns.map(turn=>`<p class="chat-bubble is-user">你 · ${esc(turn.label)}</p><p class="chat-bubble">TA · ${esc(turn.reply)}</p>`).join("")}${node&&!offline.ended?`<p class="chat-bubble">TA · ${esc(node.prompt)}</p>`:""}</div>`}
      ${config.adult&&node&&!offline.ended?`<div class="offline-choices" role="group" aria-label="选择一句回应">${node.choices.map(choice=>`<button type="button" data-offline-choice="${esc(choice.id)}" aria-pressed="${offline.selected===choice.id}">${esc(choice.label)}</button>`).join("")}</div><p class="form-error" id="offline-error" role="alert"></p>${button("offline-confirm","确认这句","primary")}`:""}
      ${offline.ended?`<div class="preview-takeaway"><h2>这句话带来的回应</h2><p>${esc(offline.turns.at(-1).outcome)}</p><h2>下次可试</h2><p>好呀，今天聊得挺开心。下次有空再散步。</p></div>`:""}
      <div class="buttons">${offline.ended?button("offline-restart","换一句试试"):""}${button("offline-return",exit,"quiet")}</div></section>`;
  }
  function openOffline(from){
    if(busy||screen==="live")return;
    offline={from,nodeId:window.DatingPracticeScenarios.get(offlineId).startNode,turns:[],selected:null,ended:false};
    show("offlineView");
  }
  function legacyJournal(){
    return `<section class="panel">${crumb("旧版笔记","saved-reviews","已保存复盘")}<h1 tabindex="-1">旧版笔记</h1><div id="radar-host"></div></section>`;
  }
  function navigation() {
    const section = {cover:"home",roles:"roles",preparation:preparation.step===1?"roles":"all-scenes",sceneCatalog:"all-scenes",settings:"all-scenes",preferences:"all-scenes",invitation:"all-scenes",taskSetup:task?.kind==="practice"?"journal":null,savedReviews:"saved-reviews"}[screen];
    const inScene=busy||suspended;
    const links=[["home","首页"],["roles","角色库"],["all-scenes","场景"],["journal","找个练习"]];
    links.push(["saved-reviews","复盘"]);
    return `<nav class="page-nav" aria-label="网页导航"><span class="brand"><span aria-hidden="true">♡</span> Dating之神</span><div>
      ${screen==="live"?`<span class="nav-live-status">约会${run.phase==="paused"?"已暂停":"进行中"}</span>${button("leave-live","暂停并离开","quiet")}`:links.map(([id,label])=>`<button type="button" data-go="${id}" class="quiet${section===id?" nav-current":""}"${section===id?' aria-current="page"':""}${inScene?" disabled":""}>${label}</button>`).join("")}</div></nav>`;
  }

  function connectionDialog() {
    return `<dialog id="connection-help" class="content-dialog" aria-label="连接自由聊天"><h2>连接自由聊天</h2>
      <p>自由练习需要可用的模型。网页由本地服务连接模型，密钥留在服务侧。</p>
      <ol><li>在本地服务启动环境配置 <code>OPENAI_API_KEY</code> 和 <code>OPENAI_MODEL</code>。</li><li>重新启动本地服务，再返回本场检查。</li></ol>
      <p>也可以在当前宿主聊天中主动开启文字预演。它会建立独立的练习会话。</p><div class="buttons">${button("recheck-connection","检查连接","primary")}${button("close-content","返回","quiet")}</div></dialog>`;
  }

  function preferenceFields() {
    return `<div class="form-grid"><section class="form-section"><h2>这一场怎么进行</h2>
        <label class="field"><span>这一场的节奏（自主选择）</span><select name="mode">${Object.entries(modes).map(([id,label])=>option(id,label,config.mode)).join("")}</select><small>高档会出现含糊回应、期待落差和关系张力；边界与随时退出始终有效。</small></label>
        <div class="field-row">
          <label class="field"><span>你们的关系起点</span><select name="stage">${Object.entries({first:"初次见面",second:"第二次约会",friends:"朋友相约",flirting:"正在暧昧",steady:"稳定交往"}).map(([id,label])=>option(id,label,config.stage)).join("")}</select></label>
          <label class="field"><span>这次的关系期待</span><select name="intent">${Object.entries({undecided:"还没想好",casual:"轻松相处",serious:"认真了解"}).map(([id,label])=>option(id,label,config.intent)).join("")}</select></label>
        </div>

          <div class="field-row"><label class="field"><span>本场预算（模拟人均，元）</span><input type="number" name="budget" min="0" max="100000" step="1" value="${esc(setupNumbers.budget??config.budget)}" placeholder="默认300元"></label><label class="field"><span>可用时间（分钟）</span><input type="number" name="timeBudget" min="5" max="1440" step="1" value="${esc(setupNumbers.timeBudget??config.timeBudget)}" placeholder="默认180分钟"></label></div>
          <label class="field"><span>希望的相处方式（需现场协商）</span><select name="exclusivity">${Object.entries({unspecified:"暂不确定",exclusive:"希望彼此排他",open:"可接受开放关系"}).map(([id,label])=>option(id,label,config.exclusivity)).join("")}</select></label>
        <section class="task-arrangement"><h3>活动偏好</h3><div class="form-grid">
          <label class="field"><span>约会经验</span><select name="experience">${option("novice","刚开始尝试",config.experience)}${option("familiar","比较熟悉",config.experience)}</select></label>
          ${check("alcohol","这场愿意饮酒（不选也可去酒吧，选择无酒精饮品）",config.alcohol)}
          <label class="field"><span>饮食要求（可选，现场可知）</span><input name="diet" maxlength="160" value="${esc(config.diet)}" placeholder="例如，不吃花生；不需要填写病史"></label>
        </div></section>
        </section><section class="form-section"><h2>你和对方</h2>
        <div class="field-row">
          <label class="field"><span>想见的对象</span><select name="presentation">
            ${option("unspecified", "暂不指定，便笺不先标性别", config.presentation)}
            ${option("any", "都可以，便笺可显示性别", config.presentation)}
            ${Object.entries(display).filter(([id])=>id!=="nonbinary").map(([id, label]) => option(id, label, config.presentation)).join("")}
          </select></label>
          <label class="field"><span>本场玩家视角（可选）</span><select name="player">
            ${option("unspecified", "暂不提供", config.player)}
            ${Object.entries(display).map(([id, label]) => option(id, label, config.player)).join("")}
          </select></label>
        </div>
        <label class="field"><span>称呼（可选）</span><input type="text" name="nickname" value="${esc(config.nickname)}" maxlength="24" placeholder="可以留空"></label>
        <fieldset><legend>相处偏好（最多三项，先选的优先）</legend>
          <div class="checks">${Object.entries(library.traits).map(([id, label]) =>
            check("traits", label, config.traits.includes(id), id)).join("")}</div>
        </fieldset>
        <label class="field"><span>想聊到的兴趣（可选）</span><select name="interest">
          ${option("", "没有特别想选的", config.interest)}
          ${Object.entries(library.interests).map(([id, label]) => option(id, label, config.interest)).join("")}
        </select></label>
      </section>        <section class="form-section"><h2>练习重点与边界</h2><div class="form-grid"><label class="field"><span>私人便笺（仅留在本地）</span><textarea name="expectation" maxlength="320">${esc(config.expectation)}</textarea></label>
        <fieldset><legend>避开的话题</legend><div class="checks">${Object.entries(library.topics).map(([id,label])=>check("avoid",label,config.avoid.includes(id),id)).join("")}</div></fieldset>
        ${check("surprise","允许一点场景小变化",config.surprise)}${check("guidance","开场时给我一个方向",config.guidance)}</div></section>

      </div>`;
  }

  function preferences() {
    return `<section class="panel preferences-page">
      ${confirming?`${crumb("确认偏好","return-scenes","选场景")}<h1 tabindex="-1">确认偏好</h1>${steps(2)}`:heading("", "想遇见怎样的人？", "偏好只用来挑这一场。")}
      ${preferenceFields()}<div class="preferences-submit">${check("adult","我已年满 18 岁，并知道这是一场虚构模拟",config.adult)}<p id="adult-reason" class="subline"${config.adult?" hidden":""}>请先确认成年，再查看见面便笺。</p><div class="buttons">${confirming?`<button type="button" data-go="match" id="preferences-next" class="primary"${config.adult?"":" disabled aria-describedby='adult-reason'"}>查看见面便笺</button>${button("return-scenes","返回选场景","quiet")}`:`${button("blind","直接去盲约","primary")}${button("settings","选地点和边界")}${button("home","返回首页","quiet")}`}</div></div>
    </section>`;
  }

  function sceneIssue(scene) {
    if ((scene.cost ?? 0) > config.budget) return "预算不足";
    if ((scene.duration || 0) > config.timeBudget) return "时间不足";
    return "";
  }
  function checkPlan() {
    const issue = sceneIssue(engine.sceneById(config.scene));
    if (!issue) return true;
    status.textContent = `${issue}。请调整条件或换一个活动。`;
    return false;
  }
  function matchingRoles(overrides = {}) {
    return engine.match({...config, ...overrides}).filter(role=>!preferredRoleId||role.id===preferredRoleId);
  }

  function explainPlan() {
    const scene=engine.sceneById(config.scene);
    const issues=[];
    if (scene.cost>config.budget) issues.push(`模拟人均${scene.cost}元，超过当前${config.budget}元的预算`);
    if (scene.duration>config.timeBudget) issues.push(`活动需要${scene.duration}分钟，当前可用${config.timeBudget}分钟`);
    if (issues.length) return issues.join("；");
    if (matchingRoles({adult:true}).length) return "";
    const role=library.roles.find(item=>item.id===preferredRoleId);
    if (!role) return "当前场景、对象偏好与模式没有共同匹配的角色";
    if (!role.scenes.includes(config.scene)) issues.push(`${role.name}的档案不兼容「${scene.name}」`);
    if (role.modes?.length&&!role.modes.includes(config.mode)) issues.push(`不支持当前的「${modes[config.mode]}」模式`);
    if (!role.players.includes(config.player) ||
        (config.player==="man"&&role.presentation!=="woman") ||
        (config.player==="woman"&&role.presentation!=="man") ||
        (!["any","unspecified",role.presentation].includes(config.presentation))) issues.push("与当前玩家视角或对象性别偏好不符");
    return issues.join("；") || "当前条件没有可用组合";
  }

  function planWarning() {
    if (!planIssue) return "";
    return `<aside class="plan-warning" role="alert"><h2>当前组合无法开始</h2><p>${esc(planIssue)}。</p><div class="buttons">
      ${button("compatible-scenes","换场景")}${button("roles","换角色")}${button("confirm-preferences","改偏好","quiet")}${preferredRoleId?button("random-role","让系统重新匹配","quiet"):""}</div></aside>`;
  }

  function planCards() {
    return byCategory(settingsCategory).map(scene=>sceneCard(scene,"scene",{selected:config.scene===scene.id,issue:sceneIssue(scene)})).join("");
  }
  function planBar() {
    const chosen=library.roles.find(role=>role.id===preferredRoleId);
    const scene=engine.sceneById(config.scene);
    const issue=sceneIssue(scene);
    const hidden=settingsCategory!=="全部"&&scene.category!==settingsCategory;
    return selectionBar("plan-bar",`${chosen?.name||"随机匹配"} · ${scene.name}`,
      [hidden?"在当前分类外":"",issue||sceneFacts(scene)].filter(Boolean).join(" · "),
      "continue-plan","确认偏好 →",{disabled:Boolean(issue),extra:button("roles","换一个人","quiet")});
  }
  function settings() {
    return `<section class="panel plan-page with-confirm">${crumb("选场景","roles","角色库")}<h1 tabindex="-1">安排这一场</h1>${steps(1)}
      <div id="plan-warning-region">${planWarning()}</div>
      <div class="scene-groups" aria-label="按活动选择场景">${categoryFilters("settings",settingsCategory)}<div class="scene-grid" id="plan-grid">${planCards()}</div></div>
      ${planBar()}</section>`;
  }

  function invitation() {
    const role = candidates[candidateIndex];
    if (!role) return settings();
    const identity = config.presentation === "unspecified" ? `${role.age} 岁` : `${role.age} 岁 · ${display[role.presentation]}`;
    return `<section class="panel">
      ${crumb("开始预演","confirm-preferences","确认偏好")}<h1 tabindex="-1">一张见面便笺</h1>${steps(3)}
      <article class="meet-card"><p class="section-eyebrow">一张见面便笺 · ${esc(engine.sceneById(config.scene).name)}</p><h2>${esc(role.name)}</h2><p class="meet-identity">${identity} · ${esc(role.goal||"想看看彼此聊不聊得来")}</p>
      ${config.avoid.includes("work") ? "" : `<p>${esc(role.bio)}</p>`}<blockquote>“${esc(role.greeting)}”</blockquote><p>${esc(role.reason)}</p></article>
      <div class="buttons">${button("meet", "开始这场约会", "primary")}
      ${candidates.length > 1 ? button("swap", "换一位") : ""}${button("settings", "再改改安排", "quiet")}</div>
    ${connectionOptions()}</section>`;
  }

  function timeLabel(scene, elapsed) {
    const [hour, minute] = scene.time.split(":").map(Number);
    const total = hour * 60 + minute + elapsed;
    return [Math.floor(total / 60), total % 60].map((value) => String(value).padStart(2, "0")).join(":");
  }
  function sceneName(id, context = run || original) {
    return (context && engine.resolveScene ? engine.resolveScene(context,id) : engine.sceneById(id))?.name || id;
  }

  function log(events) {
    return `<ol class="log">${events.map((event) =>
      `<li>${event.before?.scene ? `<small>${esc(sceneName(event.before.scene))}</small><br>` : ""}<strong>${esc(event.label)}</strong><br>${esc(event.reply)}${event.detail ? `<br>${esc(event.detail)}` : ""}<br><small>${esc(event.effect)}</small></li>`).join("")}</ol>`;
  }

  function live() {
    if(task&&run.rehearsalTask)return conversationView();
    const role = engine.resolveRole ? engine.resolveRole(run) : engine.roleById(run.role);
    const scene = engine.resolveScene ? engine.resolveScene(run) : engine.sceneById(run.scene);
    const start = modelMode ? modelOpening : engine.opening(run);
    const last = run.events.at(-1);
    const paused = run.phase === "paused";
    const choices = engine.choices(run);
    const stations = choices.filter(choice=>choice.id.startsWith("station:"));
    const regular = choices.filter(choice=>!choice.id.startsWith("station:"));
    const actions = (items) => items.map((choice,index)=>`<button type="button" data-action="${esc(choice.id)}" ${busy ? "disabled" : ""} data-turn="${run.events.length}"${index===0 && !modelMode ? ' class="primary"' : ""}>${esc(choice.label)}</button>`).join("");
    const label = run.branchFrom === null ? "约会现场" : "重演 / 同一刻的另一种走法";
    return `<section class="panel live-panel">
      <article class="theatre">
        <p class="kicker">${label} · ${timeLabel(engine.resolveScene ? engine.resolveScene(run,run.initialScene || run.scene) : engine.sceneById(run.initialScene || run.scene), run.elapsed)}</p><p class="mode-note">${modes[run.mode || config.mode]} · ${modeHelp[run.mode || config.mode]}</p>
        <h1 tabindex="-1">${esc(role.name)} · ${esc(run.location)}</h1>
        ${paused ? "<p class=\"line\" tabindex=\"-1\">已经暂停。回到现场时，时间会从这一刻接上。</p>" : `
          ${last?.detail || !last ? `<p class="stage-detail" id="model-detail">${modelMode ? "" : esc(last?.detail || start.detail)}</p>` : ""}
          <p class="line" id="model-line" tabindex="-1" aria-live="polite">「${modelMode ? "" : esc(last?.reply || start.line)}」</p>`}
      </article>
      ${hint && !paused ? `<p class="prompt">可以从眼前的选择出发。${run.events.length ?
        "照自己的节奏决定，也可以先保留意见或道别。" : scene.hint}</p>` : ""}
      ${paused ? "" : `<div class="steps live-choices" aria-label="你想怎么做">${actions(regular)}</div>`}
      ${modelMode && !paused ? `<label class="field"><span>你想说什么？</span><textarea name="utterance" maxlength="1200" ${busy ? "disabled" : ""}></textarea></label><div class="buttons"><button type="button" data-go="send" class="primary" ${busy ? "disabled" : ""}>${busy ? "正在回应…" : "发送"}</button>${busy ? button("cancel", "取消本次请求") : ""}</div>` : ""}
      ${!paused&&stations.length?button("open-stations","提议换个地方","quiet"):""}<dialog class="content-dialog" id="stations" aria-label="提议换个地方"><h2>提议换个地方</h2><p>这里只列出本场时间和预算允许的活动。先提出，双方再确认出发。</p><div class="steps">${actions(stations)}</div>${button("close-content","返回现场","quiet")}</dialog>
      <div class="control">
        ${paused ? button("resume", "回到现场") : button("pause", "暂停", "quiet")}
        ${!paused ? button("hint", hint ? "收起提示" : "我有点卡住", "quiet") : ""}
        <div class="buttons">
          ${button("radar-coach", "场外教练", "quiet")}${modelMode ? button("radar-preflight", "检查这句草稿", "quiet") : ""}
          ${Object.keys(modes).indexOf(run.mode || config.mode)>0 ? button("lower-mode", "降低强度", "quiet") : ""}
          ${button("end", "结束并复盘", "quiet danger")}${button("reset", "清空本场", "quiet danger")}
        </div>
      </div>
      <div id="radar-host"></div>
      ${run.events.length?button("open-live-log","查看已发生的事","quiet"):""}<dialog class="content-dialog" id="live-log" aria-label="现场记录"><h2>现场记录</h2>${log(run.events)}${button("close-content","返回现场","quiet")}</dialog>
    </section>`;
  }

  function liveStatusBar(){
    const role=engine.resolveRole(run);
    const initialScene=engine.resolveScene(run,run.initialScene||run.scene);
    const limit=run.limit??role.limit;
    const remaining=Math.max(0,limit-run.elapsed);
    const budget=run.budget===null||run.budget===undefined?null:Math.max(0,run.budget-(run.spent||0));
    const mode=run.mode||config.mode;
    const paused=run.phase==="paused";
    const canLower=!busy&&!retryTurn?.uncertain&&!sessionExpired&&Object.keys(modes).indexOf(mode)>0;
    return `<div class="live-status-bar${paused?" is-paused":""}" aria-label="本场状态"><span>${esc(sceneName(run.scene))}</span><span>${timeLabel(initialScene,run.elapsed)}</span><span class="${!paused&&remaining<=10?"is-warning":""}">${paused?"时间已冻结":`剩约${remaining}分钟`}</span>${budget!==null?`<span class="${budget<=run.budget*0.2?"is-warning":""}">预算剩¥${budget}</span>`:""}<span>${modes[mode]}</span>${canLower?button("lower-mode","降低强度","quiet"):""}</div>`;
  }
  function conversationView(){
    const role=engine.resolveRole(run);
    const paused=run.phase==="paused";
    const suggestions=currentSuggestions();
    const actions=engine.choices(run).filter(item=>item.id!=="leave");
    const stationChoices=run.pendingStation?actions.filter(item=>["station-confirm","station-cancel"].includes(item.id)):[];
    const controls=actions.filter(item=>!stationChoices.includes(item));
    const stationOffers=controls.filter(item=>item.id.startsWith("station:"));
    const inlineActions=controls.filter(item=>!item.id.startsWith("station:"));
    const bubble=(who,text)=>`<div class="chat-bubble ${who==="你"?"is-user":""}"><small>${who}</small><p>${esc(text)}</p></div>`;
    return `<section class="panel live-panel natural-chat"><header class="section-head"><div><p class="meta">${run.branchFrom===null?"约会预演":"从原场再练"} · ${run.events.length}回合</p><h1 tabindex="-1">${esc(role.name)} · ${esc(run.location)}</h1><p class="meta">${esc(run.rehearsalTask.goal)}</p></div>${paused||sessionExpired?"":button("pause","暂停","quiet")}</header>
      ${liveStatusBar()}
      <div class="messages" aria-label="本场对话">
      ${modelOpening?.detail?`<p class="scene-note">${esc(modelOpening.detail)}</p>`:""}
      ${modelOpening?.line?bubble("TA",modelOpening.line):""}
      ${run.events.map(turn=>bubble("你",turn.label)+(turn.detail?`<p class="scene-note">${esc(turn.detail)}</p>`:"")+bubble("TA",turn.reply)).join("")}
      ${busy&&triedTurn?`<div class="chat-bubble is-user"><small>你 · 等待确认</small><p>${esc(triedTurn)}</p></div><p role="status" class="scene-note">等TA回复…</p>`:""}</div>
      ${!paused&&!sessionExpired&&stationChoices.length?`<section class="connection-note"><h2>待确认的第二站 · ${esc(engine.sceneById(run.pendingStation)?.name||"新地点")}</h2><p>确认后才换地方并计入本场时间和预算。${esc(sceneFacts(engine.sceneById(run.pendingStation)))}</p><div class="buttons">${stationChoices.map(item=>`<button type="button" data-confirm-action="${esc(item.id)}"${busy?" disabled":""}>${esc(item.label)}</button>`).join("")}</div></section>`:""}
      ${paused?`<div class="chat-paused"><p>本场已暂停。继续时会接上当前对话。</p><div class="buttons">${button("resume","继续本场","primary")}${button("leave-live","离开现场","quiet")}</div></div>`:
      `<div class="composer">
      <label class="field"><span>你想怎么回？</span><textarea name="utterance" placeholder="用自己的话回复…" maxlength="1200"${busy?" disabled":""}>${esc(utterance)}</textarea></label>
      ${liveError?`<p class="live-feedback form-error" role="alert">${esc(liveError)}</p>`:""}
      <div class="section-head draft-footer">${button("hint",coachOpen?"收起建议":"看看怎么接","quiet")}<div>${busy?button("cancel","取消等待","quiet"):""}<button type="button" data-go="send" class="primary"${busy||sessionExpired||!retryTurn?.uncertain&&!utterance.trim()?" disabled":""}>${busy?"等待回应…":retryTurn?.uncertain?"核对发送状态":retryTurn&&liveError&&!sessionExpired?"重试这句":"发送"}</button></div></div>
      ${coachOpen?`<aside class="coach-drawer"><h2>试着接一句</h2><p>可以直接表达你的想法，也可以用这些例句开头。</p>
        <div class="suggestion-list">${suggestions.map((line,index)=>`<button type="button" data-draft-index="${index}" aria-pressed="${selectedDraft===index}"${busy?" disabled":""}>${esc(line)}</button>`).join("")}</div>
        <p class="subline">「帮我顺一句」会把当前草稿交给服务。</p>${button("polish",polishRequest?"正在整理…":"帮我顺一句","quiet")}
        ${polish?`<p>你的原句：${esc(polish.source)}</p><p>建议：${esc(polish.line)}</p>${polish.source===utterance?`<div class="buttons">${button("apply-polish","换成这句")}${button("dismiss-polish","保留原文","quiet")}</div>`:`<p class="meta">草稿已修改，这条建议对应之前的文字。</p>`}`:""}</aside>`:""}</div>`}
      ${!paused&&!sessionExpired&&inlineActions.length?`<details class="setup-details"><summary>现场可以做什么</summary><div class="buttons">${inlineActions.map(item=>`<button type="button" data-confirm-action="${esc(item.id)}"${busy?" disabled":""}>${esc(item.label)}</button>`).join("")}</div></details>`:""}
      ${!paused&&!sessionExpired&&stationOffers.length?`${button("open-stations","提议换个地方…","quiet")}<dialog class="content-dialog" id="stations" aria-label="提议换个地方"><h2>提议换个地方</h2><p>这里只列出本场时间和预算允许的活动。先提出，双方再确认出发。</p><div class="steps">${stationOffers.map(item=>`<button type="button" data-confirm-action="${esc(item.id)}"${busy?" disabled":""}>${esc(item.label)}</button>`).join("")}</div>${button("close-content","返回现场","quiet")}</dialog>`:""}
      <div class="buttons">${button("request-end",sessionExpired?"查看本页已确认对话":"结束并复盘","quiet")}${button("reset","清空本场","quiet danger")}</div></section>`;
  }

  function currentSuggestions(){
    const suggestions=run.events.at(-1)?.suggestions;
    if(suggestions?.length)return suggestions.slice(0,3);
    if(run.events.length)return [];
    const starter={opening:"你好，今天见到你挺开心。","follow-up":"听起来你挺在意这件事，能多说一点吗？",disagree:"我有个不同的想法，你愿意一起看看吗？",close:"谢谢，我今天想自己回去。","next-date":"我今天聊得很开心，你愿意改天再见吗？"};
    const line=starter[run.rehearsalTask?.moment];
    return line?[line]:[];
  }

  function evidenceView(){
    if(!original?.rehearsalTask)return cover();
    const item=analysis?.findings?.[0];
    return `<section class="panel report-panel evidence-page"><h1 tabindex="-1">本场复盘</h1>
      ${report.evidenceReport(original,alternative,analysis,{...checklist,claimedAction:checklist.claimedAction??item?.alternative,pending:reportLoading,actions:true,canReplay:!sessionExpired})}
      <div id="report-feedback">${reportFeedback()}</div>
      <p class="subline">保存摘要会写入当前浏览器，包含练习目标、场景和一条本场观察。</p>
      <div class="buttons report-toolbar">${button("open-export","导出报告","primary")}${button("save-evidence","保存摘要")}${original.events.length?button("open-transcript","查看完整对话","quiet"):""}${task.kind==="rehearsal"?button("open-checklist","编辑赴约清单","quiet"):""}${button("retry-task","按原设定再试","quiet")}${button("reset","清空本场","quiet danger")}</div>
      <dialog id="export-options" aria-label="导出报告" class="content-dialog"><h2>导出报告</h2><p>默认下载复盘摘要。你可以选择带上完整对话或私人便笺。</p>
        ${check("includeFull","包含完整对话",includeFull)}
        <label class="field">私人便笺<textarea name="note" maxlength="320">${esc(draft.note)}</textarea></label>
        ${check("includeNote","包含这条私人便笺",draft.includeNote)}
        <details class="setup-details"><summary>预览下载内容</summary><div id="export-preview">${exportEvidencePreview()}</div></details>
        <div class="buttons">${button("download-evidence","下载HTML报告","primary")}${button("close-content","返回复盘","quiet")}</div><p id="export-status" class="subline" role="status"></p></dialog>
      <div class="buttons">${button("open-share-card","制作分享卡","quiet")}</div>
      <dialog id="share-card-options" aria-label="制作分享卡" class="content-dialog"><h2>Dating分享卡</h2><label class="field">想分享的一句感受<input name="accepted" maxlength="96" value="${esc(draft.accepted)}"></label>
        <img class="card-preview" id="card-art" alt="分享卡预览" hidden>${check("confirmed","我确认这句话可用来制作分享卡",draft.confirmed)}${button("download-card","下载分享卡（SVG）","primary")}${button("close-content","返回复盘","quiet")}<p class="form-error" id="share-error" role="alert"></p></dialog>
      ${task.kind==="rehearsal"?`<dialog id="checklist-options" aria-label="编辑赴约清单" class="content-dialog"><h2>编辑赴约清单</h2><div class="form-grid">${[["claimedAction","我想试的做法"],["question","我想确认的问题"],["fallback","如果计划变了"]].map(([key,label])=>`<label class="field">${label}<input name="checklist.${key}" maxlength="240" value="${esc(checklist[key]??(key==="claimedAction"?item?.alternative||"":""))}"></label>`).join("")}</div>${button("close-checklist","完成","primary")}</dialog>`:""}
      </section>`;
  }

  function exportEvidenceOptions(){
    const {claimedAction,question,fallback}=checklist;
    return {claimedAction:claimedAction??analysis?.findings?.[0]?.alternative,question,fallback,full:includeFull,
      includeNote:draft.includeNote,note:draft.note,opening:originalOpening?.line};
  }

  function exportEvidencePreview(){
    return original?report.evidenceReport(original,alternative,analysis,exportEvidenceOptions()):"";
  }
  function transcript(){
    return `<section class="panel journal-page"><h1 tabindex="-1">本场完整对话</h1>${button("return-transcript","返回复盘","quiet")}
      ${originalOpening?.line?`<p class="scene-note">TA · ${esc(originalOpening.line)}</p>`:""}
      <ol class="log">${original.events.map((event,index)=>`<li id="transcript-turn-${index+1}"><small>第${index+1}回合${event.before?.scene?` · ${esc(sceneName(event.before.scene,original))}`:""}</small>
        <p><strong>${event.inputType==="action"?"你的动作":"你"}</strong> ${esc(event.label)}</p><p><strong>TA</strong> ${esc(event.reply)}</p>
        ${event.detail?`<p>${esc(event.detail)}</p>`:""}${event.effect?`<small>${esc(event.effect)}</small>`:""}
        ${primarySessionId&&!sessionExpired&&event.inputType!=="action"?`<div class="buttons"><button type="button" class="quiet" data-evidence-replay="${index}">从这句再试</button></div>`:""}</li>`).join("")}</ol></section>`;
  }

  function reportFeedback() {
    return reportError?`<p class="subline" role="status">${esc(reportError)}</p>${button("retry-report","重新整理分析")}`:"";
  }
  async function loadReport(sessionId) {
    if(reportLoading||!sessionId)return;
    const snapshot=original;
    reportLoading=true;reportError="";
    show("evidenceView","",false);
    try {
      const value=await api("/api/report",{sessionId});
      if(original===snapshot)analysis=report.validateAnalysis(snapshot,value);
    } catch {
      if(original===snapshot)reportError="暂时没整理出分析。原话仍可查看，也可以再试一次。";
    } finally {
      if(original===snapshot){
        reportLoading=false;
        if(screen==="evidenceView"){
          const summary=evidenceView();
          const template=document.createElement("template");
          if(template.content){
            template.innerHTML=summary;
            const current=app.querySelector(".evidence-summary");
            const next=template.content.querySelector(".evidence-summary");
            if(current && next){current.replaceWith(next);updateRegion("#report-feedback",reportFeedback());updateRegion("#export-preview",exportEvidencePreview());}
            else show("evidenceView","",false);
          }else show("evidenceView","",false);
        }
      }
    }
  }
  let primarySessionId=null;
  function review() {
    const event = original.events[draft.selected];
    const suggestion = report.choices(original, draft.selected);
    return `<section class="panel review-panel">
      ${heading("", "选一个想回看的回合", esc(original.outcome))}
      ${original.events.length ? `<ol class="review-timeline" aria-label="约会回合">${original.events.map((item,index)=>
        `<li><button type="button" class="choice-card timeline-turn" data-select="${index}" aria-pressed="${draft.selected===index}"><span class="turn-index">${String(index+1).padStart(2,"0")}</span><span><strong>${esc(item.label)}</strong><small>${esc(item.reply)}</small>${item.before?.scene?`<span class="turn-location">${esc(sceneName(item.before.scene,original))}</span>`:""}</span></button></li>`).join("")}</ol>`
        : "<p>这场还没有可引用的互动。你可以留一句原本想试的事。</p>"}
      ${event ? `<article class="ticket"><p class="meta">这一刻 · 角色实际回应</p><p>「${esc(event.reply)}」</p>
        <p class="subline">这一刻，你在意的是对方给的答案，还是你可以自在地说出自己的选择？也可以都不是。</p>
        ${!alternative ? button("replay", "从这一幕重演") : "<p>重演已完成，回看将分开呈现。</p>"}</article>` : ""}
      ${config.expectation.trim() ? `<article class="ticket reflection-card"><h2>赴约前的期待</h2><p>${esc(config.expectation)}</p>
        ${check("includeExpectation","把这条期待写入HTML报告",draft.includeExpectation)}</article>`:""}
      ${original.preparation ? `<div class="form-grid"><h2>赴约准备</h2><p class="subline">只认领你愿意尝试的做法。模拟对象的反应不能代替真人回答。</p>${[['claimedAction','下次做法'],['question','需要向真人确认的问题'],['fallback','可行备选']].map(([key,label])=>`<label class="field"><span>${label}</span><input name="review-prep.${key}" maxlength="300" value="${esc(original.preparation[key]||'')}"></label>`).join('')}</div>` : ""}
      <div class="reflection-grid"><section class="reflection-card"><h2>私人便笺</h2>
        <label class="field"><span class="sr-only">想留给自己的便笺（可选）</span><textarea name="note" maxlength="320" placeholder="我当时在意的是……">${esc(draft.note)}</textarea></label>
        ${check("includeNote", "把这条私人便笺写入HTML报告", draft.includeNote)}</section><section class="reflection-card"><h2>我想带走的一句话</h2>
        ${suggestion ? `<div>${button("suggest", "用一个可能的发现作草稿")}</div>` : ""}
        <label class="field"><span class="sr-only">我想带走的一句话（可选）</span><input type="text" name="accepted" value="${esc(draft.accepted)}" maxlength="96" placeholder="按自己的话写，可以留空"></label>
        ${check("confirmed", "这句话是我认领的发现，可用于报告和Dating卡", draft.confirmed)}</section>
      </div>
      <div class="buttons">${button("final", "查看这场回看", "primary")}${button("save-home", "结束并保存已完成摘要")}${button("reset", "清空本场", "quiet danger")}</div>
      <div id="radar-host"></div>
    </section>`;
  }

  function exportDraft() {
    return { ...draft, nickname: config.nickname, expectation: config.expectation };
  }

  function cardOptions(preview=false) {
    const options=exportDraft();
    if(task){
      options.selected=draft.selected??original.events.findIndex(event=>event.inputType!=="action");
      options.confirmed=preview||draft.confirmed;
    }
    return options;
  }

  function final() {
    const approved = report.claim(original, exportDraft(), alternative);
    const experiment = report.experiment(original, exportDraft(), alternative);
    return `<section class="panel report-panel">
      ${heading("", "散场之后", esc(original.outcome))}
      <dl class="report-summary"><div><dt>这场对象</dt><dd>${esc(engine.resolveRole(original)?.name)}</dd></div><div><dt>场景</dt><dd>${esc(sceneName(original.initialScene||original.scene,original))}</dd></div><div><dt>互动</dt><dd>${original.events.length}回合${alternative?" · 已重演":""}</dd></div></dl>
      <article class="ticket"><p class="meta">这场 · ${[...new Set(original.stations || [original.scene])].map(id=>esc(sceneName(id,original))).join(" → ")}</p>
      <h2>${approved ? "带走的一点发现" : "留给自己的一个问题"}</h2>
      <p>${esc(approved || "回到那一刻，我最想保留的是怎样的相处方式？")}</p>
      ${experiment ? `<p><strong>下次可试</strong>　${esc(experiment)}</p>` : ""}
      ${draft.includeExpectation && config.expectation.trim() ? `<p><strong>写入报告的赴约期待</strong>　${esc(config.expectation)}</p>` : ""}
      ${draft.includeNote && draft.note.trim() ? `<p><strong>写入报告的私人便笺</strong>　${esc(draft.note)}</p>` : ""}</article>
      <section class="report-share"><h2>Dating卡</h2>
        ${approved ? `<img id="card-art" class="card-preview" alt="分享卡预览：${esc(approved)}">
        ${experiment ? check("includeExperiment","在分享卡上加一个下次观察点",draft.includeExperiment) : ""}`
        : `<p class="subline">认领一句自己的发现后，就能把它做成Dating卡。</p>${button("review","返回认领发现","quiet")}`}
      </section>
      ${original.events.length?button("open-legacy-transcript","查看完整对话","quiet"):"<p>这场还没有可引用的互动。</p>"}
      ${alternative?`<section class="record-details"><h2>实际重演 · 第${alternative.branchFrom+1}回合</h2><p>${esc(alternative.outcome)}</p></section>`:""}
      ${original.events.length?check("includeFull","HTML 回看包含完整对话（默认仅摘要）",includeFull):""}
      <div class="buttons report-actions">${button("download-report", "下载 HTML 回看", "primary")}
        ${approved ? button("download-card", "下载 Dating 卡（SVG）") : ""}
        ${button("review","返回调整","quiet")}
        ${button("reset","清空本场","quiet danger")}
      </div>
      <section class="record-details"><h2>本场提醒</h2><div id="radar-host"></div><div class="buttons">${button("save-home","结束并保存已完成摘要")}</div></section>
    </section>`;
  }

  function customScenes() {
    const special=[
      {id:"perler",name:"拼豆",category:"手作",description:"各自选图案，决定要不要交换几颗颜色。",metrics:"可自填地点、费用和时长"},
      {id:"tennis",name:"网球",category:"运动",description:"先商量是热身对打，还是一起从发球开始。",metrics:"可自填地点、费用和时长"},
      {id:"track",name:"操场相约",category:"运动",description:"按现场开放情况，选择散步或慢跑。",metrics:"需要确认允许进入"},
    ];
    return [...library.scenes,...special];
  }
  const customCards=scenes=>scenes.map(item=>sceneCard(item,"custom-scene",{selected:(preparation.template||config.scene)===item.id})).join("");
  function customScenePicker() {
    const scenes=customScenes().filter(item=>customCategory==="全部"||item.category===customCategory);
    return `<div class="custom-scene-picker">${categoryFilters("custom",customCategory)}<div class="scene-grid" id="custom-grid">${customCards(scenes)}</div></div>`;
  }

  function prepBar() {
    if (preparation.step===1) {
      const count=window.DatingPreparation.assumptionCount(preparation);
      return selectionBar("builder-bar",`已设置${count}项`, "其余保持未知", "prep-next","继续选场景 →",
        {extra:button("prep-back","上一步","quiet")});
    }
    const selected=customScenes().find(item=>item.id===(preparation.template||config.scene));
    const issue=selected?.id==="track"&&!preparation.accessConfirmed?"请先确认操场允许进入":"";
    const outside=selected&&customCategory!=="全部"&&selected.category!==customCategory;
    return selectionBar("builder-bar",selected?.name||"先选一个场景",
      [issue,outside?"在当前分类外":""].filter(Boolean).join(" · "),
      "prep-next","确认偏好 →",{disabled:Boolean(issue),extra:button("prep-back","上一步","quiet")});
  }
  function preparationView() {
    const budgetFields = `<div class="field-row"><label class="field">本场预算（元）<input name="budget" type="number" min="0" max="100000" value="${config.budget}"></label><label class="field">可用时间（分钟）<input name="timeBudget" type="number" min="5" max="1440" value="${config.timeBudget}"></label></div>`;
    const adultField = `<fieldset class="adult-gate"><legend>开始前确认</legend>${check("adult", "我已年满18岁", config.adult)}</fieldset>`;
    const step=preparation.step;
    if(picker?.kind==="partner"){
      const frame={crumb:crumb("自己捏人","cancel-picker","取消修改"),controls:""};
      return window.DatingPreparation.render(preparation,library,{frame,direct:true,currentScene:config.scene,canUndo:Boolean(partnerUndo),activeGroup:activeBuilderGroup,singleStep:true,
        flowBar:selectionBar("builder-bar",`已设置${window.DatingPreparation.assumptionCount(preparation)}项`,"其余保持未知","apply-partner","使用这个对象",{extra:button("cancel-picker","取消修改","quiet")})});
    }
    const frame = step===1 ? {crumb:crumb("角色库"),controls:roleTabs(true)+steps(0)}
      : {crumb:crumb(step===2?"选场景":"确认偏好","prep-back","上一步"),controls:steps(step===2?1:2)};
    return window.DatingPreparation.render(preparation, library, {budgetFields, adultField, currentScene:config.scene, frame:step?frame:"", direct:directPreparation, sceneCards:step===2&&directPreparation?customScenePicker():"", flowBar:step===1||(step===2&&directPreparation)?prepBar():"", canUndo:Boolean(partnerUndo), activeGroup:activeBuilderGroup,issue:preparationIssue}) + connectionOptions();

  }

  function sceneEditor() {
    const templates=window.DatingPreparationScenes.templates;
    const choices=[...library.scenes.map(scene=>[scene.id,scene.name]),...Object.entries(templates).map(([id,item])=>[id,item.name])];
    return `<section class="panel task-setup">${crumb("自定义地点","cancel-picker","取消修改")}<h1 tabindex="-1">自定义地点</h1>
      <label class="field">活动模板<select name="scene-edit.template">${choices.map(([id,name])=>option(id,esc(name),sceneDraft.template)).join("")}</select></label>
      <label class="field">地点称呼<input name="scene-edit.place" maxlength="100" value="${esc(sceneDraft.place)}" placeholder="使用虚构或泛化称呼"></label>
      <div class="field-row"><label class="field">模拟人均费用（元）<input type="number" min="0" max="100000" name="scene-edit.budget" value="${esc(sceneDraft.budget??"")}" placeholder="沿用模板"></label>
      <label class="field">预计时长（分钟）<input type="number" min="0" max="1440" name="scene-edit.duration" value="${esc(sceneDraft.duration??"")}" placeholder="沿用模板"></label></div>
      <div id="scene-track-fields"${sceneDraft.template==="track"?"":" hidden"}><label class="field">操场活动<select name="scene-edit.activity">${option("walk","散步",sceneDraft.activity)}${option("jog","慢跑",sceneDraft.activity)}</select></label>${check("scene-edit.accessConfirmed","已确认可进入",sceneDraft.accessConfirmed)}</div>
      <p class="subline">地点是本场设定，开放和预约信息需要自行确认。费用留空时用活动模板的模拟值。</p>
      <p id="scene-edit-error" class="form-error" role="alert"></p><div class="buttons">${button("apply-custom-scene","使用这个地点","primary")}${button("cancel-picker","取消修改","quiet")}</div></section>`;
  }

  const views = {taskSetup, transcript, offlineView, savedReviews, legacyJournal, evidenceView, preparation:preparationView, sceneEditor, cover, roles:roleLibrary, sceneCatalog, preferences, settings, invitation, live, review, final, practiceReview };
  function show(next, message = "", focus = true, route = {}) {
    if (window.history && !route.fromHistory) {
      const state = {datingGod:true, screen:next, ...(picker?{picker}:{}), ...(next==="preparation"?{step:preparation.step}:{})};
      try {
        if (route.replace || !screen) window.history.replaceState(state, "", `#${next}`);
        else if (next !== screen || (next==="preparation" && window.history.state?.step!==preparation.step)) {
          window.history.pushState(state, "", `#${next}`);
        }
      } catch { /* Some local file viewers do not support history writes. */ }
    }
    const liveUpdate=screen==="live"&&next==="live"&&app.querySelector(".live-panel")?.nodeType;
    screen = next;
    if (liveUpdate) {
      const recordHost=document.getElementById("radar-host");
      updateRegion(".live-panel",live(),true);
      if (recordHost) document.getElementById("radar-host")?.replaceWith(recordHost);
      const marker=app.querySelector(".nav-live-status");
      if(marker) marker.textContent=run.phase==="paused"?"约会已暂停":"约会进行中";
    } else app.innerHTML = navigation() + views[next]() + (next==="live"?"":connectionDialog());
    if (modelMode && next === "live" && !run.rehearsalTask) {
      const last = run.events.at(-1);
      const line = app.querySelector("#model-line");
      const detail = app.querySelector("#model-detail");
      if (line) line.textContent = last?.reply || modelOpening?.line || "";
      if (detail) detail.textContent = last?.detail || modelOpening?.detail || "";
      const input = app.querySelector('[name="utterance"]');
      if (input) input.value = utterance;
    }
    if (!liveUpdate && next!=="evidenceView" && !(task && next==="live")) radar.mount(next === "legacyJournal" ? "archive" : false);
    status.textContent = message;
    refreshCardPreview();
    if(next==="live"&&task&&liveUpdate&&typeof app.querySelector(".composer")?.scrollIntoView==="function"){
      app.querySelector(".composer").scrollIntoView({block:"nearest"});
    }
    if (focus && !liveUpdate) app.querySelector("h1")?.focus({preventScroll:false});
    else if (liveUpdate && focus) app.querySelector(".line")?.focus({preventScroll:true});
  }

  window.addEventListener?.("popstate", event => {
    const next = event.state?.datingGod ? event.state.screen : null;
    if (suspended && next!=="cover") { show("cover","",true,{replace:true});return; }
    if(next==="journal"&&screen!=="live"){newTask("practice");return;}
    if (!next || (!Object.hasOwn(views,next)&&next!=="journal")) return;
    if((next==="taskSetup"&&!task)||(next==="offlineView"&&!offline)){show("cover","",true,{replace:true});return;}
    if(next==="sceneEditor"&&!sceneDraft){show(task?"taskSetup":"sceneCatalog","",true,{replace:true});return;}
    if(next==="transcript"&&!original){show("cover","",true,{replace:true});return;}
    if(next==="evidenceView"&&!original?.rehearsalTask){show("cover","",true,{replace:true});return;}
    if(next==="live"&&run?.phase==="ended"&&original){show(original.rehearsalTask?"evidenceView":"review","",true,{replace:true});return;}
    if ((next==="invitation"&&!candidates.length) || (["live","review","final","practiceReview"].includes(next)&&!run)) {
      show("cover", "", true, {replace:true});
      return;
    }
    if (next==="preparation" && Number.isInteger(event.state.step)) preparation.step=Math.max(0,Math.min(3,event.state.step));
    if (screen === "live" && next !== "live") {
      window.history?.pushState({datingGod:true,screen}, "", `#${screen}`);
      if(!busy)openFlowDialog("leave");
      status.textContent = "这场还在进行。可以暂停并离开，或先结束再回看。";
      return;
    }
    picker=event.state.picker||null;
    show(next, "", true, {fromHistory:true});
    if(focusAfterReturn){
      app.querySelector(`[data-go="${focusAfterReturn}"]`)?.focus();
      focusAfterReturn="";
    }
    if(next==="evidenceView"||next==="final")window.scrollTo?.(0,reportScroll);
  });

  function refreshCardPreview() {
    if (cardPreviewUrl) URL.revokeObjectURL(cardPreviewUrl);
    cardPreviewUrl = null;
    const preview = document.getElementById("card-art");
    if (!preview) return;
    const image = report.card(original, cardOptions(true), alternative);
    preview.hidden=!image;
    if(!image)preview.removeAttribute?.("src");
    if (!image) return;
    cardPreviewUrl = URL.createObjectURL(new Blob([image], { type: "image/svg+xml;charset=utf-8" }));
    preview.src = cardPreviewUrl;
  }

  async function startPractice(ruleId) {
    config.practiceRuleId=ruleId;modelMode=true;
    const template=window.RadarCore.selectPractice(ruleId);
    const scene=library.scenes.find(s=>s.activityId===template.activityId);
    if(scene)config.scene=scene.id;
    if(!config.adult){show("preferences","先确认已年满18岁，再进入独立模型练习。");return;}
    const role=engine.match(config)[0];if(role)startDate(role);else show("preferences","请调整活动与对象偏好。");
  }
  function practiceReview(){return `<section><h1>这一小段，先练到这里</h1><p>独立练习只记录本次言行，不据此认定已经改好。</p>${run.events.map(e=>`<p>你：${esc(e.label)}</p><p>TA：${esc(e.reply)}</p>`).join("")}<div id="radar-host"></div>${button("save-home","结束并保存已完成摘要")}${button("reset","清空本场")}</section>`;}
  function finish() {
    if(task&&run.rehearsalTask){
      if(run.branchFrom===null){original=run;primarySessionId=session?.sessionId;}
      else alternative=run;
      show("evidenceView");
      if(!sessionExpired&&!analysis&&original.events.some(event=>event.inputType!=="action"))loadReport(primarySessionId);
      return;
    }
    if(run.practiceRuleId){show("practiceReview");return;}
    if (run.branchFrom === null) original = run;
    else alternative = run;
    show("review");
  }

  function startDate(role, runConfig=config) {
    radar.begin(null);
    const preparedGoal=task?.goal.trim();
    const taskInput=task?{
      kind:task.kind,goal:preparedGoal||"练习我在意的时刻",duration:task.duration,style:task.style,
      ...(task.moment?{moment:task.moment}:{}),
      ...([task.context,checklist.plan].some(value=>value?.trim())?{context:[task.context,checklist.plan].filter(value=>value?.trim()).join("\n").slice(0,240)}:{})
    }:null;
    if (modelMode) return modelRequest("/api/session", {
      ...(taskInput?{task:taskInput}:{}),
      config:{radarEnabled:!task,...(config.practiceRuleId?{practiceRuleId:config.practiceRuleId}:{}),...Object.fromEntries(["adult","scene","player","presentation","avoid","seed","mode","traits","interest","surprise","stage","intent","exclusivity","budget","timeBudget","alcohol","experience","diet","partnerSpec","sceneSpec","preparation"].map(key=>[key,runConfig[key]]))},
      roleId:role.id,
    }, value => {
      radar.begin(value.sessionId);
      radar.attach(value.sessionId,false,!!run?.practiceRuleId);
      if(value.radar) radar.update(value.radar);
      modelOpening = originalOpening = value.opening;
      hint = config.guidance;
      show("live");
    });
    run = engine.createRun(runConfig, role.id);
    radar.setContext(run);
    hint = config.guidance;
    show("live");
  }

  function checkAdult() {
    if (config.adult) return true;
    status.textContent = "确认已年满 18 岁后，才能进入约会。";
    app.querySelector('[name="adult"]')?.focus();
    return false;
  }

  function download(text, name, type) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = "已发起本地下载。";
  }

  app.addEventListener("input", (event) => {
    if (radar.handleInput(event)) return;
    const { name, value, checked, type } = event.target;
    if(name==="record-kind"||name==="record-scene"){
      if(name==="record-kind")recordKind=value;else recordScene=value;
      updateRegion("#record-stack",recordCards(savedRecords()));return;
    }
    if (["role-search","role-gender","role-trait"].includes(name)) {
      if (event.isComposing) return;
      if (name==="role-search") roleSearch=value;
      if (name==="role-gender") roleGender=value;
      if (name==="role-trait") roleTrait=value;
      roleLimit=12;
      refreshRoles(true);
      return;
    }
    if (name === "role-choice" && candidates[Number(value)]) {
      candidateIndex = Number(value);
      show("invitation", "", false);
      app.querySelector('[name="role-choice"]')?.focus();
      return;
    }
    if (name === "prep-import") { importText=value; return; }
    if (name?.startsWith("review-prep.")) { const key=name.slice(12);if(['claimedAction','question','fallback'].includes(key) && original?.preparation)original.preparation[key]=value;return; }
    if (name?.startsWith("prep.")) {
      const key = name.slice(5);
      if (key === "name" || key === "presentation") preparation.partnerSpec[key] = value;
      else if (Object.hasOwn(preparation, key)) preparation[key] = type === "checkbox" ? checked : value;
      if (key === "name") {
        const preview = document.getElementById("partner-preview-name");
        if (preview) preview.textContent = value.trim() || "你的对象草稿";
      }
      if (key==="presentation" || key==="accessConfirmed") refreshBuilderSummary();
      if (key === "template") {
        const trackFields = app.querySelector(".track-fields");
        if (trackFields) trackFields.hidden = value !== "track";
      }
      return;
    }
    if (name?.startsWith("partner.")) {
      const [,group,key] = name.split(".");
      preparation.partnerSpec[group] ||= {};
      preparation.partnerSpec[group][key] = ["interests","hardNo"].includes(key) ? value.split(/[,，]/).map(x=>x.trim()).filter(Boolean) : value;
      preparation.partnerSpec.provenance ||= {};
      preparation.partnerSpec.provenance[group+"."+key] = value && value !== "unknown" ? "assumption" : "unknown";
      refreshBuilderSummary();
      return;
    }
    if (name?.startsWith("lock.")) {
      const path=name.slice(5);
      preparation.locks=checked?[...new Set([...preparation.locks,path])]:preparation.locks.filter(x=>x!==path);
      refreshBuilderSummary();
      return;
    }
    if(name?.startsWith("scene-edit.")&&sceneDraft){
      const key=name.slice("scene-edit.".length);
      sceneDraft[key]=type==="checkbox"?checked:value;
      if(key==="template"){
        const track=app.querySelector("#scene-track-fields");
        if(track?.nodeType)track.hidden=value!=="track";
      }
      return;
    }
    if(name==="task-goal"&&task){task.goal=value;task.moment=setTaskMomentFromContext(value);recommendTaskScene();clearTaskError();return;}
    if(name==="task-context"&&task){
      task.context=value;
      if(task.kind==="practice"&&!task.goal){task.moment=setTaskMomentFromContext(value);recommendTaskScene();}
      clearTaskError();return;
    }
    if(name==="task-scene"&&task){taskSceneDefault=!value;if(value)config.scene=value;recommendTaskScene();return;}
    if(name==="task-duration"){task.duration=value;return;}
    if(name==="task-style"){task.style=value;return;}
    if(name==="task-plan"){checklist.plan=value;return;}
    if(name==="includeFull"){includeFull=checked;updateRegion("#export-preview",exportEvidencePreview());return;}
    if(name?.startsWith("checklist.")){checklist[name.slice(10)]=value;return;}
    if(name==="utterance"&&task) {
      if(value!==utterance&&!retryTurn?.uncertain)retryTurn=null;
      utterance=value;selectedDraft=-1;
      setPressed("draft-index",null);
      const send=app.querySelector('[data-go="send"]');
      if(send?.nodeType){send.disabled=busy||sessionExpired||!retryTurn?.uncertain&&!value.trim();if(!busy&&!retryTurn)send.textContent="发送";}
      return;
    }
    if (name === "utterance") { if (utterance !== value) retryTurn = null; utterance = value; return; }
    if (name === "traits" || name === "avoid") {
      const list = config[name];
      if (checked && name === "traits" && list.length >= 3) {
        event.target.checked = false;
        status.textContent = "最多选择三项相处偏好。";
        return;
      }
      config[name] = checked ? [...list, value] : list.filter((item) => item !== value);
    } else if (Object.hasOwn(config, name)) {
      if (name === "budget" || name === "timeBudget") {
        if(screen==="taskSetup"){
          setupNumbers[name]=value;
          const number=value===""?(name==="budget"?300:180):Number(value);
          const valid=Number.isFinite(number)&&number>=(name==="budget"?0:5)&&number<=(name==="budget"?100000:1440)&&(name==="budget"||Number.isInteger(number));
          if(valid){config[name]=number;clearTaskError();}
          return;
        }
        const number = Number(value);
        config[name] = Number.isFinite(number) ? Math.max(name === "budget" ? 0 : 5, Math.min(name === "budget" ? 100000 : 1440, Math.round(number))) : (name === "budget" ? 300 : 180);
        return;
      }
      config[name] = type === "checkbox" ? checked : value;
      if(name==="mode"&&screen==="taskSetup")modeExplicit=true;
      if (name==="adult") {
        if(checked&&screen==="taskSetup")clearTaskError();
        const next=app.querySelector("#preferences-next");
        const reason=app.querySelector("#adult-reason");
        if (next?.nodeType) {
          next.disabled=!checked;
          if (checked) next.removeAttribute("aria-describedby");
          else next.setAttribute("aria-describedby","adult-reason");
        }
        if (reason?.nodeType) reason.hidden=checked;
      }
      if (name === "player") {
        config.presentation = value === "man" ? "woman" : value === "woman" ? "man" : "unspecified";
        const field=app.querySelector('[name="presentation"]');
        if (field?.nodeType) field.value=config.presentation;
        status.textContent="已根据本场视角调整对象偏好。";
      }
    } else if (Object.hasOwn(draft, name)) {
      draft[name] = type === "checkbox" ? checked : value;
      if(task&&(name==="note"||name==="includeNote"))updateRegion("#export-preview",exportEvidencePreview());
      if (name === "accepted") {
        draft.confirmed = false;
        const error=app.querySelector("#share-error");
        if(error?.nodeType)error.textContent="";
        app.querySelector('[name="confirmed"]').checked = false;
        refreshCardPreview();
      }
      if (name === "includeExperiment") refreshCardPreview();
    }
  });

  function openSceneFirst(sceneId) {
    config.scene=sceneId;
    selectedRoleId=null;roleDetailOpen=false;
    preparation.template=sceneId;
    preferredRoleId=null;
    sceneFirst=quickEntry=true;
    modelMode=false;
    planIssue="";
    show("roles");
  }

  function showPlanIssue() {
    planIssue=explainPlan();
    if (!planIssue) return false;
    show("settings",planIssue);
    return true;
  }

  function updateRegion(selector, html, outer=false) {
    const element=app.querySelector(selector);
    if (!element?.nodeType) return false;
    if (outer) element.outerHTML=html;
    else element.innerHTML=html;
    return true;
  }
  function setPressed(attribute,value) {
    app.querySelectorAll?.(`[data-${attribute}]`).forEach(element=>{
      element.setAttribute("aria-pressed",String(element.getAttribute(`data-${attribute}`)===value));
    });
  }
  function refreshHomeScenes(filterChanged=false) {
    if (filterChanged) {
      setPressed("home-category",homeCategory);
      updateRegion("#home-refresh",homeRefresh());
    }
    if (!updateRegion("#home-scene-grid",homeSceneCards())) show("cover","",false);
    else {
      const grid=app.querySelector("#home-scene-grid");
      const animation=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? null : grid.animate?.([{opacity:.45},{opacity:1}],{duration:150});
      if (animation) {
        homeRerolling=true;
        const done=()=>{homeRerolling=false;};
        animation.finished.then(done,done);
      }
      app.querySelector("#recommendation-update").textContent=`已更新${homeRecommendations.length}个推荐场景`;
    }
  }
  function refreshBuilderSummary() {
    if (preparation.step!==1 && preparation.step!==2) return;
    const ui=window.DatingPreparation;
    const contents=ui.previewValues(preparation);
    for (const [id,value] of Object.entries(contents)) {
      const element=app.querySelector(`#${id}`);
      if (element?.nodeType) element.textContent=value;
    }
    for (const group of ["appearance","lifestyle","conditions"]) {
      const element=app.querySelector(`[data-partner-summary="${group}"]`);
      if (element?.nodeType) element.textContent=ui.groupSummary(preparation,group,2)||"可选";
    }
    const random=app.querySelector('[data-go="prep-random"]');
    const lockNote=app.querySelector("#random-lock-note");
    const locked=ui.randomizableCount(preparation)===0;
    if (random?.nodeType) random.disabled=locked;
    if (lockNote?.nodeType) lockNote.hidden=!locked;
    const label=app.querySelector("#builder-bar .selection-summary strong");
    if (label?.nodeType && preparation.step===1) label.textContent=contents["builder-summary-count"];
    if (preparation.step===2 && app.querySelector("#builder-bar")?.nodeType) updateRegion("#builder-bar",prepBar(),true);
  }

  function refreshPlan(filterChanged=false) {
    if (filterChanged) {
      setPressed("settings-category",settingsCategory);
      updateRegion("#plan-grid",planCards());
    } else {
      setPressed("scene",config.scene);
      updateRegion("#plan-warning-region",planWarning());
    }
    if (!updateRegion("#plan-bar",planBar(),true)) show("settings","",false);
  }

  function refreshRoles(resultsChanged=false) {
    const root=app.querySelector(".role-library");
    if (!root?.nodeType) { show("roles","",false); return; }
    const next=document.createElement("template");
    next.innerHTML=roleLibrary();
    const selectors=resultsChanged?[".role-results","#role-details"]:["#role-details"];
    selectors.forEach(selector=>updateRegion(selector,next.content.querySelector(selector).outerHTML,true));
    const currentBar=app.querySelector("#role-confirm-bar");
    const nextBar=next.content.querySelector("#role-confirm-bar");
    if (currentBar && nextBar) currentBar.replaceWith(nextBar);
    else if (nextBar) root.append(nextBar);
    else currentBar?.remove();
    setPressed("role",selectedRoleId);
    root.classList.toggle("has-role-choice",Boolean(selectedRoleId));
  }

  function refreshCatalog(filterChanged=false) {
    if (filterChanged) {
      setPressed("scene-category",sceneCatalogCategory);
      updateRegion("#catalog-grid",catalogCards());
      const count=app.querySelector("#catalog-count");
      if (count?.nodeType) count.textContent=`${sceneCatalogCategory} · ${byCategory(sceneCatalogCategory).length}种`;
    } else setPressed("scene-choice",sceneCatalogSelected);
    updateRegion("#catalog-preview",scenePreview(engine.sceneById(sceneCatalogSelected)));
    if (!updateRegion("#catalog-bar",catalogBar(),true)) show("sceneCatalog","",false);
  }

  let pendingDialog = "", pendingSuggestion=null, pendingRecord=-1, pendingAction=null;
  function useSuggestion(index,line) {
    selectedDraft=index;suggestionText=utterance=line;if(!retryTurn?.uncertain)retryTurn=null;
    show("live","",false);
    const field=app.querySelector('[name="utterance"]');
    field?.focus();
    field?.setSelectionRange?.(line.length,line.length);
  }
  app.addEventListener("keydown",event=>{
    if(task && event.target.name==="utterance" && !event.isComposing && event.key==="Enter" && (event.ctrlKey||event.metaKey)){
      event.preventDefault();
      if(utterance.trim()&&!busy)sendModel({text:utterance.trim()});
    }
  });
  function openFlowDialog(kind, opener) {
    if (pendingDialog) return;
    pendingDialog=kind;
    if (!app.nodeType) return;
    const dialog=document.createElement("dialog");
    dialog.className="flow-dialog";
    dialog.setAttribute("aria-labelledby","flow-dialog-title");
    const leaving=kind==="leave";
    const extra={
      draft:["换成这句？","你已经写了一些内容。替换后会用新的草稿。","replace-draft","替换草稿"],
      end:["现在结束并看复盘？",utterance.trim()?"复盘只使用已发送的对话。输入框中的草稿还没发送。":"复盘会保留已发送的对话。你可以查看原话。","finish-session","结束并看复盘"],
      replay:["从这个回合重演？","你可以换一种回应。原来的对话会保留在复盘中。","confirm-replay","开始重演"],
      action:["确认这个选择？",pendingAction?.label||"","submit-action","确认"],
      record:["删除这条摘要？","仅删除当前浏览器中的这条摘要。","confirm-record-delete","确认删除"],
      "discard-edit":["放弃这次修改？","已应用到本场的设定会保留。","confirm-cancel-picker","放弃修改"],
      "switch-task":["开始另一种练习？","当前未开始的准备将被替换。","confirm-switch-task","另开一场"],
    }[kind];
    dialog.innerHTML=extra?`<h2 id="flow-dialog-title">${extra[0]}</h2><p>${esc(extra[1])}</p><div class="buttons">${button("close-flow-dialog","返回","quiet")}${button(extra[2],extra[3],"primary")}</div>`:`<h2 id="flow-dialog-title">${leaving?"怎么离开现场？":"清空这场约会？"}</h2>
      <p>${leaving?"可以暂停后从首页回来，也可以直接结束并查看复盘。":"这场的原局、重演和关联自查摘要将被移除。已经下载的文件会保留。"}</p>
      <div class="buttons">${button("close-flow-dialog","返回","quiet")}${leaving?`${button("end-from-dialog","结束并回看")}${button("pause-and-leave","暂停并离开","primary")}`:button("confirm-reset","确认清空","primary danger-fill")}</div>`;
    app.append(dialog);
    dialog.addEventListener("close",()=>{ if(pendingDialog===kind) pendingDialog="";dialog.remove();if(opener?.isConnected)opener.focus({preventScroll:true}); });
    dialog.showModal();
    dialog.querySelector('[data-go="close-flow-dialog"]').focus();
  }
  function closeFlowDialog() {
    pendingDialog="";
    app.querySelector("dialog.flow-dialog")?.close?.();
  }
  function leavePaused() {
    suspended=true;
    show("cover");
  }

  app.addEventListener("click", async (event) => {
    if (event.target.closest("button")?.dataset.radar) return radar.handle(event);
    const target = event.target.closest("button");
    if (!target) return;
    const {go,action,turn,select,scene,role,sceneChoice,sceneCategory,homeScene,homeCategory:category,settingsCategory:planCategory,customCategory:prepCategory,customScene}=target.dataset;
    if (busy && screen !== "live") return;
    if (suspended && !["return-live","end-suspended"].includes(go)) return;
    if (category && category!==homeCategory) {
      homeCategory=category;
      homeRecommendations=dealHomeScenes(category,homeRecommendations);
      refreshHomeScenes(true);
      return;
    }
    if (role) {
      if (!filteredRoles().some(item=>item.id===role)) return;
      selectedRoleId=role;
      roleDetailOpen=false;
      refreshRoles();
      return;
    }
    if (prepCategory || customScene) {
      if (prepCategory) {
        customCategory=prepCategory;
        setPressed("custom-category",customCategory);
        updateRegion("#custom-grid",customCards(customScenes().filter(item=>customCategory==="全部"||item.category===customCategory)));
      }
      if (customScene) {
        preparation.template=customScene;
        setPressed("custom-scene",customScene);
        const fields=app.querySelector(".track-fields");
        if (fields?.nodeType) {
          fields.hidden=customScene!=="track";
          if (customScene==="track") fields.closest("details").open=true;
        }
      }
      if (!updateRegion("#builder-bar",prepBar(),true)) show("preparation","",false);
      return;
    }
    if (sceneCategory) {
      if (sceneCatalogCategory!==sceneCategory) {
        sceneCatalogCategory=sceneCategory;
        refreshCatalog(true);
      }
      return;
    }
    if (planCategory) {
      settingsCategory=planCategory;
      refreshPlan(true);
      return;
    }
    if (sceneChoice) {
      if (!engine.sceneById(sceneChoice)) return;
      sceneCatalogSelected=sceneChoice;
      sceneCatalogSource="";
      refreshCatalog();
      return;
    }
    if (homeScene) {
      if (!engine.sceneById(homeScene)) return;
      homeSceneId=homeScene;
      setPressed("home-scene",homeSceneId);
      if(!updateRegion("#home-scene-preview",homeScenePreview()))show("cover","",false);
      app.querySelector("#home-scene-preview h2")?.focus();
      return;
    }
    if (scene) {
      if (!library.scenes.some(item=>item.id===scene)) return;
      config.scene=scene;
      planIssue=explainPlan();
      refreshPlan();
      return;
    }
    if(target.dataset.builderGroup&&screen==="preparation"){
      activeBuilderGroup=target.dataset.builderGroup;
      show("preparation","",false);
      app.querySelector(`[data-builder-group="${activeBuilderGroup}"]`)?.focus({preventScroll:true});
      return;
    }
    if(target.dataset.taskGoal&&task&&screen==="taskSetup"){
      task.goal=target.dataset.taskGoal;
      task.moment=moments[goals.indexOf(task.goal)];
      setPressed("task-goal",task.goal);
      recommendTaskScene();
      clearTaskError();
      return;
    }
    if(target.dataset.offlineChoice!==undefined&&screen==="offlineView"&&config.adult){
      offline.selected=target.dataset.offlineChoice;
      setPressed("offline-choice",offline.selected);
      return;
    }
    if(target.dataset.draftIndex!==undefined && !busy){
      const index=Number(target.dataset.draftIndex);const line=currentSuggestions()[index];
      if(!line)return;
      if(utterance.trim()&&utterance!==suggestionText&&utterance!==line){pendingSuggestion={index,line};openFlowDialog("draft",target);return;}
      return useSuggestion(index,line);
    }
    if(target.dataset.confirmAction&&!busy){
      pendingAction=engine.choices(run).find(item=>item.id===target.dataset.confirmAction);
      if(pendingAction)openFlowDialog("action",target);
      return;
    }
    if(target.dataset.evidenceReplay!==undefined&&original&&primarySessionId&&!sessionExpired){
      const index=Number(target.dataset.evidenceReplay);
      if(!Number.isInteger(index)||!original.events[index])return;
      pendingReplay=index;
      openFlowDialog("replay",target);
      return;
    }
    if(target.dataset.recordRetry!==undefined){
      const item=savedRecords().find(row=>row.id===target.dataset.recordRetry);
      if(item&&!busy&&!suspended){
        reset(null);
        newTask(item.task.kind==="rehearsal"?"rehearsal":"practice");
        task={...task,goal:item.task.goal,duration:item.task.duration||task.duration,style:item.task.style||task.style,
          moment:moments.includes(item.task.moment)?item.task.moment:undefined};
        const scene=engine.sceneById(item.scene);
        if(scene){config.scene=scene.id;taskSceneDefault=false;}else recommendTaskScene();
        show("taskSetup");
      }
      return;
    }
    if(target.dataset.recordDelete!==undefined){pendingRecord=target.dataset.recordDelete;openFlowDialog("record",target);return;}
    if (action) {
      if (modelMode) return sendModel({actionId:action});
      radar.before();
      const updated = engine.act(run, action, Number(turn));
      if (updated === run) return;
      run = updated;
      radar.offline(run);
      hint = false;
      if (run.phase === "ended") finish();
      else show("live");
      return;
    }
    if (select !== undefined) {
      if (draft.selected !== Number(select)) draft.confirmed = false;
      draft.selected = Number(select);
      show("review", "", false);
      app.querySelector(`[data-select="${select}"]`).focus({preventScroll:true});
      return;
    }
    if (go?.startsWith("prep-") || go === "prepare") {
      try {
        if(go === "prepare") { show("preparation");return; }
        if(go === "prep-exit") { show("cover");return; }
        if (go==="prep-next" || go==="prep-back") preparationIssue="";
        if (go==="prep-next" && preparation.step===2 && preparation.template==="track" && !preparation.accessConfirmed) {
          status.textContent="请先确认操场允许进入。";
          const access=app.querySelector('[name="prep.accessConfirmed"]');
          access?.focus();
          return;
        }
        if(go === "prep-next")preparation.step=Math.min(3,preparation.step+1);
        if (go === "prep-back") {
          if (directPreparation && preparation.step === 1) { show("roles"); return; }
          preparation.step = Math.max(0, preparation.step - 1);
        }
        if(go === "prep-custom")preparation.source="custom";
        if(go === "prep-existing") { preparation.source="preset";preparation.presetId=preparation.presetId||library.roles[0].id;preparation.partnerSpec=JSON.parse(JSON.stringify(window.DatingPartnerModel.fromPreset(library.roles.find(r=>r.id===preparation.presetId)))); }
        if(go === "prep-next" && preparation.source==="preset" && preparation.step===2) preparation.partnerSpec=JSON.parse(JSON.stringify(window.DatingPartnerModel.fromPreset(library.roles.find(r=>r.id===preparation.presetId))));
        if (go==="prep-random" || go==="prep-undo") {
          let message="";
          if (go==="prep-random") {
            if (!window.DatingPreparation.randomizableCount(preparation)) return;
            const before=preparation.partnerSpec;
            const locked={};
            for (const path of preparation.locks) {
              const [group,key]=path.split(".");
              (locked[group]||={})[key]=before[group]?.[key];
            }
            const after=JSON.parse(JSON.stringify(window.DatingPartnerModel.random(before,crypto.getRandomValues(new Uint32Array(1))[0],locked)));
            partnerUndo={partnerSpec:before,source:preparation.source};
            preparation.partnerSpec=after;
            preparation.source="random";
            const changed=window.DatingPreparation.fields.filter(([group,key])=>JSON.stringify(before[group]?.[key])!==JSON.stringify(after[group]?.[key])).length;
            message=`更新了${changed}项，保留${preparation.locks.length}项锁定设置。`;
          } else if (partnerUndo) {
            preparation.partnerSpec=partnerUndo.partnerSpec;
            preparation.source=partnerUndo.source;
            partnerUndo=null;
            message="已撤销上次随机。";
          }
          show("preparation",message,false);
          app.querySelector(`[data-go="${go==="prep-undo"?"prep-random":go}"]`)?.focus({preventScroll:true});
          return;
        }
        if(go === "prep-save") { window.localStorage.setItem("dating-preparation-v1",window.DatingPreparation.exportConfig(preparation));status.textContent="仅保存对象配置，没有保存聊天。";return; }
        if(go === "prep-export") { download(window.DatingPreparation.exportConfig(preparation),"dating-preparation.json","application/json");return; }
        if(go === "prep-delete") { window.localStorage.removeItem("dating-preparation-v1");status.textContent="已删除本机配置，本场仍保留。";return; }
        if(go === "prep-load" || go === "prep-import") { const text=go === "prep-load" ? window.localStorage.getItem("dating-preparation-v1") : importText;if(!text)throw Error("没有可读取的配置");const restored=window.DatingPreparation.importConfig(text);if(!window.DatingPartnerModel.validate(restored.partnerSpec).valid)throw Error("对象配置不合法");preparation=restored;partnerUndo=null; }
        if (["prep-offline", "prep-model", "prep-auto"].includes(go)) {
          if (busy || !checkAdult()) return;
          const next = window.DatingPreparation.compile(preparation, config, library);
          const validation = window.DatingPartnerModel.validate(next.partnerSpec);
          if (!validation.valid) throw Error("请调整对象资料："+validation.errors.join("；"));
          const roles = engine.match(next);
          if (!roles.length) throw Error("请调整对象与活动的预算或时间。");
          const useModel = go !== "prep-offline" && await detectModel();
          if(go==="prep-auto"&&!task)task={kind:"rehearsal",goal:preparation.focus||"自然交流",duration:"full",style:"natural"};
          if (screen !== "preparation") return;
          if (task && go!=="prep-offline" && !useModel) return connectionFailed(go);
          if (go==="prep-offline")task=null;
          if (go === "prep-model" && !useModel) throw Error("自由输入暂不可用，可以用点选开始。");
          if (screen !== "preparation") return;
          modelMode = useModel;
          return startDate(roles[0], next);
        }
        show("preparation");
      } catch(error) {
        const message=error.message||"配置操作失败";
        if (preparation.step===3&&["prep-offline","prep-model","prep-auto"].includes(go)) {
          preparationIssue=message;
          show("preparation",message,false);
          app.querySelector(".plan-warning")?.focus();
        } else status.textContent=message;
      }
      return;
    }
    switch (go) {
      case "continue-setup": if(task&&!run)show("taskSetup");break;
      case "edit-role":case "edit-scene":
        if(task&&screen==="taskSetup")openPicker(go==="edit-role"?"role":"scene",go);
        break;
      case "edit-custom-scene":openPicker("custom-scene",go);break;
      case "cancel-picker":
        if(["partner","custom-scene"].includes(picker?.kind))openFlowDialog("discard-edit",target);
        else returnFromPicker();
        break;
      case "confirm-cancel-picker":
        if(pendingDialog==="discard-edit"){closeFlowDialog();returnFromPicker();}
        break;
      case "apply-partner": {
        if(picker?.kind!=="partner")break;
        const result=window.DatingPartnerModel.validate(preparation.partnerSpec);
        if(!result.valid){status.textContent=result.errors.join("；");break;}
        const chosen=JSON.parse(JSON.stringify(preparation));
        ensureTask();
        appliedPartner=chosen;
        preferredRoleId=null;
        planIssue="";
        if(picker)returnFromPicker(true);else show("taskSetup");
        break;
      }
      case "apply-custom-scene": {
        if(!sceneDraft||picker?.kind!=="custom-scene")break;
        const spec={...sceneDraft};
        for(const key of ["budget","duration"]){
          if(spec[key]===""||spec[key]===undefined)delete spec[key];else spec[key]=Number(spec[key]);
        }
        try{window.DatingPreparationScenes.build(spec);}
        catch(error){const feedback=app.querySelector("#scene-edit-error");if(feedback)feedback.textContent=error.message;break;}
        const defaultId=window.DatingPreparationScenes.compatibilitySceneId(spec.template);
        if(!defaultId)break;
        ensureTask();
        config.scene=defaultId;
        appliedScene=spec;
        taskSceneDefault=false;
        planIssue="";
        if(picker)returnFromPicker(true);else show("taskSetup");
        break;
      }
      case "connection-help":{
        const dialog=document.getElementById("connection-help");
        if(dialog?.showModal&&!dialog.open){
          dialog.addEventListener("close",()=>target.isConnected&&target.focus(),{once:true});
          dialog.showModal();
        }
        break;
      }
      case "recheck-connection": {
        const origin=screen;
        const ready=await detectModel();
        if(screen!==origin)break;
        if(ready){failedScreen=null;connectionError="";}
        show(screen,ready?"模型已配置，可以继续准备。":"自由聊天尚未连接。",false);
        app.querySelector(ready?'[data-go="task-start"]':'.connection-note')?.focus();
        break;
      }
      case "use-home-scene":
        if(engine.sceneById(homeSceneId)){chooseForTask(homeSceneId);show("taskSetup");}
        break;
      case "new-rehearsal":requestTask("rehearsal",target);break;
      case "new-practice":requestTask("practice",target);break;
      case "confirm-switch-task":
        if(pendingDialog==="switch-task"&&pendingKind){const kind=pendingKind;closeFlowDialog();newTask(kind);}
        break;
      case "task-custom":if(task&&screen==="taskSetup")openPicker("partner",go);break;
      case "task-start": {
        if(busy||!task)break;
        const goal=task.goal.trim()||task.context?.trim();
        const invalidBudget=setupNumbers.budget!==undefined&&setupNumbers.budget!==""&&Number(setupNumbers.budget)!==config.budget;
        const invalidTime=setupNumbers.timeBudget!==undefined&&setupNumbers.timeBudget!==""&&Number(setupNumbers.timeBudget)!==config.timeBudget;
        const message=!goal?"先选一项想练的事，或写一句自己的情况。":invalidBudget?"预算需在0至100000元之间。":invalidTime?"可用时间需是5至1440分钟之间的整数。":!config.adult?"请先确认已年满18岁。":"";
        if(message){const box=app.querySelector("#task-error");if(box)box.textContent=message;app.querySelector(!goal?'[name="task-context"], [name="task-goal"]':invalidBudget?'[name="budget"]':invalidTime?'[name="timeBudget"]':'[name="adult"]')?.focus();break;}
        const {role,config:next}=resolveSetup();
        if(!role){
          const scene=setupScene(), issue=scene&&sceneIssue(scene);
          planIssue=issue?`${issue}。请换一个场景或调整预算与时间。`:"本场条件找不到可用的对象。请换对象、换地点，或调整更多设定。";
          const box=app.querySelector("#task-error");if(box)box.textContent=planIssue;
          break;
        }
        const setupSnapshot=()=>JSON.stringify([config,task,appliedPartner,appliedScene,setupNumbers,checklist]);
        const checkedSetup=setupSnapshot();
        if(target.nodeType)target.disabled=true;
        const ready=await detectModel();
        if(target.isConnected)target.disabled=false;
        if(screen!=="taskSetup")break;
        if(!ready){connectionFailed(go);break;}
        if(checkedSetup!==setupSnapshot()){
          const box=app.querySelector("#task-error");
          if(box)box.textContent="本场设置刚有更新。请核对后再开始。";
          break;
        }
        failedScreen=null;
        if(screen!=="taskSetup")break;
        modelMode=true;
        return startDate(role,next);
      }
      case "saved-reviews": if(screen!=="live"&&!busy)show("savedReviews");break;
      case "legacy-journal":show("legacyJournal");break;
      case "retry-connection": {
        const entry=failedScreen===screen?failedEntry:null;
        if(entry)app.querySelector(`[data-go="${entry}"]`)?.click?.();
        break;
      }
      case "offline-practice": return openOffline(screen);
      case "offline-return": {
        if(!offline)break;
        const back=offline.from;
        offline=null;
        if(window.history?.state?.screen==="offlineView"){
          focusAfterReturn="offline-practice";
          window.history.back();
        } else show(back,"",true,{replace:true});
        app.querySelector('[data-go="offline-practice"]')?.focus();
        break;
      }
      case "offline-restart": if(offline)openOffline(offline.from);break;
      case "offline-adult": if(checkAdult())show("offlineView");break;
      case "offline-confirm": {
        if(screen!=="offlineView"||!offline||!config.adult||offline.ended)break;
        const turn=window.DatingPracticeScenarios.choose(offlineId,offline.nodeId,offline.selected);
        if(!turn){const error=app.querySelector("#offline-error");if(error)error.textContent="先挑一句回应。";break;}
        offline.turns.push(turn);
        Object.assign(offline,{nodeId:turn.nextNode,selected:null,ended:turn.ended});
        show("offlineView");
        break;
      }
      case "request-end":
        if(sessionExpired){run={...run,phase:"ended"};return finish();}
        openFlowDialog("end",target);break;
      case "confirm-replay": {
        if(pendingDialog!=="replay"||pendingReplay===null||!primarySessionId)break;
        const index=pendingReplay;pendingReplay=null;closeFlowDialog();
        return modelRequest("/api/control",{sessionId:primarySessionId,command:"replay",index},value=>{
          draft.selected=index;modelOpening=value.opening||originalOpening;utterance="";triedTurn="";
          retryTurn=null;polish=null;coachOpen=false;selectedDraft=-1;suggestionText="";liveError="";
          show("live");
        });
      }
      case "finish-session":
        if(pendingDialog!=="end")break;
        closeFlowDialog();return control("end");
      case "replace-draft": {
        if(pendingDialog!=="draft")break;
        const next=pendingSuggestion;closeFlowDialog();
        if(next)return useSuggestion(next.index,next.line);
        break;
      }
      case "submit-action": {
        if(pendingDialog!=="action"||busy)break;
        const action=pendingAction;closeFlowDialog();
        if(action&&engine.choices(run).some(item=>item.id===action.id))return sendModel({actionId:action.id});
        break;
      }
      case "confirm-record-delete":
        if(pendingDialog==="record"){
          try{const history=readRecords().filter(item=>item.id!==pendingRecord);window.localStorage.setItem(recordKey,JSON.stringify(history));closeFlowDialog();show("savedReviews","已删除这条摘要。");}
          catch{status.textContent="无法删除本机摘要。";}
        }
        break;
      case "retry-task": {
        const previous={...task};
        const previousConfig={...config}, previousPartner=appliedPartner, previousScene=appliedScene, previousRole=preferredRoleId;
        const previousPlan=checklist.plan;
        reset(null);
        task=previous;config={...previousConfig,adult:false};appliedPartner=previousPartner;appliedScene=previousScene;preferredRoleId=previousRole;
        taskSceneDefault=false;checklist.plan=previousPlan;show("taskSetup");break;
      }
      case "polish": {
        if(polishRequest||busy||!session||!utterance.trim()){
          if(!utterance.trim())status.textContent="先写一点想说的话，再试试。";
          break;
        }
        const source=utterance;
        const active={...session,text:source};
        polishRequest=active;
        show("live","",false);
        try{
          const result=await api("/api/polish",active);
          if(polishRequest===active&&screen==="live"&&session?.version===active.version)polish={source,line:result.line};
        }catch{
          if(polishRequest===active)status.textContent="暂时没能整理草稿，原文还在。";
        }finally{
          if(polishRequest===active){
            polishRequest=null;
            if(screen==="live"&&!busy)show("live",status.textContent,false);
          }
        }
        break;
      }
      case "apply-polish":
        if(polish&&polish.source===utterance&&!busy){const line=polish.line;polish=null;return useSuggestion(-1,line);}
        break;
      case "dismiss-polish":polish=null;show("live","",false);break;
      case "retry-report":return loadReport(primarySessionId);
      case "open-legacy-transcript":
      case "open-transcript":
        if(original?.events.length){reportScroll=window.scrollY||0;show("transcript");}
        break;
      case "return-transcript":
        if(window.history?.state?.screen==="transcript")window.history.back();
        else show(original?.rehearsalTask?"evidenceView":"final");
        break;
      case "open-config":
      case "open-export":
      case "open-share-card":
      case "open-checklist":
      case "open-stations":
      case "open-live-log": {
        const id={"open-config":"config-options","open-export":"export-options","open-share-card":"share-card-options","open-checklist":"checklist-options","open-stations":"stations","open-live-log":"live-log"}[go];
        const dialog=document.getElementById(id);
        if(dialog?.showModal&&!dialog.open){
          dialog.addEventListener("close",()=>{if(target.isConnected)target.focus({preventScroll:true});},{once:true});
          dialog.showModal();
        }
        break;
      }
      case "close-content": target.closest?.("dialog")?.close();break;
      case "close-checklist": {
        const position=window.scrollY||0;
        target.closest?.("dialog")?.close();
        show("evidenceView","赴约清单已更新。",false);
        window.scrollTo?.(0,position);
        app.querySelector('[data-go="open-checklist"]')?.focus({preventScroll:true});
        break;
      }
      case "download-evidence":
        if(!original)break;
        download(report.evidenceHtml(original,alternative,analysis,exportEvidenceOptions()),"本场复盘.html","text/html;charset=utf-8");
        const exportStatus=app.querySelector("#export-status");
        if(exportStatus?.nodeType)exportStatus.textContent="已开始下载HTML报告。";
        break;
      case "save-evidence":
        if(!original?.rehearsalTask)break;
        try {
          const id=original.runId;
          const history=readRecords().filter(item=>item.id!==id);
          const {kind,goal,duration,style,moment}=original.rehearsalTask;
          history.unshift({id,date:new Date().toLocaleDateString(),task:{kind,goal,duration,style,moment},scene:original.initialScene||original.scene,summary:analysis?.findings?.[0]?.observation||`${original.events.length}回合练习`});
          window.localStorage.setItem(recordKey,JSON.stringify(history.slice(0,50)));
          if(!updateRegion(".page-nav",navigation(),true))show("evidenceView","",false);
          status.textContent="已保存这次复盘。";
        } catch { status.textContent="无法保存本机摘要，可以下载回看。"; }
        break;
      case "home":
        if (screen !== "live" && !busy) {picker=null;show("cover");}
        break;
      case "roles":
        if (screen !== "live" && !busy) {picker=null;show("roles");}
        break;
      case "all-scenes":
        if (screen!=="live" && !busy && screen!=="sceneCatalog") {
          picker=null;
          sceneCatalogSelected=null;sceneCatalogCategory="全部";sceneCatalogSource="";catalogFromPlan=false;
          show("sceneCatalog");
        }
        break;
      case "change-catalog-scene":
        sceneCatalogSelected=config.scene;sceneCatalogCategory="全部";sceneCatalogSource="";catalogFromPlan=true;
        show("sceneCatalog");
        break;
      case "use-scene": {
        const scene=engine.sceneById(sceneCatalogSelected);
        if (!scene) break;
        chooseForTask(scene.id);
        if(picker)returnFromPicker(true);else show("taskSetup");
        break;
      }
      case "choose-role-profile":
      case "choose-role": {
        const role=library.roles.find(item=>item.id===selectedRoleId);
        if(!role){status.textContent="先从列表里选一位角色。";break;}
        if(quickEntry&&!task&&!picker){
          preferredRoleId=role.id;
          if(role.modes?.length&&!role.modes.includes(config.mode))config.mode=role.modes[0];
          planIssue=explainPlan();show("settings");break;
        }
        ensureTask();
        preferredRoleId=role.id;
        appliedPartner=null;
        planIssue="";
        if(picker)returnFromPicker(true);else show("taskSetup");
        break;
      }
      case "role-list-close":
      case "role-list":
        roleDetailOpen=go==="role-list"&&!roleDetailOpen;refreshRoles();
        if(roleDetailOpen){
          app.querySelector("#role-details")?.scrollIntoView?.({block:"nearest"});
          app.querySelector("#role-details h2")?.focus({preventScroll:true});
        }else app.querySelector('#role-confirm-bar [data-go="role-list"]')?.focus({preventScroll:true});
        break;
      case "clear-role-search":
        roleSearch=roleGender=roleTrait="";roleDetailOpen=false;roleLimit=12;
        for (const name of ["role-search","role-gender","role-trait"]) {
          const input=app.querySelector(`[name="${name}"]`);
          if (input) input.value="";
        }
        refreshRoles(true);app.querySelector('[name="role-search"]')?.focus({preventScroll:true});
        break;
      case "random-role": {
        const visible=new Set(filteredRoles().map(role=>role.id));
        const eligible=engine.match({...config,adult:true,sceneSpec:appliedScene||undefined}).filter(role=>visible.has(role.id));
        if(!eligible.length){status.textContent="当前条件下没有可推荐的角色。可以调整筛选或更换场景。";break;}
        const candidates=eligible.filter(role=>role.id!==selectedRoleId);
        const pool=candidates.length?candidates:eligible;
        selectedRoleId=pool[Math.floor(secureRandom()*pool.length)].id;
        roleDetailOpen=true;
        refreshRoles();
        break;
      }
      case "continue-plan":
        if (sceneIssue(engine.sceneById(config.scene))) break;
        confirming=true;
        show("preferences");
        break;
      case "confirm-preferences":
        confirming=true;
        show("preferences");
        break;
      case "return-scenes":
        planIssue=explainPlan();
        show("settings");
        break;
      case "compatible-scenes": {
        settingsCategory="全部";
        const next=library.scenes.find(item=>item.id!==config.scene&&matchingRoles({adult:true,scene:item.id}).length);
        if (next) {
          config.scene=next.id;
          planIssue="";
          show("settings",`已选可用场景「${next.name}」，也可手动更换。`);
        } else show("settings","当前偏好下没有其他可用场景，可先改偏好或换角色。");
        break;
      }
      case "home-practice":
        return openOffline(screen);
      case "journal":
        if (screen !== "live" && !busy) requestTask("practice",target);
        break;
      case "reroll":
        if (!homeRerolling && byCategory(homeCategory).length>1) {
          homeRecommendations=dealHomeScenes(homeCategory,homeRecommendations);
          refreshHomeScenes();
        }
        break;
      case "more-roles": {
        const first=filteredRoles()[roleLimit]?.id;
        roleLimit+=12;
        refreshRoles(true);
        if (first) app.querySelector(`[data-role="${first}"]`)?.focus({preventScroll:true});
        break;
      }
      case "quick":
        quickEntry = true; modelMode = false;show("roles");
        break;
      case "custom-entry":
        if(screen==="roles")openPicker("partner",go);
        else { directPreparation=true;preparation.step=1;show("preparation"); }
        break;
      case "start-model": {
        if (!/^https?:$/.test(window.location?.protocol || "")) { status.textContent = "模型自由互动需要通过本地服务打开网页。"; break; }
        if (busy) break;
        busy = true;
        const ticket = ++generation;
        try {
          const info = await api("/api/config");
          if (ticket !== generation) break;
          if (!info.available) throw new Error("本地服务尚未配置模型，请先在服务端配置。");
          modelMode = true; confirming=false;show("preferences");
        } catch (error) { if (ticket === generation) status.textContent = error.message; }
        finally { if (ticket === generation) busy = false; }
        break;
      }
      case "radar-coach": return radar.coach(false);
      case "radar-preflight": return radar.coach(true);
      case "save-home": if(await radar.save()){reset(); status.textContent="已保存本场自查摘要。";} break;
      case "send": if (utterance.trim()||retryTurn?.uncertain) return sendModel({text:utterance.trim()}); break;
      case "cancel": return control("cancel");
      case "lower-mode": {
        if(busy||retryTurn?.uncertain||sessionExpired)break;
        const index = Object.keys(modes).indexOf(run.mode || config.mode);
        if (index <= 0) break;
        const mode = Object.keys(modes)[index-1];
        if (modelMode) return control("set-mode", {mode});
        config.mode = mode;
        run = engine.setMode(run, mode);
        show("live", "已降低强度，已发生的事会保留。");
        break;
      }
      case "start": confirming=false;modelMode = false; show("preferences"); break;
      case "preferences": show("preferences"); break;
      case "settings": if (checkAdult()) {planIssue="";show("settings");} break;
      case "blind": {
        if (!checkAdult() || !checkPlan()) break;
        let eligible = engine.match(config);
        if(preferredRoleId)eligible=eligible.filter(role=>role.id===preferredRoleId);
        if (eligible.length) {
          if (quickEntry) modelMode = await detectModel();
          if (screen !== "preferences") break;
          startDate(eligible[0]);
        }
        else showPlanIssue();
        break;
      }
      case "match":
        if (!checkAdult() || showPlanIssue()) break;
        candidates = matchingRoles();
        candidateIndex = 0;
        show("invitation");
        break;
      case "swap": candidateIndex = (candidateIndex + 1) % candidates.length; show("invitation"); break;
      case "meet":
        if (!candidates[candidateIndex] || !checkAdult() || busy || showPlanIssue()) break;
        const current=matchingRoles().find(role=>role.id===candidates[candidateIndex].id);
        if (!current) {
          show("preferences","条件已变更，请重新查看见面便笺。");
          break;
        }
        if(quickEntry&&!task)task={kind:"rehearsal",goal:"自然交流",duration:"full",style:"natural"};
        if (quickEntry || task) modelMode = await detectModel();
        if(task&&!modelMode){connectionFailed("meet");break;}
        if (screen !== "invitation") break;
        return startDate(current);
      case "close-flow-dialog": closeFlowDialog(); break;
      case "leave-live":
        if (!busy) openFlowDialog("leave",target);
        break;
      case "pause-and-leave":
        if (pendingDialog!=="leave"||busy) break;
        closeFlowDialog();
        if(run.phase==="paused") return leavePaused();
        if(modelMode) return modelRequest("/api/control",{sessionId:session.sessionId,command:"pause"},leavePaused);
        run=engine.pause(run);leavePaused();
        break;
      case "return-live":
        suspended=false;show("live");
        break;
      case "end-from-dialog":
        if(pendingDialog!=="leave"||busy) break;
        closeFlowDialog();
        if(modelMode) return control("end");
        run=engine.end(run);finish();
        break;
      case "end-suspended":
        suspended=false;
        show("live");
        if(modelMode) return control("end");
        run=engine.end(run);finish();
        break;
      case "pause": if (modelMode) return control("pause"); run = engine.pause(run); show("live"); break;
      case "resume": if (modelMode) return control("resume"); run = engine.resume(run); show("live"); break;
      case "hint":
        if(task){coachOpen=!coachOpen;show("live","",false);app.querySelector('[data-go="hint"]')?.focus({preventScroll:true});break;}
        hint = !hint;
        show("live", "", false);
        app.querySelector('[data-go="hint"]').focus();
        break;
      case "end": if (modelMode) return control("end"); run = engine.end(run); finish(); break;
      case "review": show("review"); break;
      case "replay": {
        radar.begin(session?.sessionId,true);
        if (modelMode) { if (alternative || draft.selected === null) break; return control("replay", {index:draft.selected}); }
        const branch = engine.replay(original, draft.selected);
        if (!branch || alternative) break;
        run = branch;
        hint = false;
        show("live");
        break;
      }
      case "suggest": {
        const suggestion = report.choices(original, draft.selected);
        if (!suggestion) break;
        draft.accepted = suggestion[0];
        draft.confirmed = false;
        show("review", "已写入草稿，可以改成自己的话。", false);
        app.querySelector('[name="accepted"]').focus();
        break;
      }
      case "final":
        show("final", draft.confirmed && !report.claim(original, exportDraft(), alternative)
          ? "卡片需要你自己的发现。请选择一个回合或留一句便笺，移除称呼、联系信息和角色原话。" : "");
        break;
      case "download-report":
        download(report.html(original, alternative, {...exportDraft(), full:includeFull}), "散场之后.html", "text/html;charset=utf-8");
        break;
      case "download-card": {
        const image = report.card(original, cardOptions(), alternative);
        if (image) download(image, "个人 Dating 卡.svg", "image/svg+xml;charset=utf-8");
        else if(task){
          const message="请先填写一句自己的感受并确认，避免包含姓名、联系方式或引用台词。";
          status.textContent=message;
          const error=app.querySelector("#share-error");
          if(error?.nodeType)error.textContent=message;
        }
        break;
      }
      case "reset":
        if (run) { openFlowDialog("reset",target);break; }
        reset();
        break;
      case "confirm-reset": {
        if (pendingDialog!=="reset") break;
        closeFlowDialog();
        if (modelMode && session) {
          ++generation;
          busy = true;
          retryTurn = null;
          try { await api("/api/control", {sessionId:session.sessionId, command:"discard"}); }
          catch (error) { if (error.code !== "SESSION_NOT_FOUND") { busy = false; status.textContent = `清空失败：${error.message}`; break; } }
        }
        try { await radar.discard(); }
        catch (error) { busy=false; status.textContent=`本机摘要清空失败：${error.message}`; break; }
        reset();
        break;
      }
    }
  });

  const openingPage=window.location?.hash;
  reset();
  if(openingPage==="#journal")newTask("practice");
  if(openingPage==="#savedReviews")show("savedReviews","",true,{replace:true});
  if(openingPage==="#legacyJournal")show("legacyJournal","",true,{replace:true});
  readConnection().then(connection=>{
    if(homeConnection!==null)return;
    homeConnection=connection;
    if(screen==="cover"&&!suspended)updateRegion("#home-connection",connectionOptions(true));
    if(screen==="taskSetup")updateRegion("#setup-connection",connectionOptions());
  });
  radar.hasSavedNotes().then(found=>{legacyNotes=found;},()=>{legacyError=true;}).finally(()=>{
    if((legacyNotes||legacyError)&&["cover","savedReviews"].includes(screen)&&app.nodeType)updateRegion(".page-nav",navigation(),true);
  });
})();
