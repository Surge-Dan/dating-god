(function () {
  const app = document.getElementById("app");
  const status = document.getElementById("status");
  const engine = window.DatingEngine;
  const library = window.DatingContent;
  const report = window.DatingReport;
  const display = { woman: "女性", man: "男性", nonbinary: "非二元" };
  const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

  let modelMode = false;
  let session = null;
  let busy = false;
  let generation = 0;
  let utterance = "";
  let modelOpening;
  let retryTurn = null;
  async function api(path, body) {
    const response = await fetch(path, body ? {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)} : {});
    const value = await response.json();
    if (!response.ok) throw new Error(value.error?.message || "本地服务请求失败，请重试。");
    return value;
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
  function sendModel(payload) {
    if (!session || busy || run.phase !== "live") return;
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

  function reset(next = "cover") {
    ++generation; retryTurn = null; busy = false; session = null; modelMode = false; utterance = "";
    config = {
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
    return `<section class="cover"><div>
      <p class="kicker">约会短篇 / 第一辑</p>
      <h1 tabindex="-1">见面之后</h1>
      <p class="deck">今晚的事，留在这一场。</p>
      <p class="cover-note">赴一场虚构的成年约会。你决定往哪走、聊到哪里，也可以随时离开。散场后，想回看再把那一刻带走。</p>
      ${button("start-model", "模型自由互动", "primary")}${button("start", "离线体验")}<p class="cover-note">模型模式通过本地服务连接模型；离线体验使用预写剧情。模型模式会将本场设置和对话发送至你配置的模型服务。</p>
    </div><figure class="window-frame">
      <svg viewBox="0 0 520 408" role="img" aria-label="傍晚咖啡店，两杯咖啡在窗边的桌上">
        <defs><linearGradient id="dusk" x2="0" y2="1"><stop stop-color="#816270"/><stop offset="1" stop-color="#dd9b82"/></linearGradient></defs>
        <rect width="520" height="408" fill="#301c2b"/>
        <rect x="20" y="20" width="480" height="287" fill="url(#dusk)"/>
        <circle cx="375" cy="106" r="35" fill="#f8cf9c" opacity=".84"/>
        <path d="M20 211l60-27 56 34 63-64 83 69 74-36 69 38 75-23v105H20Z" fill="#684251"/>
        <path d="M20 263h55v-31h59v31h55v-26h85v22h38v-21h46v-22h67v49h75v43H20Z" fill="#4b2c40"/>
        <path d="M27 21v288m466-288v288M259 20v289M21 160h478M20 304h480" fill="none" stroke="#321d2b" stroke-width="12"/>
        <path d="M98 348q13-60 47-62m277 62q-13-60-47-62" fill="none" stroke="#a4656a" stroke-width="10"/>
        <ellipse cx="260" cy="348" rx="170" ry="28" fill="#bc7c74"/>
        <path d="M90 350q170 51 340 0v14q-170 51-340 0Z" fill="#854756"/>
        <g fill="#f6debd" stroke="#612a40" stroke-width="3">
          <ellipse cx="194" cy="340" rx="46" ry="9"/><ellipse cx="324" cy="342" rx="47" ry="9"/>
          <path d="M162 310h58v10q-2 21-28 22-27-1-30-22Zm58 4q31-8 16 11l-18 3M293 312h58v10q-2 21-28 22-27-1-30-22Zm58 4q31-8 16 11l-18 3"/>
          <ellipse cx="191" cy="310" rx="29" ry="5" fill="#784052"/><ellipse cx="322" cy="312" rx="29" ry="5" fill="#784052"/>
        </g>
        <path d="M188 291q-14-15 1-28m10 28q-7-10 2-20m122 22q-11-14 3-29" fill="none" stroke="#f0cbb3" opacity=".65" stroke-width="2.5"/>
      </svg>
      <figcaption>窗边没有空位。门还开着。</figcaption>
    </figure></section>`;
  }

  function preferences() {
    return `<section class="panel">
      ${heading("赴约前 / 01", "想遇见怎样的人？", "偏好只用来挑这一场。你可以细选，也可以直接去盲约。")}
      <div class="form-grid">
        ${modelMode ? `<label class="field"><span>这一场的节奏（自主选择）</span><select name="mode">${Object.entries({mellow:"新手尝鲜",spark:"心动试探",tension:"暧昧过招",hard:"地狱修罗场"}).map(([id,label])=>option(id,label,config.mode)).join("")}</select><small>高档会出现含糊回应、期待落差和关系张力；边界与随时退出始终有效。</small></label>` : ""}
        <fieldset><legend>成年确认</legend>${check("adult", "我已年满 18 岁", config.adult)}</fieldset>
        <div class="field-row">
          <label class="field"><span>想见的对象</span><select name="presentation">
            ${option("unspecified", "暂不指定，便笺不先标性别", config.presentation)}
            ${option("any", "都可以，便笺可显示性别", config.presentation)}
            ${Object.entries(display).map(([id, label]) => option(id, label, config.presentation)).join("")}
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
      <div class="buttons">${button("blind", "直接去盲约", "primary")}${button("settings", "选地点和边界")}${button("reset", "返回封面", "quiet")}</div>
    </section>`;
  }

  function settings() {
    return `<section class="panel">
      ${heading("赴约前 / 02", "这次约在哪里？", "期待和想避开的话题只留在这场设置里。角色只知道你们实际说过的事。")}
      <div class="form-grid">
        <label class="field"><span>地点与见面背景</span><select name="scene">
          ${library.scenes.map((scene) => option(scene.id, scene.name, config.scene)).join("")}
        </select></label>
        <label class="field"><span>我希望这场约会……（可选）</span><textarea name="expectation" maxlength="320" placeholder="例如，我想试试说出自己真正喜欢的地点。">${esc(config.expectation)}</textarea></label>
        <fieldset><legend>避开的话题</legend><div class="checks">${Object.entries(library.topics).map(([id, label]) =>
          check("avoid", label, config.avoid.includes(id), id)).join("")}</div></fieldset>
        <fieldset><legend>节奏</legend><div class="checks">
          ${check("surprise", "允许一点场景小变化", config.surprise)}
          ${check("guidance", "开场时给我一个可见的方向", config.guidance)}
        </div></fieldset>
      </div>
      <div class="buttons">${button("match", "看看见面便笺", "primary")}${button("preferences", "上一步", "quiet")}</div>
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
      ${heading("赴约前 / 03", "一张见面便笺")}
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

  function log(events) {
    return `<ol class="log">${events.map((event) =>
      `<li><strong>${esc(event.label)}</strong><br>${esc(event.reply)}${event.detail ? `<br>${esc(event.detail)}` : ""}<br><small>${esc(event.effect)}</small></li>`).join("")}</ol>`;
  }

  function live() {
    const role = engine.roleById(run.role);
    const scene = engine.sceneById(run.scene);
    const start = modelMode ? modelOpening : engine.opening(run);
    const last = run.events.at(-1);
    const paused = run.phase === "paused";
    const label = run.branchFrom === null ? "约会现场" : "重演 / 同一刻的另一种走法";
    return `<section class="panel">
      <article class="theatre">
        <p class="kicker">${label} · ${timeLabel(scene, run.elapsed)}</p>
        <h1 tabindex="-1">${role.name} · ${run.location}</h1>
        ${paused ? "<p class=\"line\">已经暂停。回到现场时，时间会从这一刻接上。</p>" : `
          ${last?.detail || !last ? `<p class="stage-detail" id="model-detail">${modelMode ? "" : esc(last?.detail || start.detail)}</p>` : ""}
          <p class="line" id="model-line">「${modelMode ? "" : esc(last?.reply || start.line)}」</p>`}
      </article>
      <div class="control">
        ${paused ? button("resume", "回到现场") : button("pause", "暂停", "quiet")}
        ${!paused ? button("hint", hint ? "收起提示" : "我有点卡住", "quiet") : ""}
        ${button("end", "提前散场", "quiet")}
      </div>
      ${hint && !paused ? `<p class="prompt">可以从眼前的选择出发。${run.events.length ?
        "照自己的节奏决定，也可以先保留意见或道别。" : scene.hint}</p>` : ""}
      ${modelMode && !paused ? `<label class="field"><span>你想说什么？</span><textarea name="utterance" maxlength="1200" ${busy ? "disabled" : ""}></textarea></label><div class="buttons"><button type="button" data-go="send" ${busy ? "disabled" : ""}>${busy ? "正在回应…" : "发送"}</button>${busy ? button("cancel", "取消本次请求") : ""}</div>` : ""}
      ${paused ? "" : `<div class="steps" aria-label="你想怎么做">${engine.choices(run).map((choice, index) =>
        `<button type="button" data-action="${choice.id}" ${busy ? "disabled" : ""} data-turn="${run.events.length}"${index === 0 ? ' class="primary"' : ""}>${choice.label}</button>`).join("")}</div>`}
      ${run.events.length && !paused ? `<details><summary>看看已经发生的事</summary>${log(run.events)}</details>` : ""}
    </section>`;
  }

  function review() {
    const event = original.events[draft.selected];
    const suggestion = report.choices(original, draft.selected);
    return `<section class="panel">
      ${heading("散场后 / 01", "想回看哪一刻？", original.outcome)}
      ${config.expectation.trim() ? `<article class="ticket"><p class="meta">赴约前写给自己的期待</p><p>${esc(config.expectation)}</p>
        ${check("includeExpectation", "把这条期待也写入 HTML 报告", draft.includeExpectation)}</article>` : ""}
      ${original.events.length ? `<div class="steps" aria-label="选一个回合">${original.events.map((item, index) =>
        `<button type="button" data-select="${index}" aria-pressed="${draft.selected === index}">${index + 1}. ${esc(item.label)}</button>`).join("")}</div>`
        : "<p>这场还没有可引用的互动。你可以留一句原本想试的事。</p>"}
      ${event ? `<article class="ticket"><p class="meta">这一刻 · 角色实际回应</p><p>「${esc(event.reply)}」</p>
        <p class="subline">这一刻，你在意的是对方给的答案，还是你可以自在地说出自己的选择？也可以都不是。</p>
        ${!alternative ? button("replay", "从这一幕重演") : "<p>重演已完成，回看将分开呈现。</p>"}</article>` : ""}
      <div class="form-grid">
        <label class="field"><span>想留给自己的便笺（可选）</span><textarea name="note" maxlength="320" placeholder="我当时在意的是……">${esc(draft.note)}</textarea></label>
        ${check("includeNote", "把这条私人便笺也写入 HTML 报告", draft.includeNote)}
        ${suggestion ? `<div>${button("suggest", "用一个可能的发现作草稿")}</div>` : ""}
        <label class="field"><span>我想带走的一句话（可选）</span><input type="text" name="accepted" value="${esc(draft.accepted)}" maxlength="96" placeholder="按自己的话写，可以留空"></label>
        ${check("confirmed", "这句话是我认领的发现，可用于报告和 Dating 卡", draft.confirmed)}
      </div>
      <div class="buttons">${button("final", "查看这场回看", "primary")}${button("reset", "不回看，结束这场", "quiet")}</div>
    </section>`;
  }

  function exportDraft() {
    return { ...draft, nickname: config.nickname, expectation: config.expectation };
  }

  function final() {
    const approved = report.claim(original, exportDraft(), alternative);
    const experiment = report.experiment(original, exportDraft(), alternative);
    return `<section class="panel">
      ${heading("散场后 / 02", "散场之后", original.outcome)}
      <article class="ticket"><p class="meta">这场 · ${engine.sceneById(original.scene).name}</p>
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
        ${button("review", "返回调整", "quiet")}${button("reset", "结束并清空这场", "quiet")}</div>
    </section>`;
  }

  const views = { cover, preferences, settings, invitation, live, review, final };
  function show(next, message = "", focus = true) {
    screen = next;
    app.innerHTML = views[next]();
    if (modelMode && next === "live") {
      const last = run.events.at(-1);
      const line = app.querySelector("#model-line");
      const detail = app.querySelector("#model-detail");
      if (line) line.textContent = last?.reply || modelOpening?.line || "";
      if (detail) detail.textContent = last?.detail || modelOpening?.detail || "";
      const input = app.querySelector('[name="utterance"]');
      if (input) input.value = utterance;
    }
    status.textContent = message;
    refreshCardPreview();
    if (focus) app.querySelector("h1")?.focus();
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

  function finish() {
    if (run.branchFrom === null) original = run;
    else alternative = run;
    show("review");
  }

  function startDate(role) {
    if (modelMode) return modelRequest("/api/session", {
      config:Object.fromEntries(["adult","scene","player","presentation","avoid","seed","mode","traits","interest","surprise"].map(key=>[key,config[key]])),
      roleId:role.id,
    }, value => {
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
    const target = event.target.closest("button");
    if (!target) return;
    const { go, action, turn, select } = target.dataset;
    if (action) {
      if (modelMode) return sendModel({actionId:action});
      const updated = engine.act(run, action, Number(turn));
      if (updated === run) return;
      run = updated;
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
    switch (go) {
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
      case "send": if (utterance.trim()) return sendModel({text:utterance}); break;
      case "cancel": return control("cancel");
      case "start": modelMode = false; show("preferences"); break;
      case "preferences": show("preferences"); break;
      case "settings": if (checkAdult()) show("settings"); break;
      case "blind": {
        if (!checkAdult()) break;
        const eligible = engine.match(config);
        if (eligible.length) startDate(eligible[0]);
        else show("invitation");
        break;
      }
      case "match":
        if (!checkAdult()) break;
        candidates = engine.match(config);
        candidateIndex = 0;
        show("invitation");
        break;
      case "swap": candidateIndex = (candidateIndex + 1) % candidates.length; show("invitation"); break;
      case "meet": startDate(candidates[candidateIndex]); break;
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
        if (modelMode && session) {
          ++generation;
          busy = true;
          retryTurn = null;
          try { await api("/api/control", {sessionId:session.sessionId, command:"discard"}); }
          catch (error) { busy = false; status.textContent = `清空失败：${error.message}`; break; }
        }
        reset();
        break;
      }
    }
  });

  reset();
})();
