const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { runInNewContext } = require("node:vm");
const { webcrypto } = require("node:crypto");
const assert = require("node:assert/strict");
const test = require("node:test");

// Exercise the page's real handlers without launching a browser.
function openPage(overrides = {}) {
  const events = {};
  const browserEvents = {};
  const historyEntries=[];
  let historyIndex=-1;
  const history={
    state:null,
    pushState(state,_title,url){historyEntries.splice(historyIndex+1);historyEntries.push({state,url});historyIndex++;this.state=state;},
    replaceState(state,_title,url){if(historyIndex<0){historyEntries.push({state,url});historyIndex=0;}else historyEntries[historyIndex]={state,url};this.state=state;},
    back(){if(historyIndex>0){historyIndex--;this.state=historyEntries[historyIndex].state;browserEvents.popstate?.({state:this.state});}},
    forward(){if(historyIndex<historyEntries.length-1){historyIndex++;this.state=historyEntries[historyIndex].state;browserEvents.popstate?.({state:this.state});}},
  };
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
  const context = { ...overrides, window: {history,addEventListener:(name,handler)=>{browserEvents[name]=handler;},...(overrides.window||{})}, document, crypto: webcrypto, URL, Blob, setTimeout: () => {} };
  const dir = resolve(__dirname, "../dating-god/assets");
  const index = readFileSync(resolve(dir, "index.html"), "utf8");
  for (const [, script] of index.matchAll(/<script defer src="([^"]+)"/g)) {
    runInNewContext(readFileSync(resolve(dir, script), "utf8"), context, { filename: script });
  }
  return {
    view, status, downloads, radarHost, historyEntries, focusCount:()=>focusCount, element:(id,value)=>extraElements.set(id,{value}), back:()=>history.back(),forward:()=>history.forward(),
    preview: () => files.get(art.src),
    click: (dataset) => events.click({ target: { closest: () => ({ dataset }) } }),
    input: (name, value) => events.input({ target: {
      name, value, checked: value === true, type: typeof value === "boolean" ? "checkbox" : "text",
    } }),
  };
}

test("selection returns to preparation and preserves the adopted scene across role filters", async () => {
  const page = openPage();
  const go = id => page.click({go:id});
  await go("all-scenes");
  await page.click({sceneChoice:"A08"});
  await go("use-scene");
  assert.match(page.view.innerHTML, /<h1[^>]*>本场准备/);
  assert.match(page.view.innerHTML, /公园散步/);
  await go("edit-role");
  await page.click({role:"R01"});
  page.input("role-search","完全没有这个名字");
  assert.match(page.view.innerHTML,/当前筛选未显示/);
  await go("choose-role");
  assert.match(page.view.innerHTML, /<h1[^>]*>本场准备/);
  assert.match(page.view.innerHTML, /公园散步/);
  assert.match(page.view.innerHTML, /林澈/);
});

test("moment choices and free context are stored separately and open the selected moment", async () => {
  let setup;
  const engine=require("../dating-god/assets/engine.js");
  const page=openPage({window:{location:{protocol:"http:"}},fetch:async(path, request)=>{
    const json=value=>({ok:true,json:async()=>value});
    if(path==="/api/config")return json({available:true,status:"configured"});
    if(path==="/api/session"){
      setup=JSON.parse(request.body);
      const run=engine.createRun(setup.config,setup.roleId);
      run.rehearsalTask=setup.task;
      return json({sessionId:"moment",version:0,run,opening:{line:"要不要我送你？",detail:"准备分别"}});
    }
    throw Error(path);
  }});
  await page.click({go:"new-practice"});
  page.input("task-context","我想自己回家");
  await page.click({taskGoal:"不知道怎么结束"});
  await page.click({go:"home"});
  await page.click({go:"continue-setup"});
  assert.match(page.view.innerHTML,/我想自己回家/);
  page.input("adult",true);
  await page.click({go:"task-start"});
  assert.equal(setup.task.context,"我想自己回家");
  assert.equal(setup.task.moment,"close");
  assert.match(page.view.innerHTML,/要不要我送你/);
  assert.match(page.view.innerHTML,/textarea name="utterance"/);
});

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
  assert.match(page.view.innerHTML,/散场之后/);
  await go("confirm-reset");
  go("start");
  go("blind");
  assert.match(page.status.textContent, /年满 18 岁/);
});

test("recommended scene is replaceable before opening and the role library starts the selected scene", async () => {
  const page = openPage();
  const go = id => page.click({go:id});
  assert.match(page.view.innerHTML, /先模拟一场约会/);
  assert.match(page.view.innerHTML, /我快要去约会了/);
  assert.match(page.view.innerHTML, /复盘长这样/);
  const group=()=>[...page.view.innerHTML.matchAll(/data-home-scene="([^"]+)"/g)].map(match=>match[1]);
  let previous=group();
  for(let i=0;i<10;i++){
    await go("reroll");
    const next=group();
    assert.equal(next.length,4);
    assert.equal(new Set(next).size,4);
    assert.ok(next.filter(id=>!previous.includes(id)).length>=3);
    previous=next;
  }
  await page.click({homeCategory:"吃喝"});
  const food=group();
  const content=require("../dating-god/assets/content.js");
  assert.ok(food.every(id=>content.scenes.find(scene=>scene.id===id).category==="吃喝"));
  await page.click({homeScene:food[0]});
  assert.match(page.view.innerHTML,/用这个场景准备一场/);
  assert.match(page.view.innerHTML,/约会预演/);
  await go("use-home-scene");
  assert.match(page.view.innerHTML,/本场准备/);
  await go("home");
  assert.deepEqual(group(),food);
  await go("all-scenes");
  assert.match(page.view.innerHTML, /电影院/);
  await page.click({sceneChoice:"S02"});
  assert.match(page.view.innerHTML, /咖啡／茶饮/);
  await go("use-scene");
  assert.match(page.view.innerHTML, /本场准备/);
  await go("edit-role");
  await page.click({role:"R01"});
  assert.match(page.view.innerHTML, /林澈/);
  await go("choose-role");
  assert.match(page.view.innerHTML, /本场准备/);
  assert.match(page.view.innerHTML, /林澈/);
  await go("task-start");
  assert.match(page.view.querySelector("#task-error").textContent, /年满 ?18 ?岁/);
  page.input("adult", true);
  await go("task-start");
  assert.match(page.view.innerHTML, /自由聊天需要本地服务/);
  assert.doesNotMatch(page.view.innerHTML, /name="utterance"/);
});

test("scene catalog, new practice, and archived notes stay separate", async () => {
  const page = openPage();
  const go = id => page.click({go:id});
  go("all-scenes");
  assert.match(page.view.innerHTML, /scene-catalog/);
  assert.match(page.view.innerHTML, /电影院/);
  assert.doesNotMatch(page.view.innerHTML,/data-scene-choice="[^"]+" aria-pressed="true"/);
  assert.match(page.view.innerHTML,/data-go="use-scene"[^>]+disabled/);
  go("use-scene");
  assert.match(page.view.innerHTML,/scene-catalog/);
  page.click({sceneChoice:"A08"});
  assert.match(page.view.innerHTML, /公园散步/);
  page.click({sceneCategory:"吃喝"});
  assert.doesNotMatch(page.view.innerHTML,/data-scene-choice="A08"/);
  assert.match(page.view.innerHTML,/在当前分类外/);
  page.click({sceneCategory:"户外"});
  assert.match(page.view.innerHTML,/data-scene-choice="A08" aria-pressed="true"/);
  go("use-scene");
  assert.match(page.view.innerHTML, /本场准备/);
  await go("journal");
  await go("confirm-switch-task");
  assert.match(page.view.innerHTML, /挑一个你想练的瞬间/);
  assert.doesNotMatch(page.view.innerHTML, /旧版|我的记录/);
  await go("legacy-journal");
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(page.radarHost.innerHTML, /还没有保存的约会记录/);
  assert.doesNotMatch(page.radarHost.innerHTML, /data-radar="journal-tab"|data-radar="practice-group-select"/);
});

test("journal deletion shows its scope and can be cancelled before removing records", async () => {
  const page = openPage();
  await page.click({go:"legacy-journal"});
  await new Promise(resolve=>setImmediate(resolve));
  page.click({radar:"clear"});
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(page.radarHost.innerHTML, /role="alertdialog"/);
  assert.match(page.radarHost.innerHTML, /约会对话与报告文件不会被删除/);
  page.click({radar:"cancel-removal"});
  await new Promise(resolve=>setImmediate(resolve));
  assert.doesNotMatch(page.radarHost.innerHTML, /journal-confirm-overlay/);
});

test("incompatible role stays in the scene step and can choose a compatible activity", async () => {
  const page=openPage();
  const go=id=>page.click({go:id});
  await go("quick");
  await page.click({role:"R01"});
  await go("choose-role");
  const scenes=require("../dating-god/assets/content.js");
  const role=scenes.roles.find(item=>item.id==="R01");
  const incompatible=scenes.scenes.find(item=>!role.scenes.includes(item.id));
  await page.click({scene:incompatible.id});
  assert.match(page.view.innerHTML,/plan-warning/);
  assert.match(page.view.innerHTML,/林澈的档案不兼容/);
  await go("compatible-scenes");
  assert.doesNotMatch(page.view.innerHTML,/class="plan-warning"/);
  assert.match(page.view.innerHTML,/林澈/);
  await go("confirm-preferences");
  page.input("adult",true);
  await go("match");
  assert.match(page.view.innerHTML,/一张见面便笺/);
});

test("home starts the short practice directly and builder steps restore through browser history", async () => {
  const page=openPage();
  await page.click({go:"home-practice"});
  assert.match(page.view.innerHTML,/点选短练/);
  await page.click({go:"offline-return"});
  await page.click({method:"custom"});
  await page.click({go:"custom-entry"});
  page.input("prep.name","小棠");
  await page.click({go:"prep-next"});
  assert.match(page.view.innerHTML,/data-custom-scene="tennis"/);
  page.back();
  assert.match(page.view.innerHTML,/小棠/);
  page.forward();
  assert.match(page.view.innerHTML,/data-custom-scene="tennis"/);
  assert.doesNotMatch(JSON.stringify(page.historyEntries),/小棠/);
});

test("role filters do not pick the first result and pausing from navigation preserves the run",async()=>{
  const page=openPage();
  const go=id=>page.click({go:id});
  await go("quick");
  assert.doesNotMatch(page.view.innerHTML,/data-role="[^"]+"[^>]*aria-pressed="true"/);
  await page.click({role:"R01"});
  page.input("role-gender","man");
  assert.doesNotMatch(page.view.innerHTML,/data-role="[^"]+"[^>]*aria-pressed="true"/);
  await go("start");
  page.input("adult",true);
  await go("blind");
  await page.click({action:"walk",turn:"0"});
  await go("leave-live");
  await go("pause-and-leave");
  assert.match(page.view.innerHTML,/本场已暂停/);
  await go("return-live");
  assert.match(page.view.innerHTML,/查看已发生的事/);
});

test("undo restores the previous partner draft while locked tags remain unchanged",async()=>{
  const page=openPage();
  const go=id=>page.click({go:id});
  await go("custom-entry");
  await page.click({builderGroup:"appearance"});
  page.input("partner.appearance.hairLength","long");
  page.input("lock.appearance.hairLength",true);
  page.input("partner.interaction.expression","reserved");
  await go("prep-random");
  assert.match(page.view.innerHTML,/<option value="long" selected>/);
  assert.match(page.view.innerHTML,/data-go="prep-undo"/);
  await go("prep-undo");
  assert.match(page.view.innerHTML,/<option value="reserved" selected>/);
  assert.doesNotMatch(page.view.innerHTML,/data-go="prep-undo"/);
});

test("browser back and forward restore the page without putting private setup data in the URL", () => {
  const page=openPage();
  page.click({go:"quick"});
  page.click({role:"R01"});
  page.click({go:"choose-role"});
  page.input("nickname","小棠");
  assert.match(page.view.innerHTML,/安排这一场/);
  page.back();
  assert.match(page.view.innerHTML,/role-library/);
  assert.match(page.view.innerHTML,/林澈/);
  assert.doesNotMatch(JSON.stringify(page.historyEntries),/小棠|林澈|预算/);
  page.forward();
  assert.match(page.view.innerHTML,/安排这一场/);
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
  assert.notEqual(calls.filter(c=>c.path==="/api/control").at(-1).body.command,"discard");
  await page.click({go:"confirm-reset"});
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
 const page=openPage();await page.click({go:"legacy-journal"});await new Promise(resolve=>setImmediate(resolve));
 assert.doesNotMatch(page.radarHost.innerHTML,/按环节练习/);
 page.element("radar-practice-rule","D04-01");await page.click({radar:"practice-chosen",id:""});
 assert.match(page.radarHost.innerHTML,/独立微练习/);
 for(let i=0;i<3;i++){await page.click({radar:"practice-action",id:String(i)});assert.match(page.radarHost.innerHTML,/TA：/);}
 assert.match(page.radarHost.innerHTML,/3\/3/);assert.match(page.radarHost.innerHTML,/不推断现实中已经改善/);
 await page.click({radar:"practice-close",id:""});assert.doesNotMatch(page.radarHost.innerHTML,/radar-practice-text/);
});

test("standalone practice only advances after confirming, then contrasts a different reply",async()=>{
 const page=openPage();
 await page.click({go:"offline-practice"});
 assert.doesNotMatch(page.view.innerHTML,/十分钟后/);
 page.input("adult",true);
 await page.click({go:"offline-adult"});
 assert.match(page.view.innerHTML,/十分钟后/);
 await page.click({offlineChoice:"pressure"});
 assert.doesNotMatch(page.view.innerHTML,/今天真得走/);
 await page.click({go:"offline-confirm"});
 assert.match(page.view.innerHTML,/今天真得走/);
 await page.click({offlineChoice:"repair"});
 await page.click({go:"offline-confirm"});
 assert.match(page.view.innerHTML,/下次可试/);
 await page.click({go:"offline-restart"});
 assert.match(page.view.innerHTML,/十分钟后/);
});

test('scenario practice remains available until the user enables local saving',async()=>{
 const page=openPage();await page.click({go:'legacy-journal'});await new Promise(resolve=>setImmediate(resolve));
 await page.click({radar:'practice-scenario',id:'natural-close-v1'});
 await page.click({radar:'practice-choice',id:'accept'});
 await page.click({radar:'practice-choice',id:'close-warmly'});
 await page.click({radar:'practice-save',id:''});
 assert.match(page.radarHost.innerHTML,/尚未开启本机跨场保存/);
 assert.match(page.radarHost.innerHTML,/这条路径练到/);
 await page.click({radar:'consent',id:''});
 await page.click({radar:'practice-save',id:''});
 await new Promise(resolve=>setImmediate(resolve));
 assert.match(page.radarHost.innerHTML,/到点了，怎么自然收尾/);
 await page.click({radar:'practice',id:'scenario:natural-close-v1'});
 assert.match(page.radarHost.innerHTML,/十分钟后/);
});

test('preparation entry advances through assumptions and confirmation without removing original experience',()=>{const page=openPage();page.click({go:'prepare'});assert.match(page.view.innerHTML,/准备重点/);page.input('prep.brief','周末第一次见面');page.click({go:'prep-next'});assert.match(page.view.innerHTML,/随机时保留/);page.click({go:'prep-next'});assert.match(page.view.innerHTML,/活动模板/);page.click({go:'prep-next'});assert.match(page.view.innerHTML,/本次预演卡/);assert.match(page.view.innerHTML,/周末第一次见面/);page.input('adult',true);page.click({go:'prep-offline'});assert.equal(page.status.textContent,'');assert.match(page.view.innerHTML,/暂停/);});

test('custom and randomized locked partners enter real perler and tennis scenes and finish',async()=>{for(const template of ['perler','tennis']){const page=openPage();const go=id=>page.click({go:id});await go('prepare');page.input('prep.brief','练习共同活动');await go('prep-next');await page.click({builderGroup:'appearance'});page.input('partner.appearance.hairLength','long');page.input('lock.appearance.hairLength',true);page.input('partner.interaction.expression','reserved');await go('prep-random');assert.match(page.view.innerHTML,/<option value="long" selected>/);page.input('partner.interaction.expression','outgoing');await go('prep-next');page.input('prep.template',template);page.input('prep.place','周末活动店');await go('prep-next');page.input('adult',true);await go('prep-offline');assert.equal(page.status.textContent,'');assert.match(page.view.innerHTML,/暂停/);assert.match(page.view.innerHTML,/周末活动店/);await go('end');assert.match(page.view.innerHTML,/回看|散场|带走/);}});

test('preparation config persists without conversation and can be deleted independently',async()=>{const stored=new Map();const page=openPage({window:{localStorage:{setItem:(k,v)=>stored.set(k,v),getItem:k=>stored.get(k),removeItem:k=>stored.delete(k)}}});await page.click({go:'prepare'});page.input('prep.brief','周末准备');await page.click({go:'prep-save'});const raw=[...stored.values()][0];assert.match(raw,/周末准备/);assert.ok(!/events|transcript|messages/.test(raw));await page.click({go:'prep-exit'});assert.match(page.view.innerHTML,/我快要去约会了/);await page.click({go:'prepare'});await page.click({go:'prep-delete'});assert.equal(stored.size,0);});

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
  assert.match(page.view.innerHTML,/自由聊天需要本地服务/);
  await go("prep-offline");
  assert.match(page.view.innerHTML, /小棠 · 公园公共东门/);
});


test("dynamic short practice sends only confirmed text and opens an evidence report", async()=>{
  const calls=[];let recovered=false;
  const rawConfig={adult:true,scene:"S02",player:"unspecified",presentation:"unspecified",mode:"spark",seed:7};
  const engine=require("../dating-god/assets/engine.js");
  let run=engine.createRun(rawConfig,"R01");
  const page=openPage({window:{location:{protocol:"http:"}},fetch:async(path,request)=>{
    const body=request.body&&JSON.parse(request.body);
    calls.push({path,body});
    const json=(value)=>({ok:true,json:async()=>value});
    if(path==="/api/config")return json({available:true});
    if(path==="/api/session"){run.rehearsalTask=body.task;return json({sessionId:"short",version:0,run,opening:{line:"今天走哪边？",detail:"入口"}});}
    if(path==="/api/turn"){
      run={...run,events:[...run.events,{label:body.text,reply:"好，我想走树荫多的那边。",suggestions:["我们走一会儿？"]}]};
      if(body.text==="我们往左边走一会儿？")throw new Error("response lost");
      return json({sessionId:"short",version:run.events.length,run});
    }
    if(path==="/api/control"&&body.command==="status"){
      recovered=body.requestId===calls.filter(call=>call.path==="/api/turn").at(-1).body.requestId;
      return json({sessionId:"short",version:run.events.length,run,committed:recovered});
    }
    if(path==="/api/control"){run={...run,phase:"ended"};return json({sessionId:"short",version:4,run});}
    if(path==="/api/report")return json({findings:[{dimension:"表达",turn:1,quote:"我想走",partnerQuote:"树荫",observation:"你说出了自己的路线偏好。",alternative:"我想走一段树荫路，你呢？"}]});
    throw Error(path);
  }});
  await page.click({go:"new-practice"});
  await page.click({taskGoal:"想说不同意见"});
  page.input("adult",true);
  await page.click({go:"task-start"});
  assert.match(page.view.innerHTML,/今天走哪边/);
  page.input("utterance","我想走左边。");
  await page.click({go:"send"});
  await page.click({draftIndex:"0"});
  assert.equal(calls.filter(call=>call.path==="/api/turn").length,1);
  page.input("utterance","我们往左边走一会儿？");
  await page.click({go:"send"});
  page.input("utterance","那走到路口就折返。");
  await page.click({go:"send"});
  assert.equal(recovered,true);
  assert.equal(calls.filter(call=>call.path==="/api/turn")[2].body.version,2);
  assert.equal(calls.filter(call=>call.path==="/api/turn")[1].body.text,"我们往左边走一会儿？");
  await page.click({go:"request-end"});
  await page.click({go:"finish-session"});
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(page.view.innerHTML,/你说出了自己的路线偏好/);
  await page.click({go:"open-transcript"});
  assert.match(page.view.innerHTML,/本场完整对话/);
  assert.match(page.view.innerHTML,/我们往左边走一会儿/);
  await page.click({go:"return-transcript"});
  assert.match(page.view.innerHTML,/本场复盘/);
  await page.click({go:"download-evidence"});
  const summary=await page.downloads[0].data.text();
  assert.match(summary,/我想走一段树荫路/);
  assert.doesNotMatch(summary,/我们往左边走一会儿/);
  page.input("includeFull",true);
  await page.click({go:"download-evidence"});
  assert.match(await page.downloads[1].data.text(),/我们往左边走一会儿/);
});

test("short practice and offline fallback share a draft without opening old notes", async () => {
  const page = openPage();
  assert.match(page.view.innerHTML, /复盘长这样/);
  assert.doesNotMatch(page.view.innerHTML, /<details|练习记录|固定示例/);
  await page.click({go:"new-practice"});
  assert.match(page.view.innerHTML, /挑一个你想练的瞬间/);
  page.input("task-context","我想早点回家");
  page.input("adult",true);
  await page.click({go:"task-start"});
  assert.match(page.view.innerHTML, /看收尾演练示例/);
  await page.click({go:"offline-practice"});
  assert.match(page.view.innerHTML, /怎么自然收尾/);
  assert.doesNotMatch(page.view.innerHTML, /radar-host/);
  const choice = page.view.innerHTML.match(/data-offline-choice="([^"]+)"/)[1];
  await page.click({offlineChoice:choice});
  await page.click({go:"offline-confirm"});
  await page.click({go:"offline-return"});
  assert.match(page.view.innerHTML, /我想早点回家/);
});

test("saved reviews have a stable navigation entry and show saved summaries", async () => {
  const row={id:"x",date:"今天",task:{kind:"practice",goal:"表达不同意见"},scene:"S02",summary:"我说出了自己的想法"};
  const page=openPage({window:{localStorage:{getItem:()=>JSON.stringify([row])}}});
  assert.match(page.view.innerHTML, /data-go="saved-reviews"[^>]*>复盘/);
  await page.click({go:"saved-reviews"});
  assert.match(page.view.innerHTML, /我说出了自己的想法/);
  assert.doesNotMatch(page.view.innerHTML, /去练习|我的记录|查看旧版练习笔记/);
});

 test("local preparation remains usable without a model connection", async()=>{
 const page=openPage({window:{location:{protocol:'http:'}},fetch:async()=>({ok:true,json:async()=>({available:false})})});
 await page.click({go:'new-rehearsal'});page.input('adult',true);await page.click({go:'task-custom'});
 assert.match(page.view.innerHTML,/设置本场对象/);
 });
