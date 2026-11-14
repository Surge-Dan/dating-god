(function () {
  const library = typeof module !== "undefined" ? require("./content.js") : window.DatingContent;
  const { roles, scenes, shared, leave, changes, topics, traits, interests } = library;
  const presentations = ["woman", "man", "nonbinary", "any", "unspecified"];
  const sceneById = (id) => scenes.find((scene) => scene.id === id);
  const roleById = (id) => roles.find((role) => role.id === id);

  function mix(seed, id) {
    return [...id].reduce((value, char) => Math.imul(value ^ char.charCodeAt(0), 16777619), seed) >>> 0;
  }

  function match(config) {
    if (config.adult !== true || !presentations.includes(config.presentation)) return [];
    const scene = sceneById(config.scene);
    if (!scene) return [];
    const preferences = [...new Set(config.traits || [])].filter((key) => Object.hasOwn(traits, key)).slice(0, 3);
    const seed = config.seed >>> 0;
    const score = (role) =>
      (role.traits.includes(preferences[0]) ? 8 : 0) +
      preferences.slice(1).filter((preference) => role.traits.includes(preference)).length * 2 +
      (Object.hasOwn(interests, config.interest) && role.interests.includes(config.interest) ? 1 : 0);
    return roles.filter((role) =>
      role.age >= 18 && role.scenes.includes(scene.id) && role.players.includes(config.player) &&
      (config.player !== "man" || role.presentation === "woman") &&
      (config.player !== "woman" || role.presentation === "man") &&
      (["any", "unspecified"].includes(config.presentation) || role.presentation === config.presentation)
    ).sort((a, b) => score(b) - score(a) || mix(seed, a.id) - mix(seed, b.id));
  }

  function opening(run) {
    const role = roleById(run.role);
    const scene = sceneById(run.scene);
    let line = role.greeting;
    if (scene.id === "S07" && role.id !== "R08") {
      line = role.traits.includes("curious")
        ? "你想把它做成能用的杯子，还是先看看这团泥自己会长成什么？"
        : "我先把桌面腾一块出来。你想各做各的，还是遇到麻烦了互相扶一下？";
    } else if (scene.id === "S02" && role.id === "R03") {
      line = "这两张号到现在都没往前动。要不先翻几本书，或者出去认认路？";
    } else if (scene.id === "S05" && role.id === "R03") {
      line = "原来两个人点菜不用开群投票。你想先吃什么？";
    }
    return { detail: scene.intro, line };
  }

  function createRun(config, roleId) {
    const role = match(config).find((item) => item.id === roleId);
    if (!role) throw new Error("This match does not meet the current configuration.");
    const scene = sceneById(config.scene);
    return {
      role: role.id, scene: scene.id, phase: "live", node: "start", elapsed: 0, location: scene.place,
      avoid: [...new Set(config.avoid || [])].filter((key) => Object.hasOwn(topics, key)),
      surprise: config.surprise === true, usedChanges: [], closed: [], agreement: null,
      proposal: null, outcome: null, events: [], branchFrom: null,
    };
  }

  function choices(run) {
    if (run.phase !== "live") return [];
    const scene = sceneById(run.scene);
    const role = roleById(run.role);
    const options = scene.nodes[run.node] || shared[run.node] || [];
    const filtered = options.filter((item) =>
      (!item.scene || item.scene === scene.id) && !run.closed.includes(item.id) &&
      !(item.id === "linger" && run.closed.includes("stay")) &&
      !(item.tags || []).some((tag) => run.avoid.includes(tag))
    );
    if (run.node === "decision" && role.stayStyle === "offer-walk" &&
        run.elapsed + 5 <= role.limit && run.closed.includes("stay")) {
      filtered.push({ id: "stroll", label: "接受五分钟的短走", type: "stroll" });
    }
    if (run.node === "timing") {
      filtered.push({ id: "weekend", label: "周末可以，听听对方的安排", type: "weekend" });
    }
    return [...filtered, leave];
  }

  function pause(run) {
    return run.phase === "live" ? { ...run, phase: "paused" } : run;
  }

  function resume(run) {
    return run.phase === "paused" ? { ...run, phase: "live" } : run;
  }

  function end(run) {
    return run.phase === "ended" ? run : {
      ...run, phase: "ended", outcome: "你选择提前散场。", proposal: null,
    };
  }

  function snapshot(run) {
    const { events, ...state } = run;
    return state;
  }

  function act(run, id, expectedTurn) {
    if (expectedTurn !== run.events.length) return run;
    const action = choices(run).find((item) => item.id === id);
    if (!action) return run;
    const role = roleById(run.role);
    const scene = sceneById(run.scene);
    const privateSchedule = run.avoid.includes("work");
    const reason = privateSchedule ? "处理自己的安排" : role.obligation;
    const next = { ...run, node: action.to || run.node };
    const change = changes[action.change];
    const showChange = change && !run.usedChanges.includes(action.change) && (!change.surprise || run.surprise);
    let reply = action.voice ? role[action.voice] : action.reply;
    if (privateSchedule && action.voice === "quiet") reply = "可以先安静一会儿。有想说的再开口。";
    let detail = "";
    let elapsed = action.minutes || 4;
    let effect = "互动继续";

    if (action.location) next.location = action.location;
    if (showChange) {
      next.usedChanges = [...run.usedChanges, action.change];
      next.location = change.location || next.location;
      detail = change.text;
    }
    if (next.location !== run.location) effect = `地点变为${next.location}`;

    if (action.type === "leave") {
      reply = run.events.length && !privateSchedule ? role.bye : "好。那今天就到这儿，你路上小心。";
      next.phase = "ended";
      next.proposal = null;
      next.outcome = "各自离开，未约定再次见面。";
      effect = "本场散场";
      elapsed = 0;
    } else if (action.type === "stay") {
      const canWalk = role.stayStyle === "offer-walk" && run.elapsed + 5 <= role.limit;
      const leavesNow = role.stayStyle === "leave";
      const discreetReply = leavesNow ? "今天就到这儿吧，我还有自己的安排。" : "今天不再延长了，我后面还有安排。";
      reply = canWalk
        ? `更晚我得${reason}。我可以陪你再走五分钟，你愿意吗？`
        : (privateSchedule ? discreetReply : role.turnDown);
      next.closed = [...run.closed, "stay"];
      effect = canWalk ? "角色提出五分钟短走，等你决定" : "角色拒绝今天延长约会";
      if (leavesNow) {
        next.phase = "ended";
        next.outcome = "角色有自己的离场安排，双方在这里道别。";
      }
      elapsed = 0;
    } else if (action.type === "stroll") {
      reply = "那一起走到路口。到那儿我就往另一边走了。";
      detail = "五分钟后，你们在路口道别。";
      next.location = "场地附近的公共路口";
      next.phase = "ended";
      next.outcome = "双方一起走到路口，然后各自离开。";
      effect = "双方同意走五分钟，在路口告别";
      elapsed = 5;
    } else if (action.type === "invite") {
      const contextSensitive = scene.id === "S05" && role.nextStyle === "check-context";
      const pausesNextMeeting = contextSensitive &&
        run.events.some((item) => item.action === "keep-light");
      if (pausesNextMeeting) {
        reply = "这周先不约了。我想让今天这顿先放一放。";
        next.closed = [...run.closed, "ask-again"];
        effect = "角色暂不约下次";
      } else if (role.nextStyle === "clarify" || contextSensitive) {
        reply = "我想先问清楚一点。你说再见，是这周末也愿意留出一点时间吗？";
        next.node = "timing";
        effect = "角色询问可行日期，双方尚未约定";
      } else {
        reply = role.proposal;
        next.node = "proposal";
        next.proposal = role.next;
        effect = "角色提出时间地点，等你确认";
      }
      elapsed = 0;
    } else if (action.type === "weekend") {
      reply = role.proposal;
      next.node = "proposal";
      next.proposal = role.next;
      effect = "角色提出时间地点，等你确认";
      elapsed = 0;
    } else if (action.type === "confirm") {
      reply = `好，那就${run.proposal}见。我得${reason}了。`;
      next.agreement = run.proposal;
      next.proposal = null;
      next.phase = "ended";
      next.outcome = "双方确认了下一次见面的时间和地点。";
      effect = "双方确认了具体安排";
      elapsed = 0;
    } else if (action.type === "linger") {
      reply = "刚好还有一点时间，我们先慢慢待会儿。";
      next.closed = [...run.closed, "linger"];
      effect = "继续相处了一会儿";
    }

    if (action.tags?.includes("relationship") && action.id === "define") {
      effect = "角色表达了看法，后续关系仍待双方商量";
    }
    next.elapsed = Math.min(run.elapsed + elapsed, role.limit);
    if (next.phase === "live" && next.elapsed >= role.limit) {
      detail = [detail, `对方看了一眼时间，拿起随身的东西，准备${reason}。`].filter(Boolean).join(" ");
      next.phase = "ended";
      next.proposal = null;
      next.outcome = "见面时间到了，双方各自离开。";
    }
    const event = {
      action: id, label: action.label, reply, detail, effect, tags: action.tags || [],
      before: snapshot(run),
    };
    next.events = [...run.events, event];
    return next;
  }

  function replay(original, index) {
    if (original.phase !== "ended" || original.branchFrom !== null ||
        !Number.isInteger(index) || index < 0 || !original.events[index]) return null;
    return { ...original.events[index].before, events: original.events.slice(0, index), branchFrom: index };
  }

  const engine = { match, createRun, opening, roleById, sceneById, choices, act, pause, resume, end, replay };
  if (typeof module !== "undefined") module.exports = engine;
  else window.DatingEngine = engine;
})();
