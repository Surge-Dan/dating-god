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
  const focusable = { focus() {} };
  const art = {};
  const view = {
    innerHTML: "",
    addEventListener: (name, handler) => { events[name] = handler; },
    querySelector: () => focusable,
  };
  const status = { textContent: "" };
  const document = {
    getElementById: (id) => ({ app: view, status, "card-art": view.innerHTML.includes('id="card-art"') ? art : null })[id],
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
    view, status, downloads,
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

test("model entry is explicit and file mode never falls back to scripted dialogue", async () => {
  const page = openPage();
  assert.match(page.view.innerHTML, /模型自由互动/);
  assert.match(page.view.innerHTML, /离线体验/);
  await page.click({go:"start-model"});
  assert.match(page.status.textContent, /本地服务/);
  assert.match(page.view.innerHTML, /模型自由互动/);
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
