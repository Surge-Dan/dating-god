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
  let modelOpening;
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
  async function detectModel() {
    if (!/^https?:$/.test(window.location?.protocol || "")) return false;
    busy = true;
    const ticket = ++generation;
    try { return Boolean((await api("/api/config")).available); }
    catch { return false; }
    finally { if (ticket === generation) busy = false; }
  }
  async function modelRequest(path, body, done) {
    if (busy) return;
    busy = true;
    const ticket = ++generation;
    if (screen === "live") show("live");
    try {
      const value = await api(path, body);
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
      if (screen === "live") show("live", error.message);
      else status.textContent = error.message;
    }
  }
  async function control(command, extra = {}) {
    ++generation;
    retryTurn = null;
    busy = false;
    if (!session) return;
    return modelRequest("/api/control", {sessionId:session.sessionId, command, ...extra}, () => {
      if (command === "end") finish();
      else show("live");
    });
  }
  async function sendModel(payload) {
    if (!session || busy || run.phase !== "live") return;
    radar.before();
    const identity = JSON.stringify({...session, ...payload});
    if (!retryTurn || retryTurn.identity !== identity) retryTurn = {identity, requestId:crypto.randomUUID()};
    return modelRequest("/api/turn", {...session, requestId:retryTurn.requestId, ...payload}, () => {
      retryTurn = null;
      utterance = "";
      if (run.phase === "ended") finish();
      else show("live");
    });
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
  let openBuilderGroups = new Set();
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
  let homeMethod = "roles";
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
    homeRecommendations = dealHomeScenes("全部");
    homeRerolling=false;roleLimit=12;partnerUndo=null;openBuilderGroups.clear();suspended=false;
    quickEntry = directPreparation = false;
    importText = "";
    preferredRoleId = null;
    selectedRoleId = null;
    roleSearch = "";
    roleDetailOpen = false;
    sceneCatalogSelected = null;
    sceneCatalogCategory = "全部";
    sceneCatalogSource="";catalogFromPlan=false;
    homeMethod = "roles";
    homeCategory = settingsCategory = customCategory = "全部";
    roleGender = roleTrait = planIssue = preparationIssue = "";
    confirming = sceneFirst = false;
    config = {
      stage:"first", intent:"undecided", exclusivity:"unspecified", budget:300, timeBudget:180, alcohol:false, experience:"novice", diet:"",
      mode: "mellow", adult: false, presentation: "unspecified", player: "unspecified", traits: [],
      interest: "", scene: "S02", avoid: [], nickname: "", expectation: "",
      surprise: false, guidance: false, seed: crypto.getRandomValues(new Uint32Array(1))[0],
    };
    run = original = alternative = null;
    draft = {
      selected: null, note: "", accepted: "", confirmed: false,
      includeNote: false, includeExperiment: false, includeExpectation: false,
    };
    candidates = [];
    candidateIndex = 0;
    hint = false;
    show(next, "", true, {replace:true});
  }

  const button = (id, label, style = "") =>
    `<button type="button" data-go="${id}" class="${style}">${label}</button>`;
  const heading = (index, title, desc = "") =>
    `<p class="kicker">${index}</p><h1 tabindex="-1">${title}</h1>${desc ? `<p class="subline">${desc}</p>` : ""}`;
  const option = (value, label, active) =>
    `<option value="${value}"${value === active ? " selected" : ""}>${label}</option>`;
  const check = (name, label, checked, value = "") =>
    `<label class="check"><input type="checkbox" name="${name}" value="${value}"${checked ? " checked" : ""}> <span>${label}</span></label>`;

  const icon = (name) => ({
    people:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20m6-9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm6-6a3.5 3.5 0 0 1 0 6.8m1 3.2a3.5 3.5 0 0 1 3 3.5V20"/></svg>',
    edit:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z"/><path d="M4 20h16"/></svg>',
    map:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    note:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM8 8h8M8 12h8m-8 4h5"/><path d="m16 3 3 3"/></svg>',
    refresh:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 9a7 7 0 0 1 11.8-2L20 12M4 12l2.7 5a7 7 0 0 0 11.8-2"/></svg>',
  })[name] || "";

  const tones = {"吃喝":"food","文娱":"culture","户外":"outdoors","游戏":"games","手作":"craft","运动":"sport","夜间":"night","逛街":"shops"};
  const categoryPaths = {
    food:'M4 4v5a3 3 0 0 0 6 0V4m-3 0v16M17 4c-2 2-3 5-3 8h5m0-8v16',
    culture:'M4 5h6l2 2 2-2h6v13h-6l-2 2-2-2H4zM12 7v13',
    outdoors:'m3 19 6-10 4 6 3-5 5 9H3ZM15 6h.01',
    games:'M8 8h8a4 4 0 0 1 4 3l1 5a2 2 0 0 1-3 2l-3-3H9l-3 3a2 2 0 0 1-3-2l1-5a4 4 0 0 1 4-3Zm0 2v4m-2-2h4m5-1h.01m3 2h.01',
    craft:'m4 20 2-6L17 3l4 4-11 11-6 2Zm10-14 4 4M6 14l4 4',
    sport:'M4 20 9 15M9 15c-2-2-1-6 2-9s7-4 9-2 1 6-2 9-7 4-9 2Zm2-6 4 4m-1-7 4 4',
    night:'M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11ZM17 5v4m-2-2h4',
    shops:'M4 8h16l1 12H3L4 8Zm5 2V7a3 3 0 0 1 6 0v3',
  };
  function categoryIcon(category) {
    const tone=tones[category]||"outdoors";
    return `<span class="category-icon tone-${tone}" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${categoryPaths[tone]}"/></svg></span>`;
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
    return homeRecommendations.map(scene=>sceneCard(scene,"home-scene",{selected:false})).join("");
  }
  function homeRefresh() {
    const count=byCategory(homeCategory).length;
    return `<button type="button" data-go="reroll" class="quiet refresh-button"${count<2?" disabled":""}>${icon("refresh")}${count>1&&count<=4?"换个顺序":"换一组推荐"}</button>${count===1?'<small class="subline">此分类只有1个场景</small>':""}`;
  }
  const methodCopy=custom=>custom?"按你的印象设定对象的相处方式。你可以选标签、锁定想保留的特征，其他留空。":"从现成角色里选一位。先看看对方的开场方式，再挑你想练的活动。";
  function cover() {
    if (suspended) return `<section class="panel suspended-view"><h1 tabindex="-1">本场已暂停</h1><p>你的进度还在。可以回来继续，或结束后去回看。</p><div class="buttons">${button("return-live","返回约会现场","primary")}${button("end-suspended","结束并回看")}</div></section>`;
    const custom = homeMethod === "custom";
    return `<section class="cover home-page">
      <header class="home-heading"><h1 tabindex="-1">约会预演</h1><p class="home-deck">先模拟一场约会，再复盘自己的选择。</p></header>
      <div class="home-layout">
        <section class="home-start">
          <div class="start-panel"><h2>准备一场见面</h2><div class="segment" role="group" aria-label="使用方式">
            <button type="button" data-method="roles" aria-pressed="${!custom}">从角色库挑人</button>
            <button type="button" data-method="custom" aria-pressed="${custom}">自己捏人</button>
          </div><p id="home-method-copy">${methodCopy(custom)}</p>
          ${button(custom?"custom-entry":"quick",custom?"开始捏对象":"浏览角色库","primary")}<small class="start-note">选完对象后可以换场景、改偏好。</small></div>
        </section>
        <aside class="practice-slip" aria-labelledby="practice-slip-title">
          <div class="slip-topline">${categoryIcon("户外")}<span>短练 · 公园散步</span></div>
          <div class="slip-body"><h2 id="practice-slip-title">到点了，怎么自然收尾？</h2><blockquote>“我差不多十分钟后得去取个东西，今天咱们就先到这儿吧？”</blockquote><p>试着接住这句话，看看不同回应会把散场带向哪里。</p></div>
          ${button("home-practice","开始这段练习 →","quiet")}
        </aside>
      </div>
      <section class="home-scenes" aria-labelledby="home-scenes-title">
        <div class="section-head"><h2 id="home-scenes-title">探索场景</h2>${button("all-scenes","浏览全部场景 →","quiet")}</div>
        <div class="filter-bar">${categoryFilters("home",homeCategory)}<div id="home-refresh">${homeRefresh()}</div></div>
        <p id="recommendation-update" class="sr-only" aria-live="polite"></p><div class="home-scene-list" id="home-scene-grid">${homeSceneCards()}</div>
      </section>
      <p class="home-note">场景与人物为虚构设定。成年确认后可以开始预演。</p>
    </section>`;
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
    if (!roles.some(role=>role.id===selectedRoleId)) {
      selectedRoleId=null;
      roleDetailOpen=false;
    }
    const selected=roles.find(role=>role.id===selectedRoleId);
    const visible=roles.slice(0,roleLimit);
    if (selected && !visible.includes(selected)) visible[visible.length-1]=selected;
    const badge = selected && engine.sceneById(selected.scenes[0])?.category;
    const supportsScene = role => sceneFirst && role.scenes.includes(config.scene);
    return `<section class="panel role-library${selected?" has-role-choice":""}">
      ${crumb("角色库")}<div class="section-head"><h1 tabindex="-1">角色库</h1>${button("random-role","按条件随机匹配","quiet")}</div>
      ${roleTabs(false)}${steps(0)}
      ${sceneFirst?`<div class="context-strip">${categoryIcon(engine.sceneById(config.scene).category)}<span>已选场景 <strong>${esc(engine.sceneById(config.scene).name)}</strong></span>${button("change-catalog-scene","更换场景","quiet")}</div>`:""}
      <div class="library-toolbar"><label class="search-field"><span class="sr-only">搜索角色</span><input name="role-search" type="text" inputmode="search" value="${esc(roleSearch)}" placeholder="搜名字、兴趣或相处方式" autocomplete="off"></label>
      <label><span class="sr-only">按性别筛选</span><select name="role-gender">${[["","全部性别"],["woman","女性"],["man","男性"]].map(([key,label])=>option(key,label,roleGender)).join("")}</select></label>
      <label><span class="sr-only">按相处节奏筛选</span><select name="role-trait">${[["","所有相处节奏"],...Object.entries(library.traits)].map(([key,label])=>option(key,esc(label),roleTrait)).join("")}</select></label></div>
      <div class="library-layout"><section class="role-results"><div class="section-head"><h2>现成角色</h2><span class="library-count" aria-live="polite">${roles.length}位角色</span></div>
      <div class="role-list">${roles.length?visible.map(role=>`<button type="button" data-role="${esc(role.id)}" class="role-row choice-card" aria-pressed="${selected?.id===role.id}">${avatar(role)}
        <span class="role-row-copy"><strong>${esc(role.name)}${sceneFirst?`<b class="compat-tag${supportsScene(role)?"":" not-compatible"}">${supportsScene(role)?"适配已选场景":"场景不适配"}</b>`:""}</strong><small>${role.age}岁 · ${esc(roleLabels[role.presentation])} · ${esc(role.traits.slice(0,2).map(id=>library.traits[id]).join("、"))}</small><span>${esc(role.bio)}</span></span></button>`).join(""):`<div class="empty-filter">${icon("people")}<h3>没有符合筛选的角色</h3><p>试试少选一个条件，或按你的印象捏人。</p>${button("clear-role-search","清空筛选","primary")} ${button("custom-entry","自己捏人","quiet")}</div>`}</div>${roles.length>roleLimit?button("more-roles",`加载更多角色（还有${roles.length-roleLimit}位）`,"more-roles"):""}</section>
      ${selected?`<aside class="role-profile tone-${tones[badge]||"culture"} ${roleDetailOpen?"profile-open":""}" id="role-details">
        <div class="profile-top">${avatar(selected,true)}<div><h2 tabindex="-1">${esc(selected.name)}</h2><p>${selected.age}岁 · ${esc(roleLabels[selected.presentation])}</p></div></div>
        <div class="profile-body"><p>${esc(selected.bio)}</p><blockquote>“${esc(selected.greeting)}”</blockquote>
        <dl><dt>兴趣</dt><dd>${esc(selected.interests.map(id=>library.interests[id]).filter(Boolean).join("、"))}</dd><dt>常见场景</dt><dd>${esc(selected.scenes.map(id=>engine.sceneById(id)?.name).filter(Boolean).join("、"))}</dd><dt>适合模式</dt><dd>${esc((selected.modes||Object.keys(modes)).map(id=>modes[id]).join("、"))}</dd></dl></div>
        ${button("choose-role","和TA预演","primary role-desktop-cta")}</aside>`:'<aside class="role-profile role-placeholder" id="role-details"><h2>先选一位角色</h2><p>点按角色卡，查看开场方式与适合的场景。</p></aside>'}</div>
      ${selected?selectionBar("role-confirm-bar",selected.name,"","choose-role","和TA预演",{extra:button("role-list",roleDetailOpen?"收起档案":"查看档案","quiet")}):""}
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
    const issue=selected&&sceneIssue(selected);
    return selectionBar("catalog-bar", selected?.name||"先选一个场景",
      selected?[outside?"在当前分类外":"",issue||sceneFacts(selected),sceneCatalogSource].filter(Boolean).join(" · "):"",
      "use-scene","用这个场景",{disabled:!selected||Boolean(issue)});
  }
  function sceneCatalog() {
    const count=byCategory(sceneCatalogCategory).length;
    return `<section class="panel scene-catalog with-confirm">${crumb("场景")}
      <div class="section-head"><h1 tabindex="-1">场景</h1><span id="catalog-count" class="library-count" aria-live="polite">${sceneCatalogCategory} · ${count}种</span></div>
      <p class="subline">从一处见面地点开始，选定后再去挑人。</p>
      ${categoryFilters("scene",sceneCatalogCategory)}
      <div id="catalog-grid" class="scene-grid">${catalogCards()}</div>${catalogBar()}</section>`;
  }
  function journal() {
    return `<section class="panel journal-page">${crumb("自查簿")}<h1 tabindex="-1">我的约会自查簿</h1><div id="radar-host"></div></section>`;
  }

  function navigation() {
    const section = {cover:"home",roles:"roles",preparation:preparation.step===1?"roles":"all-scenes",sceneCatalog:"all-scenes",settings:"all-scenes",preferences:"all-scenes",invitation:"all-scenes",journal:"journal"}[screen];
    const inScene=busy||suspended;
    const links=[["home","首页"],["roles","角色库"],["all-scenes","场景"],["journal","自查簿"]];
    return `<nav class="page-nav" aria-label="网页导航"><span class="brand"><span aria-hidden="true">♡</span> Dating之神</span><div>
      ${screen==="live"?`<span class="nav-live-status">约会${run.phase==="paused"?"已暂停":"进行中"}</span>${button("leave-live","暂停并离开","quiet")}`:links.map(([id,label])=>`<button type="button" data-go="${id}" class="quiet${section===id?" nav-current":""}"${section===id?' aria-current="page"':""}${inScene?" disabled":""}>${label}</button>`).join("")}</div></nav>`;
  }

  function preferences() {
    return `<section class="panel preferences-page">
      ${confirming?`${crumb("确认偏好","return-scenes","选场景")}<h1 tabindex="-1">确认偏好</h1>${steps(2)}`:heading("", "想遇见怎样的人？", "偏好只用来挑这一场。")}
      <div class="form-grid"><section class="form-section"><h2>这一场怎么进行</h2>
        <label class="field"><span>这一场的节奏（自主选择）</span><select name="mode">${Object.entries(modes).map(([id,label])=>option(id,label,config.mode)).join("")}</select><small>高档会出现含糊回应、期待落差和关系张力；边界与随时退出始终有效。</small></label>
        <div class="field-row">
          <label class="field"><span>你们的关系起点</span><select name="stage">${Object.entries({first:"初次见面",second:"第二次约会",friends:"朋友相约",flirting:"正在暧昧",steady:"稳定交往"}).map(([id,label])=>option(id,label,config.stage)).join("")}</select></label>
          <label class="field"><span>这次的关系期待</span><select name="intent">${Object.entries({undecided:"还没想好",casual:"轻松相处",serious:"认真了解"}).map(([id,label])=>option(id,label,config.intent)).join("")}</select></label>
        </div>

          <div class="field-row"><label class="field"><span>本场预算（模拟人均，元）</span><input type="number" name="budget" min="0" max="100000" step="1" value="${config.budget}"></label><label class="field"><span>可用时间（分钟）</span><input type="number" name="timeBudget" min="5" max="1440" step="1" value="${config.timeBudget}"></label></div>
          <label class="field"><span>希望的相处方式（需现场协商）</span><select name="exclusivity">${Object.entries({unspecified:"暂不确定",exclusive:"希望彼此排他",open:"可接受开放关系"}).map(([id,label])=>option(id,label,config.exclusivity)).join("")}</select></label>
        <details class="setup-details"><summary>更多安排</summary><div class="form-grid">
          <label class="field"><span>约会经验</span><select name="experience">${option("novice","刚开始尝试",config.experience)}${option("familiar","比较熟悉",config.experience)}</select></label>
          ${check("alcohol","这场愿意饮酒（不选也可去酒吧，选择无酒精饮品）",config.alcohol)}
          <label class="field"><span>饮食要求（可选，现场可知）</span><input name="diet" maxlength="160" value="${esc(config.diet)}" placeholder="例如，不吃花生；不需要填写病史"></label>
        </div></details>
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

      </div>
      <div class="preferences-submit">${check("adult","我已年满 18 岁，并知道这是一场虚构模拟",config.adult)}<p id="adult-reason" class="subline"${config.adult?" hidden":""}>请先确认成年，再查看见面便笺。</p><div class="buttons">${confirming?`<button type="button" data-go="match" id="preferences-next" class="primary"${config.adult?"":" disabled aria-describedby='adult-reason'"}>查看见面便笺</button>${button("return-scenes","返回选场景","quiet")}`:`${button("blind","直接去盲约","primary")}${button("settings","选地点和边界")}${button("home","返回首页","quiet")}`}</div></div>
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
    </section>`;
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
      ${!paused && stations.length ? `<details class="station-options" data-live-section="stations"><summary>可提议第二站 · ${stations.length}个选择</summary><p class="subline">只显示本场时间和预算允许的活动。先提出，双方再确认出发。</p><div class="steps">${actions(stations)}</div></details>` : ""}
      <div class="control">
        ${paused ? button("resume", "回到现场") : button("pause", "暂停", "quiet")}
        ${!paused ? button("hint", hint ? "收起提示" : "我有点卡住", "quiet") : ""}
        <details class="scene-tools" data-live-section="controls"><summary>更多</summary><div class="buttons">
          ${button("radar-coach", "场外教练", "quiet")}${modelMode ? button("radar-preflight", "检查这句草稿", "quiet") : ""}
          ${Object.keys(modes).indexOf(run.mode || config.mode)>0 ? button("lower-mode", "降低强度", "quiet") : ""}
          ${button("end", "提前散场", "quiet danger")}${button("reset", "退出并清空本场", "quiet danger")}
        </div></details>
      </div>
      <div id="radar-host"></div>
      ${run.events.length ? `<details class="live-history" data-live-section="history"><summary>查看已发生的事 · ${run.events.length}回合</summary>${log(run.events)}</details>` : ""}
    </section>`;
  }

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
      <div class="buttons">${button("final", "查看这场回看", "primary")}${button("save-home", "结束并保存已完成摘要")}${button("reset", "结束并清空这场", "quiet danger")}</div>
      <div id="radar-host"></div>
    </section>`;
  }

  function exportDraft() {
    return { ...draft, nickname: config.nickname, expectation: config.expectation };
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
      <details class="record-details"><summary>现场记录 · ${original.events.length}回合</summary>${original.events.length?log(original.events):"<p>这场还没有可引用的互动。</p>"}</details>
      ${alternative ? `<details class="record-details"><summary>实际重演 · 从第 ${alternative.branchFrom + 1} 回合前开始</summary>
        ${log(alternative.events.slice(alternative.branchFrom))}<p>${esc(alternative.outcome)}</p></details>` : ""}
      <div class="buttons report-actions">${button("download-report", "下载 HTML 回看", "primary")}
        ${approved ? button("download-card", "下载 Dating 卡（SVG）") : ""}
        ${button("review","返回调整","quiet")}
        <details class="scene-tools"><summary>更多</summary>${button("reset","结束并清空这场","quiet danger")}</details>
      </div>
      <details class="record-details"><summary>本机自查摘要</summary><div id="radar-host"></div><div class="buttons">${button("save-home","结束并保存已完成摘要")}</div></details>
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
    const frame = step===1 ? {crumb:crumb("角色库"),controls:roleTabs(true)+steps(0)}
      : {crumb:crumb(step===2?"选场景":"确认偏好","prep-back","上一步"),controls:steps(step===2?1:2)};
    return window.DatingPreparation.render(preparation, library, {budgetFields, adultField, currentScene:config.scene, frame:step?frame:"", direct:directPreparation, sceneCards:step===2&&directPreparation?customScenePicker():"", flowBar:step===1||(step===2&&directPreparation)?prepBar():"", canUndo:Boolean(partnerUndo), issue:preparationIssue});

  }
  const views = { preparation:preparationView, cover, roles:roleLibrary, sceneCatalog, journal, preferences, settings, invitation, live, review, final, practiceReview };
  function show(next, message = "", focus = true, route = {}) {
    if (window.history && !route.fromHistory) {
      const state = {datingGod:true, screen:next, ...(next==="preparation"?{step:preparation.step}:{})};
      try {
        if (route.replace || !screen) window.history.replaceState(state, "", `#${next}`);
        else if (next !== screen || (next==="preparation" && window.history.state?.step!==preparation.step)) {
          window.history.pushState(state, "", `#${next}`);
        }
      } catch { /* Some local file viewers do not support history writes. */ }
    }
    const liveUpdate=screen==="live"&&next==="live"&&app.querySelector(".live-panel")?.nodeType;
    const expanded=liveUpdate?[...app.querySelectorAll(".live-panel details[open][data-live-section]")].map(item=>item.dataset.liveSection):[];
    screen = next;
    if (liveUpdate) {
      const recordHost=document.getElementById("radar-host");
      updateRegion(".live-panel",live(),true);
      if (recordHost) document.getElementById("radar-host")?.replaceWith(recordHost);
      const marker=app.querySelector(".nav-live-status");
      if(marker) marker.textContent=run.phase==="paused"?"约会已暂停":"约会进行中";
      for (const section of expanded) {
        const item=app.querySelector(`[data-live-section="${section}"]`);
        if (item) item.open=true;
      }
    } else app.innerHTML = navigation() + views[next]();
    if (next==="preparation"&&preparation.step===1) {
      for (const key of openBuilderGroups) {
        const item=app.querySelector(`[data-group="${key}"]`);
        if (item?.nodeType) item.open=true;
      }
    }
    if (modelMode && next === "live") {
      const last = run.events.at(-1);
      const line = app.querySelector("#model-line");
      const detail = app.querySelector("#model-detail");
      if (line) line.textContent = last?.reply || modelOpening?.line || "";
      if (detail) detail.textContent = last?.detail || modelOpening?.detail || "";
      const input = app.querySelector('[name="utterance"]');
      if (input) input.value = utterance;
    }
    if (!liveUpdate) radar.mount(next === "journal");
    status.textContent = message;
    refreshCardPreview();
    if (focus && !liveUpdate) app.querySelector("h1")?.focus({preventScroll:false});
    else if (liveUpdate && focus) app.querySelector(".line")?.focus({preventScroll:true});
  }

  window.addEventListener?.("popstate", event => {
    const next = event.state?.datingGod ? event.state.screen : null;
    if (suspended && next!=="cover") { show("cover","",true,{replace:true});return; }
    if (!next || !Object.hasOwn(views,next)) return;
    if ((next==="invitation"&&!candidates.length) || (["live","review","final","practiceReview"].includes(next)&&!run)) {
      show("cover", "", true, {replace:true});
      return;
    }
    if (next==="preparation" && Number.isInteger(event.state.step)) preparation.step=Math.max(0,Math.min(3,event.state.step));
    if (screen === "live" && next !== "live") {
      window.history?.pushState({datingGod:true,screen}, "", `#${screen}`);
      status.textContent = "这场还在进行。请先结束本场，再返回其他页面。";
      return;
    }
    show(next, "", true, {fromHistory:true});
  });

  function refreshCardPreview() {
    if (cardPreviewUrl) URL.revokeObjectURL(cardPreviewUrl);
    cardPreviewUrl = null;
    const preview = document.getElementById("card-art");
    if (!preview) return;
    const image = report.card(original, exportDraft(), alternative);
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
  function practiceReview(){return `<section><h1>这一小段，先练到这里</h1><p>独立练习只记录本次言行，不据此认定已经改好。</p>${run.events.map(e=>`<p>你：${esc(e.label)}</p><p>TA：${esc(e.reply)}</p>`).join("")}<div id="radar-host"></div>${button("save-home","结束并保存已完成摘要")}${button("reset","结束并清空这场")}</section>`;}
  function finish() {
    if(run.practiceRuleId){show("practiceReview");return;}
    if (run.branchFrom === null) original = run;
    else alternative = run;
    show("review");
  }

  function startDate(role, runConfig=config) {
    radar.begin(null);
    if (modelMode) return modelRequest("/api/session", {
      config:{radarEnabled:true,...(config.practiceRuleId?{practiceRuleId:config.practiceRuleId}:{}),...Object.fromEntries(["adult","scene","player","presentation","avoid","seed","mode","traits","interest","surprise","stage","intent","exclusivity","budget","timeBudget","alcohol","experience","diet","partnerSpec","sceneSpec","preparation"].map(key=>[key,runConfig[key]]))},
      roleId:role.id,
    }, value => {
      radar.begin(value.sessionId);
      radar.attach(value.sessionId,false,!!run?.practiceRuleId);
      if(value.radar) radar.update(value.radar);
      modelOpening = value.opening;
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

  app.addEventListener("toggle",event=>{
    const group=event.target.dataset?.group;
    if (event.target.isConnected&&group) {
      if (event.target.open) openBuilderGroups.add(group);
      else openBuilderGroups.delete(group);
    }
  },true);

  app.addEventListener("input", (event) => {
    if (radar.handleInput(event)) return;
    const { name, value, checked, type } = event.target;
    if (["role-search","role-gender","role-trait"].includes(name)) {
      if (event.isComposing) return;
      if (name==="role-search") roleSearch=value;
      if (name==="role-gender") roleGender=value;
      if (name==="role-trait") roleTrait=value;
      roleLimit=12;
      if (!filteredRoles().some(role=>role.id===selectedRoleId)) {
        selectedRoleId=null;roleDetailOpen=false;
      }
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
        const number = Number(value);
        config[name] = Number.isFinite(number) ? Math.max(name === "budget" ? 0 : 5, Math.min(name === "budget" ? 100000 : 1440, Math.round(number))) : (name === "budget" ? 300 : 180);
        return;
      }
      config[name] = type === "checkbox" ? checked : value;
      if (name==="adult") {
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
      if (name === "accepted") {
        draft.confirmed = false;
        app.querySelector('[name="confirmed"]').checked = false;
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
    if (!updateRegion("#catalog-bar",catalogBar(),true)) show("sceneCatalog","",false);
  }

  let pendingDialog = "";
  function openFlowDialog(kind, opener) {
    if (pendingDialog) return;
    pendingDialog=kind;
    if (!app.nodeType) return;
    const dialog=document.createElement("dialog");
    dialog.className="flow-dialog";
    dialog.setAttribute("aria-labelledby","flow-dialog-title");
    const leaving=kind==="leave";
    dialog.innerHTML=`<h2 id="flow-dialog-title">${leaving?"怎么离开现场？":"清空这场约会？"}</h2>
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
    const {go,action,turn,select,scene,role,sceneChoice,sceneCategory,homeScene,homeCategory:category,settingsCategory:planCategory,customCategory:prepCategory,customScene,method}=target.dataset;
    if (busy && screen !== "live") return;
    if (suspended && !["return-live","end-suspended"].includes(go)) return;
    if (method) {
      homeMethod=method;
      const custom=method==="custom";
      setPressed("method",method);
      const copy=app.querySelector("#home-method-copy");
      const cta=app.querySelector(".start-panel .primary");
      if (copy?.nodeType && cta?.nodeType) {
        copy.textContent=methodCopy(custom);
        cta.dataset.go=custom?"custom-entry":"quick";
        cta.textContent=custom?"开始捏对象":"浏览角色库";
      } else show("cover","",false);
      app.querySelector(`[data-method="${homeMethod}"]`)?.focus({preventScroll:true});
      return;
    }
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
      sceneCatalogSelected=homeScene;
      sceneCatalogCategory=homeCategory;
      sceneCatalogSource="已带入首页选择";
      catalogFromPlan=false;
      show("sceneCatalog");
      return;
    }
    if (scene) {
      if (!library.scenes.some(item=>item.id===scene)) return;
      config.scene=scene;
      planIssue=explainPlan();
      refreshPlan();
      return;
    }
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
          if (access?.nodeType) { access.closest("details").open=true;access.focus(); }
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
          const opened=[...(app.querySelectorAll?.(".builder-extra[open]")||[])].map(item=>item.dataset.group);
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
          opened.forEach(group=>{ const details=app.querySelector(`[data-group="${group}"]`); if(details) details.open=true; });
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
      case "home":
        if (screen !== "live" && !busy) show("cover");
        break;
      case "roles":
        if (screen !== "live" && !busy) show("roles");
        break;
      case "all-scenes":
        if (screen!=="live" && !busy && screen!=="sceneCatalog") {
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
        if (!scene || sceneIssue(scene)) break;
        if (catalogFromPlan) {
          config.scene=scene.id;
          preparation.template=scene.id;
          sceneFirst=true;
          show("roles");
        } else openSceneFirst(scene.id);
        break;
      }
      case "choose-role": {
        const role=library.roles.find(item=>item.id===selectedRoleId);
        if(!role){status.textContent="先从列表里选一位角色。";break;}
        preferredRoleId=role.id;
        const adjusted=role.modes?.length&&!role.modes.includes(config.mode);
        if(adjusted)config.mode=role.modes[0];
        quickEntry=true;modelMode=false;planIssue=explainPlan();show("settings", adjusted?`${role.name}更适合「${modes[config.mode]}」，已为本场调整；可从更多偏好里改回来。`:"");
        break;
      }
      case "role-list":
        roleDetailOpen=!roleDetailOpen;refreshRoles();
        if (roleDetailOpen) app.querySelector("#role-details")?.scrollIntoView?.({block:"nearest"});
        app.querySelector('#role-confirm-bar [data-go="role-list"]')?.focus({preventScroll:true});
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
        const wasRecovery=Boolean(planIssue);
        if (preferredRoleId && !["man","woman"].includes(config.player)) config.presentation="unspecified";
        preferredRoleId=null;quickEntry=true;modelMode=false;
        if (wasRecovery && !showPlanIssue()) { confirming=true;show("preferences","将按当前场景与偏好重新匹配。"); }
        else if (!wasRecovery) show("settings");
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
        show("journal");
        return radar.startScenario("natural-close-v1");
      case "journal":
        if (screen !== "live" && !busy) show("journal");
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
        directPreparation = true;
        preparation.step = 1;
        show("preparation");
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
      case "send": if (utterance.trim()) return sendModel({text:utterance}); break;
      case "cancel": return control("cancel");
      case "lower-mode": {
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
        if (quickEntry) modelMode = await detectModel();
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
        download(report.html(original, alternative, exportDraft()), "散场之后.html", "text/html;charset=utf-8");
        break;
      case "download-card": {
        const image = report.card(original, exportDraft(), alternative);
        if (image) download(image, "个人 Dating 卡.svg", "image/svg+xml;charset=utf-8");
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

  reset();
})();
