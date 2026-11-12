(function () {
  const engine = typeof module !== "undefined" ? require("./engine.js") : window.DatingEngine;
  const escape = (value = "") => String(value).replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

  const reflections = {
    wait: ["我在意的是对方愿意一起选个舒服的地方。", "说出一个座位偏好，看看对方怎样给出自己的选择。"],
    walk: ["我喜欢可以临时调整安排的相处。", "有更舒服的备选时提一个，留意对方是否也有表达空间。"],
    stay: ["我愿意听到对方把自己的时间安排说清楚。", "想多待一会儿时先问对方还有多久，留意自己听到不同答案的感受。"],
    "ask-again": ["我想知道对方愿意怎么安排下次见面。", "邀约时给一个可选时间，观察对方能否提出自己的时间。"],
    confirm: ["把时间和地点说明白，会让我更自在。", "下次见面前复述双方都同意的安排，观察有哪些细节仍要确认。"],
    repair: ["我喜欢有人和我一起把眼前的小事做完。", "下次一起做事时先分一个小步骤，留意你们是怎么互相接手的。"],
    "keep-cup": ["我喜欢出一点小错也能笑过去。", "遇到小失误时说说你想留着还是重来，看看对方怎样接这句话。"],
    define: ["我喜欢可以先说各自的想法，再决定要不要往前。", "谈关系时先说自己的理解，再听听对方用什么词形容它。"],
    "keep-light": ["我在意的是相处里能有一点空白。", "下次有短暂停顿时先不急着填满，留意自己是在放松还是在回避。"],
    leave: ["我希望可以在自己想走的时候自在道别。", "下次时间到了就说清你要走，观察对方是否尊重这个决定。"],
  };
  const fallback = ["我喜欢自己的话被对方接住。", "下次说一件具体的小事，留意对方是怎样回应和追问的。"];
  const choices = (run, index) => run.events[index] ? (reflections[run.events[index].action] || fallback) : null;
  const privateText = /(?:https?:\/\/|\bwww\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\+?\d[\d\s-]{6,}\d|微信号|手机号|详细地址|身份证)/i;

  function claim(run, draft, branch) {
    const value = String(draft.accepted || "").trim();
    if (draft.confirmed !== true || !value || value.length > 96) return "";
    if (!choices(run, draft.selected) && !draft.note?.trim()) return "";
    if (privateText.test(value) || value.includes(engine.roleById(run.role).name)) return "";
    if (draft.nickname?.trim() && value.includes(draft.nickname.trim())) return "";
    const unquote = (text) => text.replace(/[「」“”"'。！!？?]+/g, "");
    const spoken = [...run.events, ...(branch?.events || [])].map((event) => unquote(event.reply || ""));
    if (spoken.some((reply) => reply.length > 5 && unquote(value).includes(reply))) return "";
    return value;
  }

  function experiment(run, draft, branch) {
    return draft.note?.trim() || claim(run, draft, branch) ? choices(run, draft.selected)?.[1] : null;
  }

  function timeline(events) {
    return events.map((event) => `<li>
      <p><b>你选择了</b> ${escape(event.label)}</p>
      ${event.reply ? `<blockquote>${escape(event.reply)}</blockquote>` : ""}
      ${event.detail ? `<p>${escape(event.detail)}</p>` : ""}
      <small>${escape(event.effect)}</small></li>`).join("");
  }

  function html(run, branch, draft = {}) {
    const scene = engine.sceneById(run.scene);
    const selected = run.events[draft.selected];
    const reflection = claim(run, draft, branch);
    const nextExperiment = experiment(run, draft, branch);
    const note = draft.includeNote === true && draft.note?.trim() ? draft.note.trim().slice(0, 600) : "";
    const expectation = draft.includeExpectation === true && draft.expectation?.trim() ? draft.expectation.trim().slice(0, 320) : "";
    const replay = branch?.phase === "ended" ? branch.events.slice(branch.branchFrom) : null;
    return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>散场之后 · ${escape(scene.name)}</title><style>
:root{color:#39262c;background:#f7efe1;font:16px/1.75 system-ui,sans-serif}
body{margin:auto;max-width:760px;padding:3rem clamp(1rem,5vw,3rem);overflow-wrap:anywhere}
h1,h2{font-family:"Noto Serif SC","Songti SC",SimSun,serif;color:#671f35}h1{font-size:clamp(2.5rem,10vw,5rem);line-height:1.1;margin:.3em 0}
section{border-top:1px solid #c8aea4;padding:1em 0}small{color:#6c4d56}li{padding:.3em 0}
blockquote{margin:.5em 0;padding-left:.8em;border-left:2px solid #a05764}p{white-space:pre-wrap}
@media print{body{padding:0}li,blockquote{break-inside:avoid}}
</style></head><body><header><small>见面之后 / 一次虚构成年约会的回看</small><h1>散场之后</h1>
<p>${escape(scene.name)} · ${escape(run.outcome || "本场片段")}</p></header>
${expectation ? `<section><h2>赴约前的期待</h2><p>${escape(expectation)}</p></section>` : ""}
${selected ? `<section><h2>选中的一刻</h2><ul>${timeline([selected])}</ul></section>` : ""}
<section><h2>现场记录</h2>${run.events.length ? `<ol>${timeline(run.events)}</ol>` : "<p>没有可引用的互动。可以留一个自问：我原本想体验怎样的见面？</p>"}</section>
${replay ? `<section><h2>实际重演</h2><p>从原场第 ${branch.branchFrom + 1} 回合前开始。</p>${replay.length ? `<ol>${timeline(replay)}</ol>` : ""}<p>${escape(branch.outcome)}</p></section>` : ""}
${note ? `<section><h2>你选择写入的私人便笺</h2><p>${escape(note)}</p></section>` : ""}
<section><h2>带走的一点发现</h2><p>${escape(reflection || (selected ? "这一刻，你在意的是对方给的答案，还是你可以自在地说出自己的选择？" : "如果再试一次，你想先留意什么？"))}</p>
${nextExperiment ? `<h2>下次可试的小动作</h2><p>${escape(nextExperiment)}</p>` : ""}</section>
</body></html>`;
  }

  function card(run, draft = {}, branch) {
    const value = claim(run, draft, branch);
    if (!value) return null;
    const wrap = (text, width) => {
      const letters = [...text];
      const lines = [];
      for (let offset = 0; offset < letters.length; offset += width) {
        lines.push(letters.slice(offset, offset + width).join(""));
      }
      return lines;
    };
    const note = draft.includeExperiment === true ? choices(run, draft.selected)?.[1] : null;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
<title>个人 Dating 卡</title><rect width="800" height="1000" fill="#f7efe1"/>
<rect x="44" y="44" width="712" height="912" fill="none" stroke="#671f35" stroke-width="2"/>
<path d="M84 230H716M84 750H716" stroke="#c8aea4"/>
<text x="86" y="112" font-size="23" fill="#671f35" font-family="sans-serif" letter-spacing="3">见面之后 · DATING NOTE</text>
<text x="86" y="186" font-size="36" fill="#671f35" font-family="serif">一次虚构约会后的发现</text>
<text font-size="39" fill="#39262c" font-family="serif">${wrap(value, 16).map((line, index) => `<tspan x="86" y="${323 + 60 * index}">${escape(line)}</tspan>`).join("")}</text>
${note ? `<text font-size="22" fill="#671f35" font-family="sans-serif">${wrap(note, 26).map((line, index) => `<tspan x="86" y="${806 + 34 * index}">${escape(line)}</tspan>`).join("")}</text>` : ""}
</svg>`;
  }

  const report = { choices, claim, experiment, html, card };
  if (typeof module !== "undefined") module.exports = report;
  else window.DatingReport = report;
})();
