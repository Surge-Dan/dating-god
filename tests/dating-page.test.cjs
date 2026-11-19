const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { runInNewContext } = require("node:vm");
const { webcrypto } = require("node:crypto");
const assert = require("node:assert/strict");
const test = require("node:test");

// Exercise the page's real handlers without launching a browser.
function openPage(overrides = {}) {
  const events = {};
  const files = new Map();
  const downloads = [];
  let focusCount=0;
  const focusable = { focus() {focusCount++;} };
  const radarHost={innerHTML:""};
  const extraElements=new Map();
  const art = {};
  const view = {
    innerHTML: "",
    addEventListener: (name, handler) => { events[name] = handler; },
    querySelector: () => focusable,
  };
  const status = { textContent: "" };
  const document = {
    getElementById: (id) => extraElements.get(id) || ({ "radar-host":view.innerHTML.includes('id="radar-host"')?radarHost:null, app: view, status, "card-art": view.innerHTML.includes('id="card-art"') ? art : null })[id],
    createElement: () => ({
      click() { downloads.push({ name: this.download, data: files.get(this.href) }); },
    }),
  };
  let sequence = 0;
  const URL = {
    createObjectURL: (blob) => { const key = `blob:${++sequence}`; files.set(key, blob); return key; },
    revokeObjectURL: (key) => files.delete(key),
  };
  const context = { window: {}, document, crypto: webcrypto, URL, Blob, setTimeout: () => {}, ...overrides };
  const dir = resolve(__dirname, "../dating-god/assets");
  const index = readFileSync(resolve(dir, "index.html"), "utf8");
  for (const [, script] of index.matchAll(/<script defer src="([^"]+)"/g)) {
    runInNewContext(readFileSync(resolve(dir, script), "utf8"), context, { filename: script });
  }
  return {
    view, status, downloads, radarHost, focusCount:()=>focusCount, element:(id,value)=>extraElements.set(id,{value}),
    preview: () => files.get(art.src),
    click: (dataset) => events.click({ target: { closest: () => ({ dataset }) } }),
    input: (name, value) => events.input({ target: {
      name, value, checked: value === true, type: typeof value === "boolean" ? "checkbox" : "text",
    } }),
  };
}

test("page gates blind dates, renders a replay, and downloads exactly what it previews", async () => {
  const page = openPage();
  const go = (id) => page.click({ go: id });
  const act = (action, turn) => page.click({ action, turn: String(turn) });
  go("start");
  go("blind");
  assert.match(page.status.textContent, /年满 18 岁/);
  page.input("adult", true);
  go("blind");
  go("pause");
  assert.match(page.view.innerHTML, /已经暂停/);
  go("resume");
  act("walk", 0);
  go("end");
  page.click({ select: "0" });
  go("replay");
  act("wait", 0);
  go("end");
  go("suggest");
  page.input("confirmed", true);
  go("final");
  assert.match(page.view.innerHTML, /实际重演/);
  assert.ok(!String(await page.preview().text()).includes("有更舒服的备选"));
  page.input("includeExperiment", true);
  const preview = await page.preview().text();
  assert.match(preview, /有更舒服的备选/);
  assert.equal(page.downloads.length, 0);
  go("download-card");
  go("download-report");
  assert.equal(await page.downloads[0].data.text(), preview);
  assert.match(await page.downloads[1].data.text(), /实际重演/);
  go("reset");
  go("start");
  go("blind");
  assert.match(page.status.textContent, /年满 18 岁/);
});

test("recommended scene is replaceable before opening and the role library starts the selected scene", async () => {
  const page = openPage();
  const go = id => page.click({go:id});
  assert.match(page.view.innerHTML, /直接用角色库/);
  assert.match(page.view.innerHTML, /先捏一个对象/);
  const first = page.view.innerHTML.match(/<h2>([^<]+)<\/h2>/)[1];
  await go("reroll");
  assert.notEqual(page.view.innerHTML.match(/<h2>([^<]+)<\/h2>/)[1], first);
  await go("use-recommendation");
  assert.match(page.view.innerHTML, /这次约在哪里/);
  await page.click({scene:"A08"});
  await go("match");
  assert.match(page.status.textContent, /年满 18 岁/);
  page.input("adult", true);
  await go("match");
  assert.match(page.view.innerHTML, /角色库/);
  await go("meet");
  assert.match(page.view.innerHTML, /公园公共东门/);
  assert.doesNotMatch(page.view.innerHTML, /name="utterance"/);
});


test("model page sends free text, blocks duplicates, preserves failed input, and ignores cancelled replies", async () => {
  let pending;
  const calls = [];
  const engine = require("../dating-god/assets/engine.js");
  let state;
  const page = openPage({window:{location:{protocol:"http:"}}, fetch:async (path, options) => {
    const body = options.body ? JSON.parse(options.body) : null;
    calls.push({path, body});
    if (path === "/api/config") return {ok:true,json:async()=>({available:true})};
    if (path === "/api/session") {
      state = engine.createRun(body.config, body.roleId);
      return {ok:true,json:async()=>({sessionId:"s",version:0,run:state,opening:{line:"你好",detail:"窗边"}})};
    }
    if (path === "/api/control") return {ok:true,json:async()=>({sessionId:"s",version:2,run:state})};
    return new Promise(resolve => { pending = resolve; });
  }});
  await page.click({go:"start-model"});
  page.input("adult", true);
  await page.click({go:"blind"});
  // blind dispatch starts asynchronously; allow its response to render.
  await new Promise(resolve => setImmediate(resolve));
  const sentConfig = calls.find(c=>c.path==="/api/session").body.config;
  for (const privateKey of ["nickname","expectation","guidance"]) assert.equal(Object.hasOwn(sentConfig,privateKey),false);
  for (const field of ["stage","intent","exclusivity","budget","timeBudget","alcohol","experience","diet"]) assert.ok(Object.hasOwn(sentConfig,field),field);
  assert.equal(sentConfig.experience,"novice");
  assert.match(page.view.innerHTML, /name="utterance"/);
  page.input("utterance", "想聊聊你的周末");
  const first = page.click({go:"send"});
  await page.click({go:"send"});
  assert.equal(calls.filter(c=>c.path==="/api/turn").length,1);
  assert.equal(calls.at(-1).body.text,"想聊聊你的周末");
  pending({ok:false,json:async()=>({error:{message:"模型暂时不可用"}})});
  await first;
  assert.equal(page.view.querySelector().value,"想聊聊你的周末");
  assert.match(page.status.textContent,/模型暂时不可用/);
  const second = page.click({go:"send"});
  await page.click({go:"cancel"});
  pending({ok:true,json:async()=>({sessionId:"s",version:1,run:{...state,phase:"ended"}})});
  await second;
  assert.match(page.view.innerHTML,/name="utterance"/);
  assert.equal(calls.filter(c=>c.path==="/api/control").at(-1).body.command,"cancel");
  await page.click({go:"reset"});
  assert.equal(calls.filter(c=>c.path==="/api/control").at(-1).body.command,"discard");
});

test("model preferences offer four explicit difficulty modes", async () => {
  const page = openPage({window:{location:{protocol:"http:"}},fetch:async()=>({ok:true,json:async()=>({available:true})})});
  await page.click({go:"start-model"});
  for (const mode of ["mellow","spark","tension","hard"]) assert.match(page.view.innerHTML,new RegExp('value="'+mode+'"'));
  page.input("player","man");
  page.click({go:"preferences"});
  assert.match(page.view.innerHTML, /value="woman" selected/);
});

test("retry after response loss reuses the same request identity", async () => {
  const engine = require("../dating-god/assets/engine.js");
  let state, attempt=0;
  const bodies=[];
  const page=openPage({window:{location:{protocol:"http:"}},fetch:async(path,options)=>{
    const body=options.body ? JSON.parse(options.body):null;
    if(path==="/api/config") return {ok:true,json:async()=>({available:true})};
    if(path==="/api/session") {state=engine.createRun(body.config,body.roleId);return {ok:true,json:async()=>({sessionId:"s",version:0,run:state,opening:{line:"你好",detail:"门口"}})};}
    bodies.push(body);
    if(++attempt===1) throw new Error("response lost");
    return {ok:true,json:async()=>({sessionId:"s",version:1,run:state})};
  }});
  await page.click({go:"start-model"});page.input("adult",true);await page.click({go:"blind"});
  await new Promise(resolve=>setImmediate(resolve));page.input("utterance","你好");
  await page.click({go:"send"});await page.click({go:"send"});
  assert.equal(bodies.length,2);
  assert.equal(bodies[0].requestId,bodies[1].requestId);
});

test("offline setup exposes relationship and practical constraints without a separate questionnaire", async () => {
  const page=openPage();await page.click({go:"start"});
  assert.match(page.view.innerHTML,/name="mode"/);
  for(const name of ["stage","intent","exclusivity","budget","timeBudget","alcohol","experience","diet"]) assert.match(page.view.innerHTML,new RegExp('name="'+name+'"'));
  page.input("adult",true);await page.click({go:"settings"});
  assert.match(page.view.innerHTML,/class="scene-groups"/);
  assert.match(page.view.innerHTML,/data-scene="S02"/);
  assert.match(page.view.innerHTML,/data-scene="S05"/);
  await page.click({scene:"S05"});
  assert.match(page.view.innerHTML,/data-scene="S05"[^>]*aria-pressed="true"/);
});


test("offline scene keeps mode guidance and can lower the current intensity", async () => {
  const page=openPage();await page.click({go:"start"});page.input("adult",true);page.input("mode","hard");
  await page.click({go:"blind"});assert.match(page.view.innerHTML,/地狱修罗场/);
  await page.click({go:"lower-mode"});assert.match(page.view.innerHTML,/暧昧过招/);
  await page.click({go:"pause"});assert.match(page.view.innerHTML,/已经暂停/);
});

test("scene cards explain infeasible activities and block an over-budget start", async()=>{
 const page=openPage();await page.click({go:"start"});page.input("adult",true);page.input("budget","0");
 await page.click({go:"settings"});assert.match(page.view.innerHTML,/预算不足/);
 await page.click({go:"match"});assert.match(page.status.textContent,/预算|时间/);
 assert.doesNotMatch(page.view.innerHTML,/一张见面便笺/);
});

test("browser script bundle renders every released activity grouped by category",async()=>{
 const page=openPage();await page.click({go:"start"});page.input("adult",true);await page.click({go:"settings"});
 assert.equal([...page.view.innerHTML.matchAll(/data-scene="/g)].length,24);
 for(const group of ["吃喝","文娱","户外","逛街","手作","游戏","运动","夜间"]) assert.match(page.view.innerHTML,new RegExp(group));
 assert.doesNotMatch(page.view.innerHTML,/时长未提供|预算未提供/);
});

test("second station clock stays anchored to the start of the full date",async()=>{
 const engine=require("../dating-god/assets/engine.js");let state;
 const page=openPage({window:{location:{protocol:"http:"}},fetch:async(path,options)=>{
  const body=options.body?JSON.parse(options.body):null;
  if(path==="/api/config")return {ok:true,json:async()=>({available:true})};
  if(path==="/api/session")state=engine.createRun(body.config,body.roleId);
  else state={...state,scene:"S05",initialScene:"S02",elapsed:10};
  return {ok:true,json:async()=>({sessionId:"clock",version:0,run:state,opening:{line:"你好",detail:"门口"}})};
 }});
 await page.click({go:"start-model"});page.input("adult",true);await page.click({go:"blind"});await new Promise(resolve=>setImmediate(resolve));
 page.input("utterance","一起去下一站吧");await page.click({go:"send"});
 assert.match(page.view.innerHTML,/16:10/);
});


test("offline blocked photo produces a private short card and honors immersion toggle", async()=>{
 const page=openPage(); await page.click({go:"start"});page.input("adult",true);await page.click({go:"blind"});
 await page.click({action:"snap-photo",turn:"0"});await new Promise(resolve=>setImmediate(resolve));
 assert.match(page.radarHost.innerHTML,/未获同意|拍摄|拍照/);assert.match(page.radarHost.innerHTML,/动作未执行/);
 assert.match(page.radarHost.innerHTML,/离线仅检查结构化动作事实/);
 const before=page.focusCount();await page.click({radar:"toggle",id:""});assert.equal(page.focusCount(),before);
 assert.doesNotMatch(page.radarHost.innerHTML,/class="radar-card"/);
 await page.click({radar:"toggle",id:""});assert.match(page.radarHost.innerHTML,/class="radar-card"/);
});
test("home groups practice rules and completes exactly three independent rounds",async()=>{
 const page=openPage();await page.click({go:"journal"});await new Promise(resolve=>setImmediate(resolve));
 assert.match(page.radarHost.innerHTML,/还没有保存的记录/);assert.match(page.radarHost.innerHTML,/radar-practice-group/);
 page.element("radar-practice-rule","D04-01");await page.click({radar:"practice-chosen",id:""});
 assert.match(page.radarHost.innerHTML,/独立微练习/);
 for(let i=0;i<3;i++){await page.click({radar:"practice-action",id:String(i)});assert.match(page.radarHost.innerHTML,/TA：/);}
 assert.match(page.radarHost.innerHTML,/3\/3/);assert.match(page.radarHost.innerHTML,/不推断现实中已经改善/);
 await page.click({radar:"practice-close",id:""});assert.doesNotMatch(page.radarHost.innerHTML,/radar-practice-text/);
});

test('preparation entry advances through assumptions and confirmation without removing original experience',()=>{const page=openPage();page.click({go:'prepare'});assert.match(page.view.innerHTML,/准备重点/);page.input('prep.brief','周末第一次见面');page.click({go:'prep-next'});assert.match(page.view.innerHTML,/锁定/);page.click({go:'prep-next'});assert.match(page.view.innerHTML,/活动模板/);page.click({go:'prep-next'});assert.match(page.view.innerHTML,/本次预演卡/);assert.match(page.view.innerHTML,/周末第一次见面/);page.input('adult',true);page.click({go:'prep-offline'});assert.equal(page.status.textContent,'');assert.match(page.view.innerHTML,/暂停/);});

test('custom and randomized locked partners enter real perler and tennis scenes and finish',async()=>{for(const template of ['perler','tennis']){const page=openPage();const go=id=>page.click({go:id});await go('prepare');page.input('prep.brief','练习共同活动');await go('prep-next');page.input('partner.appearance.hairLength','long');page.input('lock.appearance.hairLength',true);page.input('partner.interaction.expression','reserved');await go('prep-random');assert.match(page.view.innerHTML,/<option value="long" selected>/);page.input('partner.interaction.expression','outgoing');await go('prep-next');page.input('prep.template',template);page.input('prep.place','周末活动店');await go('prep-next');page.input('adult',true);await go('prep-offline');assert.equal(page.status.textContent,'');assert.match(page.view.innerHTML,/暂停/);assert.match(page.view.innerHTML,/周末活动店/);await go('end');assert.match(page.view.innerHTML,/回看|散场|带走/);}});

test('preparation config persists without conversation and can be deleted independently',async()=>{const stored=new Map();const page=openPage({window:{localStorage:{setItem:(k,v)=>stored.set(k,v),getItem:k=>stored.get(k),removeItem:k=>stored.delete(k)}}});await page.click({go:'prepare'});page.input('prep.brief','周末准备');await page.click({go:'prep-save'});const raw=[...stored.values()][0];assert.match(raw,/周末准备/);assert.ok(!/events|transcript|messages/.test(raw));await page.click({go:'prep-exit'});assert.match(page.view.innerHTML,/先捏一个对象/);await page.click({go:'prepare'});await page.click({go:'prep-delete'});assert.equal(stored.size,0);});

test('existing role presets stay within preparation confirmation and reach the date',async()=>{const page=openPage();const go=id=>page.click({go:id});await go('prepare');await go('prep-next');await go('prep-existing');assert.match(page.view.innerHTML,/现成人物预设/);await go('prep-next');await go('prep-next');assert.match(page.view.innerHTML,/本次预演卡/);page.input('adult',true);await go('prep-offline');assert.equal(page.status.textContent,'');assert.match(page.view.innerHTML,/暂停/);await go('end');page.input('review-prep.claimedAction','先问对方有没有兴趣');await go('final');assert.match(page.view.innerHTML,/赴约准备|这场/);});

test("custom entry keeps the object draft and can start a built-in scene with no location text", async () => {
  const page = openPage();
  const go = id => page.click({go:id});
  await go("custom-entry");
  page.input("prep.name","小棠");
  await go("home");
  await go("custom-entry");
  assert.match(page.view.innerHTML, /小棠/);
  await go("prep-next");
  page.input("prep.template","A08");
  await go("prep-next");
  assert.match(page.view.innerHTML, /公园散步/);
  page.input("adult",true);
  await go("prep-auto");
  assert.match(page.view.innerHTML, /小棠 · 公园公共东门/);
});
