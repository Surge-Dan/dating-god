(function () {
  const library = typeof module !== "undefined" ? require("./content.js") : window.DatingContent;
  const { roles, scenes, shared, leave, changes, topics, traits, interests } = library;
  const presentations = ["woman", "man", "nonbinary", "any", "unspecified"];
  const sceneById = (id) => scenes.find((scene) => scene.id === id);
  const roleById = (id) => roles.find((role) => role.id === id);
  const sceneModule = () => typeof module !== "undefined" ? require("./preparation-scenes.js") : window.DatingPreparationScenes;
  const partnerModule = () => typeof module !== "undefined" ? require("./partner-model.js") : window.DatingPartnerModel;
  const resolveRole = run => run.roleSnapshot || roleById(run.role);
  const resolveScene = (run,id=run.scene) => run.sceneSnapshot?.id === id ? run.sceneSnapshot : sceneById(id);
  function configuredScene(config) { return config.sceneSpec ? sceneModule().build(config.sceneSpec) : sceneById(config.scene); }
  function runtimeRole(config, scene) {
    if (!config.partnerSpec) return null;
    const partner=partnerModule().build(config.partnerSpec);
    return { id:partner.id, name:partner.name||'预演对象', age:partner.age||25,presentation:partner.presentation||'unspecified',pronoun:'TA',players:presentations,scenes:[scene.id,...scenes.map(x=>x.id)],traits:[],interests:[],bio:'基于用户提供的有限印象进行模拟，不预测真人。',reason:'按本场对象假设预演',goal:'先了解彼此，具体安排共同确认',limit:Math.min(config.timeBudget||90,partner.conditions.remainingMinutes??Infinity),obligation:'处理自己的安排',greeting:'我们先从眼前这件事聊起吧。',story:'你想先从哪件具体的事说起？',listen:'我听着，你可以接着说。',quiet:'可以先安静一会儿。',joke:'这个我听懂了。',turnDown:'今天先不延长了。',stayStyle:'leave',nextStyle:'clarify',next:'另行确认的时间地点',proposal:'时间和地点我们再具体商量。',bye:'今天先到这里，路上小心。',partner };
  }
  function canVisit(run, target) {
    const role=resolveRole(run);
    if(run.partnerSnapshot && target) {
      const no=run.partnerSnapshot.conditions.hardNo;
      if(no.includes('no-second-station')||no.includes('station-offer')||no.includes(target.id)||no.includes('station:'+target.id)||run.partnerState?.refusals?.includes('station:'+target.id))return false;
    }
    if(!target||target.secondStationAllowed===false||!role.scenes.includes(target.id))return false;
    if(run.elapsed+5+(target.duration||15)>(run.limit??role.limit))return false;
    if(run.budget!==null&&run.budget!==undefined&&(run.spent||0)+(target.cost||0)>run.budget)return false;
    if(target.openingHours){
      const [h,m]=resolveScene(run,run.initialScene||run.scene).time.split(':').map(Number);
      const arrival=h*60+m+run.elapsed+5;
      if(arrival<target.openingHours[0]*60||arrival+(target.duration||15)>target.openingHours[1]*60)return false;
    }
    return true;
  }

  function mix(seed, id) {
    return [...id].reduce((value, char) => Math.imul(value ^ char.charCodeAt(0), 16777619), seed) >>> 0;
  }

  function match(config) {
    if (config.adult !== true || !presentations.includes(config.presentation)) return [];
    const scene = configuredScene(config);
    if (!scene) return [];
    if (Number.isFinite(config.budget) && (scene.cost || 0) > config.budget) return [];
    if (Number.isFinite(config.timeBudget) && (scene.duration || 0) > config.timeBudget) return [];
    const custom=runtimeRole(config,scene);
    if(custom) return (scene.cost||0)>(custom.partner.conditions.budget??Infinity)||(scene.duration||0)>(custom.partner.conditions.remainingMinutes??Infinity)?[]:[custom];
    if(config.sceneSpec) return roles.filter(role=>role.age>=18 && (["any","unspecified"].includes(config.presentation)||role.presentation===config.presentation)).map(role=>({...role,scenes:[...role.scenes,scene.id]}));
    const preferences = [...new Set(config.traits || [])].filter((key) => Object.hasOwn(traits, key)).slice(0, 3);
    const seed = config.seed >>> 0;
    const score = (role) =>
      (role.traits.includes(preferences[0]) ? 8 : 0) +
      preferences.slice(1).filter((preference) => role.traits.includes(preference)).length * 2 +
      (Object.hasOwn(interests, config.interest) && role.interests.includes(config.interest) ? 1 : 0);
    return roles.filter((role) =>
      role.age >= 18 && role.scenes.includes(scene.id) && role.players.includes(config.player) &&
      (!config.mode || !role.modes || role.modes.includes(config.mode)) &&
      (config.player !== "man" || role.presentation === "woman") &&
      (config.player !== "woman" || role.presentation === "man") &&
      (["any", "unspecified"].includes(config.presentation) || role.presentation === config.presentation)
    ).sort((a, b) => score(b) - score(a) || mix(seed, a.id) - mix(seed, b.id));
  }

  function opening(run) {
    const role = resolveRole(run);
    const scene = resolveScene(run);
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
    if (scene.greeting || scene.opening) line = scene.greeting || scene.opening;
    return { detail: scene.intro, line };
  }

  function createRun(config, roleId) {
    const role = match(config).find((item) => item.id === roleId);
    if (!role) throw new Error("This match does not meet the current configuration.");
    const scene = configuredScene(config);
    if(role.partner){config={...config,timeBudget:Math.min(config.timeBudget??Infinity,role.partner.conditions.remainingMinutes??Infinity),budget:Math.min(config.budget??Infinity,role.partner.conditions.budget??Infinity)};if(!Number.isFinite(config.timeBudget))config.timeBudget=90;if(!Number.isFinite(config.budget))config.budget=null;}
    const pick = (key, allowed, fallback) => allowed.includes(config[key]) ? config[key] : fallback;
    return {
      ...(config.partnerSpec || config.sceneSpec ? {schemaVersion:1,roleSnapshot:JSON.parse(JSON.stringify(role)),sceneSnapshot:JSON.parse(JSON.stringify(scene)),partnerSnapshot:role.partner||null,partnerState:role.partner?partnerModule().createState(config.seed||1):null,preparation:JSON.parse(JSON.stringify(config.preparation||{}))} : {}),
      runId: globalThis.crypto?.randomUUID?.() || `run-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      mode: pick('mode', ['mellow','spark','tension','hard'], 'mellow'),
      stage: pick('stage', ['first','second','friends','flirting','steady'], 'first'),
      intent: pick('intent', ['casual','serious','undecided'], 'undecided'),
      exclusivity: pick('exclusivity', ['unspecified','exclusive','open'], 'unspecified'),
      timeBudget: Number.isFinite(config.timeBudget) ? config.timeBudget : null,
      limit: Math.min(Number.isFinite(config.timeBudget) ? config.timeBudget : Infinity, Math.max(role.limit, (scene.duration || 0) + 10)),
      budget: Number.isFinite(config.budget) ? config.budget : null, spent: scene.cost || 0,
      diet: String(config.diet || '').slice(0,160), experience: config.experience === 'familiar' ? 'familiar' : 'novice', alcohol: config.alcohol === true,
      activityState: { ...(scene.initialState || {}) }, stations: [scene.id], initialScene: scene.id, pendingStation: null,
      role: role.id, scene: scene.id, phase: "live", node: "start", elapsed: 0, location: scene.place,
      avoid: [...new Set(config.avoid || [])].filter((key) => Object.hasOwn(topics, key)),
      surprise: config.surprise === true, usedChanges: [], closed: [], agreement: null,
      proposal: null, outcome: null, events: [], branchFrom: null,
    };
  }

  function choices(run) {
    if (run.phase !== "live") return [];
    const scene = resolveScene(run);
    const role = resolveRole(run);
    if (run.pendingStation) {
      const target=resolveScene(run,run.pendingStation);
      const feasible=canVisit(run,target);
      return [...(feasible?[{id:'station-confirm',label:'确认一起去第二站',type:'station-confirm'}]:[]),
        {id:'station-cancel',label:feasible?'先不换地方':'剩余安排已不够，撤回第二站',type:'station-cancel'},leave];
    }
    const options = scene.nodes[run.node] || shared[run.node] || [];
    const filtered = options.filter((item) =>
      (!item.scene || item.scene === scene.id) && !run.closed.includes(item.id) &&
      !(item.id === "linger" && run.closed.includes("stay")) &&
      (!item.requires || Object.entries(item.requires).every(([key,value]) => run.activityState?.[key] === value)) &&
      (run.budget === null || run.budget === undefined || (run.spent || 0) + (item.cost || 0) <= run.budget) &&
      !(item.tags || []).some((tag) => run.avoid.includes(tag))
    );
    if (run.node === "decision" && role.stayStyle === "offer-walk" &&
        run.elapsed + 5 <= (run.limit ?? role.limit) && run.closed.includes("stay")) {
      filtered.push({ id: "stroll", label: "接受五分钟的短走", type: "stroll" });
    }
    if (run.node === "timing") {
      filtered.push({ id: "weekend", label: "周末可以，听听对方的安排", type: "weekend" });
    }
    if (run.events.length >= 2 && (run.stations?.length || 1) < 2 && !run.proposal && !run.closed.includes('stay') && !run.closed.includes('station-offer')) {
      for (const next of scenes) if (next.id !== run.scene && canVisit(run,next)) {
        filtered.push({id:`station:${next.id}`,label:`提议去第二站：${next.name}`,type:'station',station:next.id});
      }
    }
    if (!run.closed.includes('snap-photo') && !run.avoid.includes('photos')) {
      filtered.push({ id: 'snap-photo', label: '想抓拍TA此刻的样子', type: 'photo-attempt', requiresConsent: true, tags: ['photos'] });
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
    const role = resolveRole(run);
    const scene = resolveScene(run);
    if(run.partnerSnapshot && action.type!=='leave') {
      const target=action.station ? sceneById(action.station) : null;
      const context={proposalId:action.id,consentRequired:!!action.requiresConsent,consentGranted:false,remainingMinutes:(run.limit??role.limit)-run.elapsed,durationMinutes:target?5+(target.duration||15):action.minutes||0,availableBudget:run.budget===null?null:run.budget-run.spent,cost:target?.cost||action.cost||0};
      const model=partnerModule(), distribution=model.distribution(run.partnerSnapshot,context,run.partnerState);
      if(distribution.blocked.length) {
        const decision=model.decide(run.partnerSnapshot,context,run.partnerState,`${run.runId}:${run.branchFrom}:${run.events.length}`);
        const reply=decision.strategy==='refuse'?'这个安排我不答应。我们换个可行的，也可以先结束。':'这件事还没有获得同意，先确认清楚再说。';
        const before=snapshot(run);
        return {...run,partnerState:decision.state,partnerDecision:{strategy:decision.strategy,distribution},closed:[...run.closed,action.id,...(action.type==='station'?['station-offer']:[])],events:[...run.events,{eventId:`${run.runId}:blocked-${run.events.length}`,action:action.id,label:action.label,reply,detail:'没有执行动作，也没有改变地点或支出。',effect:'对象本次约束阻止了提议',executionStatus:'blocked',radarFacts:{consent:false},tags:action.tags||[],before}]};
      }
    }
    const privateSchedule = run.avoid.includes("work");
    const reason = privateSchedule ? "处理自己的安排" : role.obligation;
    const next = { ...run, node: action.to || run.node };
    const eventId = `${run.runId}:branch-${run.branchFrom ?? 'original'}:event-${run.events.length}`;
    if (action.type === 'photo-attempt') {
      next.closed = [...run.closed, action.id];
      next.events = [...run.events, {
        eventId, canonicalEventId: eventId, action: id, actionType: 'photo',
        label: action.label, reply: '先别拍，我今天不想被拍。我们继续聊吧。',
        detail: '拍摄请求被阻止，没有拍到照片。', effect: '尝试被阻止，拍摄未执行',
        executionStatus: 'blocked', radarFacts: { consent: false },
        tags: ['photos'], before: snapshot(run),
      }];
      return next;
    }
    if (action.type === 'station' || action.type === 'station-confirm' || action.type === 'station-cancel') {
      let reply,detail='';
      if(action.type === 'station') { next.pendingStation=action.station;next.closed=[...run.closed,'station-offer'];reply=`可以，我还有时间。一起去${sceneById(action.station).name}？你确定的话我们再出发。`; }
      else if(action.type === 'station-cancel') {next.pendingStation=null;reply='好，先在这儿待着。';}
      else { const target=resolveScene(run,run.pendingStation);if(!target)return run;next.scene=target.id;next.location=target.place;next.node='start';next.activityState={...(target.initialState||{})};next.stations=[...(run.stations||[run.scene]),target.id];next.elapsed=run.elapsed+5;next.spent=(run.spent||0)+(target.cost||0);next.pendingStation=null;reply='走吧，那我们一起过去。';detail=target.intro; }
      next.events=[...run.events,{eventId,canonicalEventId:eventId,action:id,label:action.label,reply,detail,effect:action.type==='station-confirm'?'双方确认第二站并抵达':'第二站尚待双方确认',tags:[],before:snapshot(run)}];return next;
    }
    next.activityState={...(run.activityState||{}),...(action.patch||{})};
    next.spent=(run.spent||0)+(action.cost||0);
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
      const canWalk = role.stayStyle === "offer-walk" && run.elapsed + 5 <= (run.limit ?? role.limit);
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
    next.elapsed = Math.min(run.elapsed + elapsed, run.limit ?? role.limit);
    if (next.phase === "live" && next.elapsed >= (run.limit ?? role.limit)) {
      detail = [detail, `对方看了一眼时间，拿起随身的东西，准备${reason}。`].filter(Boolean).join(" ");
      next.phase = "ended";
      next.proposal = null;
      next.outcome = "见面时间到了，双方各自离开。";
    }
    if(run.partnerSnapshot) {
      const model=partnerModule();
      const context={proposalId:action.id,remainingMinutes:(run.limit??role.limit)-run.elapsed,availableBudget:run.budget===null?null:run.budget-run.spent,cost:action.cost||0,consentRequired:!!action.requiresConsent,consentGranted:false,ending:next.phase==='ended',topicRelevant:true};
      const decision=model.decide(run.partnerSnapshot,context,run.partnerState,eventId);
      const micro=model.microAction(run.partnerSnapshot,{activity:scene.activityId,waterAvailable:run.activityState.waterAvailable===true,resting:run.node==='rest',hasSchedule:true,nearEnding:context.remainingMinutes<10},decision.state);
      next.partnerState=micro.state;next.partnerDecision={strategy:decision.strategy,distribution:decision.distribution,microAction:micro.action};
      const lines={brief:'好，先按这一步来。',elaborate:'我想先把眼前这一步做好，再看看接下来怎么安排。',ask:'这一步你想自己试，还是一起商量？',clarify:'先确认一下，你具体想怎么做？',disagree:'这一步我有不同的想法，我们先各说说。',propose:'可以先各自试一下，需要帮忙再开口。',refuse:'这个安排我先不答应，我们换个可行的。',end:'时间到了，今天就到这里吧。'};
      if(!['leave','stay','stroll','invite','weekend','confirm','linger'].includes(action.type))reply=lines[decision.strategy];
      const details={'tie-hair':'TA拿出已有的发圈，把披着的长发扎起。','roll-sleeves':'TA把适合制作的袖口卷起。','adjust-glasses':'TA调整了一下眼镜。','drink-water':'TA拿起现场已有的水喝了一口。','check-time':'TA确认了一下时间。'};
      if(micro.action)detail=[detail,details[micro.action]].filter(Boolean).join(' ');
    }
    const event = {
      eventId, canonicalEventId: eventId,
      ...(action.requiresConsent ? { executionStatus: 'requested', radarFacts: { requiresConsent: true } } : {}),
      action: id, label: action.label, reply, detail, effect, tags: action.tags || [],
      before: snapshot(run),
    };
    next.events = [...run.events, event];
    return next;
  }

  function replay(original, index) {
    if (original.phase !== "ended" || original.branchFrom !== null ||
        !Number.isInteger(index) || index < 0 || !original.events[index]) return null;
    const before=original.events[index].before;
    const order=['mellow','spark','tension','hard'];
    const mode=order[Math.min(order.indexOf(before.mode||'mellow'),order.indexOf(original.mode||'mellow'))];
    return { ...before, mode, events: original.events.slice(0, index), branchFrom: index };
  }

  function setMode(run, mode) {
    const order=['mellow','spark','tension','hard'];
    if(!order.includes(mode)||order.indexOf(mode)>order.indexOf(run.mode||'mellow'))return run;
    return {...run,mode};
  }
  const engine = { canVisit, resolveRole, resolveScene, match, createRun, opening, roleById, sceneById, choices, act, pause, resume, end, replay, setMode };
  if (typeof module !== "undefined") module.exports = engine;
  else window.DatingEngine = engine;
})();
