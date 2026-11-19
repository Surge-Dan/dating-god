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
  let recommendedScene;
  let quickEntry = false;
  let directPreparation = false;

  function chooseRecommendation(exclude) {
    const pool = library.scenes.filter(scene => scene.id !== exclude);
    return pool[crypto.getRandomValues(new Uint32Array(1))[0] % pool.length];
  }

  function reset(next = "cover") {
    ++generation; retryTurn = null; busy = false; session = null; modelMode = false; utterance = "";
    preparation = window.DatingPreparation.create();
    recommendedScene = chooseRecommendation();
    quickEntry = directPreparation = false;
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
    show(next);
  }

  const button = (id, label, style = "") =>
    `<button type="button" data-go="${id}" class="${style}">${label}</button>`;
  const heading = (index, title, desc = "") =>
    `<p class="kicker">${index}</p><h1 tabindex="-1">${title}</h1>${desc ? `<p class="subline">${desc}</p>` : ""}`;
  const option = (value, label, active) =>
    `<option value="${value}"${value === active ? " selected" : ""}>${label}</option>`;
  const check = (name, label, checked, value = "") =>
    `<label class="check"><input type="checkbox" name="${name}" value="${value}"${checked ? " checked" : ""}> <span>${label}</span></label>`;

  function cover() {
    const scene = recommendedScene;
    return `<section class="cover">
      <h1 tabindex="-1">这场约会，想怎么开始？</h1>
      <div class="entry-grid">
        ${button("quick", '<strong>直接用角色库</strong><span>选个场景，再挑一位现成人物。</span>', "entry-choice")}
        ${button("custom-entry", '<strong>先捏一个对象</strong><span>按你的印象，设定这次想见的人。</span>', "entry-choice")}
      </div>
      ${button("journal", "练一个环节", "quiet practice-link")}
      <div class="recommendation">
        <p class="meta">随机推荐</p>
        <h2>${esc(scene.name)}</h2>
        <p>${esc(scene.description || scene.intro)}</p>
        <div class="buttons">${button("use-recommendation", "用这个场景", "primary")}${button("reroll", "换个推荐", "quiet")}</div>
      </div>
    </section>`;
  }

  function journal() {
    return `<section class="panel">${heading("", "我的约会自查簿", "可以挑一个环节练习，也可以回看你选择保留的记录。")}<div id="radar-host"></div></section>`;
  }

  function navigation() {
    const inScene = screen === "live";
    return `<nav class="page-nav" aria-label="网页导航">
      <span class="brand">Dating之神</span>
      <div>${inScene ? (run.branchFrom === null ? "约会现场" : "约会重演") :
        `${button("home", "首页", screen === "cover" ? "nav-current" : "quiet")}${button("journal", "自查簿", screen === "journal" ? "nav-current" : "quiet")}`}</div>
    </nav>`;
  }

  function preferences() {
    return `<section class="panel">
      ${heading("赴约前 / 01", "想遇见怎样的人？", "偏好只用来挑这一场。你可以细选，也可以直接去盲约。")}
      <div class="form-grid">
        <label class="field"><span>这一场的节奏（自主选择）</span><select name="mode">${Object.entries(modes).map(([id,label])=>option(id,label,config.mode)).join("")}</select><small>高档会出现含糊回应、期待落差和关系张力；边界与随时退出始终有效。</small></label>
        <div class="field-row">
          <label class="field"><span>你们的关系起点</span><select name="stage">${Object.entries({first:"初次见面",second:"第二次约会",friends:"朋友相约",flirting:"正在暧昧",steady:"稳定交往"}).map(([id,label])=>option(id,label,config.stage)).join("")}</select></label>
          <label class="field"><span>这次的关系期待</span><select name="intent">${Object.entries({undecided:"还没想好",casual:"轻松相处",serious:"认真了解"}).map(([id,label])=>option(id,label,config.intent)).join("")}</select></label>
        </div>
        <details class="setup-details"><summary>预算、时间和相处约定</summary><div class="form-grid">
          <p class="subline">这些条件会作为本场安排让角色知晓；私人期待便笺只留在本地。</p>
          <div class="field-row"><label class="field"><span>本场预算（模拟人均，元）</span><input type="number" name="budget" min="0" max="100000" step="1" value="${config.budget}"></label><label class="field"><span>可用时间（分钟）</span><input type="number" name="timeBudget" min="5" max="1440" step="1" value="${config.timeBudget}"></label></div>
          <label class="field"><span>希望的相处方式（需现场协商）</span><select name="exclusivity">${Object.entries({unspecified:"暂不确定",exclusive:"希望彼此排他",open:"可接受开放关系"}).map(([id,label])=>option(id,label,config.exclusivity)).join("")}</select></label>
          <label class="field"><span>约会经验</span><select name="experience">${option("novice","刚开始尝试",config.experience)}${option("familiar","比较熟悉",config.experience)}</select></label>
          ${check("alcohol","这场愿意饮酒（不选也可去酒吧，选择无酒精饮品）",config.alcohol)}
          <label class="field"><span>饮食要求（可选，现场可知）</span><input name="diet" maxlength="160" value="${esc(config.diet)}" placeholder="例如，不吃花生；不需要填写病史"></label>
        </div></details>
        <fieldset><legend>成年确认</legend>${check("adult", "我已年满 18 岁", config.adult)}</fieldset>
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
      </div>
      <div class="buttons">${button("blind", "直接去盲约", quickEntry ? "quiet" : "primary")}${button("settings", "选地点和边界", quickEntry ? "primary" : "")}${button("reset", "返回封面", "quiet")}</div>
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
  function scenePicker() {
    const groups = new Map();
    for (const scene of library.scenes) {
      const category = scene.category || "见面活动";
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(scene);
    }
    return `<div class="scene-groups" aria-label="按活动选择场景">${[...groups].map(([category,scenes])=>`<details class="scene-category" ${scenes.some(scene=>scene.id===config.scene) ? "open" : ""}><summary><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16v12H4zM8 4v8m8-8v8M4 13h16" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>${esc(category)}<small> ${scenes.length}项活动</small></summary><div class="scene-cards">${scenes.map(scene=>`<button type="button" data-scene="${esc(scene.id)}" aria-pressed="${config.scene===scene.id}" class="scene-card"><strong>${esc(scene.name)}</strong>${sceneIssue(scene) ? `<em class="scene-warning">${sceneIssue(scene)}</em>` : ""}<span>${esc(scene.description || scene.intro)}</span><small>${Number.isFinite(scene.duration) ? `${scene.duration}分钟` : "时长未提供"} · ${Number.isFinite(scene.cost) ? `模拟人均${scene.cost}元` : "预算未提供"}${scene.alcohol ? " · 可选酒精/无酒精饮品" : ""}</small><small>${esc(scene.time || "")} · ${esc(scene.pacing || "按自己的节奏")}${scene.requirements?.length ? ` · ${esc(scene.requirements.join("；"))}` : ""}</small></button>`).join("")}</div></details>`).join("")}</div>`;
  }

  function settings() {
    return `<section class="panel">
      ${heading("", "这次约在哪里？", "选一个想练的场景。卡片上的时间和花费都是模拟安排。")}
      ${quickEntry ? `<div class="quick-tools">${check("adult", "我已年满18岁", config.adult)}${button("preferences", "调整对象偏好", "quiet")}</div>` : ""}
      <div class="form-grid">
        ${scenePicker()}
        <label class="field"><span>我希望这场约会……（私人便笺，不发送给角色）</span><textarea name="expectation" maxlength="320" placeholder="例如，我想试试说出自己真正喜欢的地点。">${esc(config.expectation)}</textarea></label>
        <fieldset><legend>避开的话题</legend><div class="checks">${Object.entries(library.topics).map(([id, label]) =>
          check("avoid", label, config.avoid.includes(id), id)).join("")}</div></fieldset>
        <fieldset><legend>节奏</legend><div class="checks">
          ${check("surprise", "允许一点场景小变化", config.surprise)}
          ${check("guidance", "开场时给我一个可见的方向", config.guidance)}
        </div></fieldset>
      </div>
      <div class="buttons">${button("match", quickEntry ? "去选角色" : "看看见面便笺", "primary")}${button(quickEntry ? "home" : "preferences", "上一步", "quiet")}</div>
    </section>`;
  }

  function invitation() {
    const role = candidates[candidateIndex];
    if (!role) return `<section class="panel">
      ${heading("赴约前 / 03", "这次的组合还没有覆盖", "当前地点与对象条件没有对应人选。你可以换地点，或回到偏好调整条件。")}
      <div class="buttons">${button("settings", "换地点", "primary")}${button("preferences", "调整偏好")}${button("reset", "结束", "quiet")}</div>
    </section>`;
    const identity = config.presentation === "unspecified" ? `${role.age} 岁` : `${role.age} 岁 · ${display[role.presentation]}`;
    return `<section class="panel">
      ${heading("", quickEntry ? "这次想和谁见面？" : "一张见面便笺")}
      ${quickEntry ? `<label class="field role-picker"><span>角色库</span><select name="role-choice">${candidates.map((item,index) => option(String(index), esc(item.name), String(candidateIndex))).join("")}</select></label>` : ""}
      <article class="ticket"><p class="meta">${engine.sceneById(config.scene).name} · ${identity}</p><h2>${role.name}</h2>
      ${config.avoid.includes("work") ? "" : `<p>${role.bio}</p><hr class="ticket-rule">`}<p>${role.reason}</p></article>
      <div class="buttons">${button("meet", "按约见面", "primary")}
      ${candidates.length > 1 ? button("swap", "换一位") : ""}${button("settings", "回到设置", "quiet")}</div>
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
        <h1 tabindex="-1">${role.name} · ${run.location}</h1>
        ${paused ? "<p class=\"line\">已经暂停。回到现场时，时间会从这一刻接上。</p>" : `
          ${last?.detail || !last ? `<p class="stage-detail" id="model-detail">${modelMode ? "" : esc(last?.detail || start.detail)}</p>` : ""}
          <p class="line" id="model-line">「${modelMode ? "" : esc(last?.reply || start.line)}」</p>`}
      </article>
      <div class="control">
        ${paused ? button("resume", "回到现场") : button("pause", "暂停", "quiet")}
        ${!paused ? button("hint", hint ? "收起提示" : "我有点卡住", "quiet") : ""}
        ${button("end", "提前散场", "quiet")}
        <details class="scene-tools"><summary>更多</summary><div class="buttons">
          ${button("radar-coach", "场外教练", "quiet")}${modelMode ? button("radar-preflight", "检查这句草稿", "quiet") : ""}
          ${Object.keys(modes).indexOf(run.mode || config.mode)>0 ? button("lower-mode", "降低强度", "quiet") : ""}
          ${button("reset", "退出并清空本场", "quiet")}
        </div></details>
      </div>
      ${hint && !paused ? `<p class="prompt">可以从眼前的选择出发。${run.events.length ?
        "照自己的节奏决定，也可以先保留意见或道别。" : scene.hint}</p>` : ""}
      ${modelMode && !paused ? `<label class="field"><span>你想说什么？</span><textarea name="utterance" maxlength="1200" ${busy ? "disabled" : ""}></textarea></label><div class="buttons"><button type="button" data-go="send" class="primary" ${busy ? "disabled" : ""}>${busy ? "正在回应…" : "发送"}</button>${busy ? button("cancel", "取消本次请求") : ""}</div>` : ""}
      ${paused ? "" : `<div class="steps" aria-label="你想怎么做">${actions(regular)}</div>`}
      ${!paused && stations.length ? `<details class="station-options"><summary>还有时间，提议一起去第二站</summary><p class="subline">只显示本场时间和预算允许的活动。先提出，双方再确认出发。</p><div class="steps">${actions(stations)}</div></details>` : ""}
      <div id="radar-host"></div>
      ${run.events.length && !paused ? `<details><summary>看看已经发生的事</summary>${log(run.events)}</details>` : ""}
    </section>`;
  }

  function review() {
    const event = original.events[draft.selected];
    const suggestion = report.choices(original, draft.selected);
    return `<section class="panel review-panel">
      ${heading("散场后 / 01", "想回看哪一刻？", original.outcome)}
      ${config.expectation.trim() ? `<article class="ticket"><p class="meta">赴约前写给自己的期待</p><p>${esc(config.expectation)}</p>
        ${check("includeExpectation", "把这条期待也写入 HTML 报告", draft.includeExpectation)}</article>` : ""}
      ${original.events.length ? `<div class="steps" aria-label="选一个回合">${original.events.map((item, index) =>
        `<button type="button" data-select="${index}" aria-pressed="${draft.selected === index}">${index + 1}. ${esc(item.label)}</button>`).join("")}</div>`
        : "<p>这场还没有可引用的互动。你可以留一句原本想试的事。</p>"}
      ${event ? `<article class="ticket"><p class="meta">这一刻 · 角色实际回应</p><p>「${esc(event.reply)}」</p>
        <p class="subline">这一刻，你在意的是对方给的答案，还是你可以自在地说出自己的选择？也可以都不是。</p>
        ${!alternative ? button("replay", "从这一幕重演") : "<p>重演已完成，回看将分开呈现。</p>"}</article>` : ""}
      ${original.preparation ? `<div class="form-grid"><h2>赴约准备</h2><p class="subline">只认领你愿意尝试的做法。模拟对象的反应不能代替真人回答。</p>${[['claimedAction','下次做法'],['question','需要向真人确认的问题'],['fallback','可行备选']].map(([key,label])=>`<label class="field"><span>${label}</span><input name="review-prep.${key}" maxlength="300" value="${esc(original.preparation[key]||'')}"></label>`).join('')}</div>` : ""}
      <div class="form-grid">
        <label class="field"><span>想留给自己的便笺（可选）</span><textarea name="note" maxlength="320" placeholder="我当时在意的是……">${esc(draft.note)}</textarea></label>
        ${check("includeNote", "把这条私人便笺也写入 HTML 报告", draft.includeNote)}
        ${suggestion ? `<div>${button("suggest", "用一个可能的发现作草稿")}</div>` : ""}
        <label class="field"><span>我想带走的一句话（可选）</span><input type="text" name="accepted" value="${esc(draft.accepted)}" maxlength="96" placeholder="按自己的话写，可以留空"></label>
        ${check("confirmed", "这句话是我认领的发现，可用于报告和 Dating 卡", draft.confirmed)}
      </div>
      <div class="buttons">${button("final", "查看这场回看", "primary")}${button("save-home", "结束并保存已完成摘要")}${button("reset", "不回看，结束这场", "quiet")}</div>
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
      ${heading("散场后 / 02", "散场之后", original.outcome)}
      <article class="ticket"><p class="meta">这场 · ${[...new Set(original.stations || [original.scene])].map(id=>esc(sceneName(id,original))).join(" → ")}</p>
      <h2>${approved ? "带走的一点发现" : "留给自己的一个问题"}</h2>
      <p>${esc(approved || "回到那一刻，我最想保留的是怎样的相处方式？")}</p>
      ${experiment ? `<p><strong>下次可试</strong>　${esc(experiment)}</p>` : ""}
      ${draft.includeExpectation && config.expectation.trim() ? `<p><strong>写入报告的赴约期待</strong>　${esc(config.expectation)}</p>` : ""}
      ${draft.includeNote && draft.note.trim() ? `<p><strong>写入报告的私人便笺</strong>　${esc(draft.note)}</p>` : ""}</article>
      ${original.events.length ? `<details><summary>现场记录 · ${original.events.length} 回合</summary>${log(original.events)}</details>` : "<p>没有可引用的互动。</p>"}
      ${alternative ? `<details><summary>实际重演 · 从第 ${alternative.branchFrom + 1} 回合前开始</summary>
        ${log(alternative.events.slice(alternative.branchFrom))}<p>${esc(alternative.outcome)}</p></details>` : ""}
      ${approved ? `<img id="card-art" class="card-preview" alt="分享卡预览：${esc(approved)}">
        ${experiment ? check("includeExperiment", "在分享卡上加一个下次观察点", draft.includeExperiment) : ""}`
        : "<p class=\"subline\">确认一条自己的发现后，才会有可下载的 Dating 卡。</p>"}
      <div class="buttons">${button("download-report", "下载 HTML 回看", "primary")}
        ${approved ? button("download-card", "下载 Dating 卡（SVG）") : ""}
        ${button("review", "返回调整", "quiet")}${button("save-home", "结束并保存已完成摘要", "quiet")}${button("reset", "结束并清空这场", "quiet")}</div>
      <div id="radar-host"></div>
    </section>`;
  }

  function preparationView() {
    const budgetFields = `<div class="field-row"><label class="field">本场预算（元）<input name="budget" type="number" min="0" max="100000" value="${config.budget}"></label><label class="field">可用时间（分钟）<input name="timeBudget" type="number" min="5" max="1440" value="${config.timeBudget}"></label></div>`;
    const adultField = `<fieldset class="adult-gate"><legend>开始前确认</legend>${check("adult", "我已年满18岁", config.adult)}</fieldset>`;
    return window.DatingPreparation.render(preparation, library, {budgetFields, adultField, currentScene:config.scene});
  }
  const views = { preparation:preparationView, cover, journal, preferences, settings, invitation, live, review, final, practiceReview };
  function show(next, message = "", focus = true) {
    screen = next;
    app.innerHTML = navigation() + views[next]();
    if (modelMode && next === "live") {
      const last = run.events.at(-1);
      const line = app.querySelector("#model-line");
      const detail = app.querySelector("#model-detail");
      if (line) line.textContent = last?.reply || modelOpening?.line || "";
      if (detail) detail.textContent = last?.detail || modelOpening?.detail || "";
      const input = app.querySelector('[name="utterance"]');
      if (input) input.value = utterance;
    }
    radar.mount(next === "journal");
    status.textContent = message;
    refreshCardPreview();
    if (focus) app.querySelector("h1")?.focus({preventScroll:false});
  }

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

  function startDate(role) {
    radar.begin(null);
    if (modelMode) return modelRequest("/api/session", {
      config:{radarEnabled:true,...(config.practiceRuleId?{practiceRuleId:config.practiceRuleId}:{}),...Object.fromEntries(["adult","scene","player","presentation","avoid","seed","mode","traits","interest","surprise","stage","intent","exclusivity","budget","timeBudget","alcohol","experience","diet","partnerSpec","sceneSpec","preparation"].map(key=>[key,config[key]]))},
      roleId:role.id,
    }, value => {
      radar.begin(value.sessionId);
      radar.attach(value.sessionId,false,!!run?.practiceRuleId);
      if(value.radar) radar.update(value.radar);
      modelOpening = value.opening;
      hint = config.guidance;
      show("live");
    });
    run = engine.createRun(config, role.id);
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
    const { name, value, checked, type } = event.target;
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
        if (preview) preview.textContent = value.trim() || "未命名对象";
      }
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
      const expression = document.getElementById("partner-preview-expression");
      if (key === "expression" && expression) expression.textContent = window.DatingPreparation.expressionLabel(value);
      return;
    }
    if (name?.startsWith("lock.")) { const path=name.slice(5);preparation.locks=checked?[...new Set([...preparation.locks,path])]:preparation.locks.filter(x=>x!==path);return; }
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
      if (name === "player") {
        config.presentation = value === "man" ? "woman" : value === "woman" ? "man" : "unspecified";
        show("preferences", "已根据本场视角调整对象偏好。", false);
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

  app.addEventListener("click", async (event) => {
    if (event.target.closest("button")?.dataset.radar) return radar.handle(event);
    const target = event.target.closest("button");
    if (!target) return;
    const { go, action, turn, select, scene } = target.dataset;
    if (busy && screen !== "live" && go !== "reset") return;
    if (scene) {
      if (!library.scenes.some(item=>item.id===scene)) return;
      config.scene = scene;
      show("settings", "已选择活动，可以继续查看便笺。", false);
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
      app.querySelector(`[data-select="${select}"]`).focus();
      return;
    }
    if (go?.startsWith("prep-") || go === "prepare") {
      try {
        if(go === "prepare") { show("preparation");return; }
        if(go === "prep-exit") { show("cover");return; }
        if(go === "prep-next")preparation.step=Math.min(3,preparation.step+1);
        if (go === "prep-back") {
          if (directPreparation && preparation.step === 1) { show("cover"); return; }
          preparation.step = Math.max(0, preparation.step - 1);
        }
        if(go === "prep-custom")preparation.source="custom";
        if(go === "prep-existing") { preparation.source="preset";preparation.presetId=preparation.presetId||library.roles[0].id;preparation.partnerSpec=JSON.parse(JSON.stringify(window.DatingPartnerModel.fromPreset(library.roles.find(r=>r.id===preparation.presetId)))); }
        if(go === "prep-next" && preparation.source==="preset" && preparation.step===2) preparation.partnerSpec=JSON.parse(JSON.stringify(window.DatingPartnerModel.fromPreset(library.roles.find(r=>r.id===preparation.presetId))));
        if(go === "prep-random") { const locked={};for(const path of preparation.locks){const [g,k]=path.split('.');locked[g] ||= {};locked[g][k]=preparation.partnerSpec[g]?.[k];}preparation.partnerSpec=JSON.parse(JSON.stringify(window.DatingPartnerModel.random(preparation.partnerSpec,crypto.getRandomValues(new Uint32Array(1))[0],locked)));preparation.source="random"; }
        if(go === "prep-save") { window.localStorage.setItem("dating-preparation-v1",window.DatingPreparation.exportConfig(preparation));status.textContent="仅保存对象配置，没有保存聊天。";return; }
        if(go === "prep-export") { download(window.DatingPreparation.exportConfig(preparation),"dating-preparation.json","application/json");return; }
        if(go === "prep-delete") { window.localStorage.removeItem("dating-preparation-v1");status.textContent="已删除本机配置，本场仍保留。";return; }
        if(go === "prep-load" || go === "prep-import") { const text=go === "prep-load" ? window.localStorage.getItem("dating-preparation-v1") : importText;if(!text)throw Error("没有可读取的配置");const restored=window.DatingPreparation.importConfig(text);if(!window.DatingPartnerModel.validate(restored.partnerSpec).valid)throw Error("对象配置不合法");preparation=restored; }
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
          Object.assign(config, next);
          modelMode = useModel;
          return startDate(roles[0]);
        }
        show("preparation");
      } catch(error) { status.textContent=error.message || "配置操作失败"; }
      return;
    }
    switch (go) {
      case "home":
        if (screen !== "live" && !busy) show("cover");
        break;
      case "journal":
        if (screen !== "live" && !busy) show("journal");
        break;
      case "reroll":
        recommendedScene = chooseRecommendation(recommendedScene.id);
        show("cover", "", false);
        app.querySelector('[data-go="reroll"]')?.focus();
        break;
      case "use-recommendation":
        config.scene = recommendedScene.id;
        // The recommendation only preselects a scene. Nothing starts here.
        quickEntry = true; modelMode = false; show("settings");
        break;
      case "quick":
        quickEntry = true; modelMode = false; show("settings");
        break;
      case "custom-entry":
        directPreparation = true;
        if (preparation.step === 0) preparation.step = 1;
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
          modelMode = true; show("preferences");
        } catch (error) { if (ticket === generation) status.textContent = error.message; }
        finally { if (ticket === generation) busy = false; }
        break;
      }
      case "radar-coach": return radar.coach(false);
      case "radar-preflight": return radar.coach(true);
      case "save-home": if(await radar.save()){reset();} break;
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
      case "start": modelMode = false; show("preferences"); break;
      case "preferences": show("preferences"); break;
      case "settings": if (checkAdult()) show("settings"); break;
      case "blind": {
        if (!checkAdult() || !checkPlan()) break;
        const eligible = engine.match(config);
        if (eligible.length) {
          if (quickEntry) modelMode = await detectModel();
          if (screen !== "preferences") break;
          startDate(eligible[0]);
        }
        else show("invitation");
        break;
      }
      case "match":
        if (!checkAdult() || !checkPlan()) break;
        candidates = engine.match(config);
        candidateIndex = 0;
        show("invitation");
        break;
      case "swap": candidateIndex = (candidateIndex + 1) % candidates.length; show("invitation"); break;
      case "meet":
        if (!candidates[candidateIndex] || !checkPlan() || busy) break;
        if (quickEntry) modelMode = await detectModel();
        if (screen !== "invitation") break;
        return startDate(candidates[candidateIndex]);
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
      case "reset": {
        radar.discard();
        if (modelMode && session) {
          ++generation;
          busy = true;
          retryTurn = null;
          try { await api("/api/control", {sessionId:session.sessionId, command:"discard"}); }
          catch (error) { if (error.code !== "SESSION_NOT_FOUND") { busy = false; status.textContent = `清空失败：${error.message}`; break; } }
        }
        reset();
        break;
      }
    }
  });

  reset();
})();
