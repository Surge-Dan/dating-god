const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { runInNewContext } = require("node:vm");
const { webcrypto } = require("node:crypto");
const assert = require("node:assert/strict");
const test = require("node:test");

// Exercise the page's real handlers without launching a browser.
function openPage() {
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
  const context = { window: {}, document, crypto: webcrypto, URL, Blob, setTimeout: () => {} };
  const dir = resolve(__dirname, "../dating-simulator/assets");
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
