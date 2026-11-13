(function () {
  const topics = {
    ex: "前任", intimacy: "亲密话题", appearance: "外貌评价",
    photos: "拍照", work: "工作", relationship: "定义关系",
  };

  const traits = {
    direct: "有主见", space: "给彼此空间", curious: "愿意回问",
    humor: "会接梗", steady: "说到做到", warm: "慢慢熟悉",
  };

  const interests = { books: "旧书", walking: "散步", craft: "手作", food: "吃点好的", shows: "看展" };
  const openTo = ["woman", "man", "nonbinary", "unspecified"];

  const roles = [
    {
      id: "R01", name: "林澈", age: 29, presentation: "woman", pronoun: "她", players: openTo,
      scenes: ["S02", "S07"], traits: ["direct", "space", "steady"], interests: ["books", "walking"],
      bio: "逛旧书店不看推荐架。挑路线前会说自己想往哪边走。",
      reason: "会先给出自己的选项，也可以一起安静走一段。",
      goal: "想认识能各自表达的人", limit: 40, obligation: "去取修好的相机",
      greeting: "窗边满了。我想出去走十分钟，你呢？",
      story: "我上回取相机走错了，从后巷出来才看到那扇绿门。以前是个裁缝铺。",
      listen: "我也喜欢临时改主意。有些小店就是这么碰见的。",
      quiet: "可以先不聊。看到什么想说的再说。",
      joke: "这段路我走错过三次。按次数算，我熟。",
      turnDown: "晚一点我就不一起了。我还得去取相机。",
      next: "周六三点半，二手书店门口",
      proposal: "下次倒可以。周六三点半，二手书店门口见？",
      bye: "我先往车站那边走。今天聊得挺舒服的。",
    },
    {
      id: "R03", name: "任榆", age: 27, presentation: "nonbinary", pronoun: "TA", players: openTo,
      scenes: ["S02", "S05", "S07"], traits: ["curious", "humor", "direct"], interests: ["shows", "craft"],
      bio: "常去帮朋友布展，总想看看两个人一起做一件小事是什么样。",
      reason: "喜欢把问题抛回来，也会顺着你眼前在做的事接梗。",
      goal: "想看看一起做事时合不合拍", limit: 50, obligation: "去给朋友送回布展工具",
      stayStyle: "offer-walk",
      greeting: "你想先看一圈，还是直接挑个地方坐？我都行，但饿了我会先点吃的。",
      story: "上次挂画，朋友让我拿远一点。后来发现我们说的是两幅不同的画。",
      listen: "等等，那后来你选了哪个？我有点好奇你会怎么收尾。",
      quiet: "要不先各自看看？遇见什么奇怪的东西再互相叫一声。",
      joke: "这要是艺术装置，我愿意把标题写成《勉强撑住》。",
      turnDown: "再久就有点赶了。我还得把工具给朋友送过去。",
      next: "周日下午两点，街区展览入口",
      proposal: "周日下午我想去看那个小展。两点在入口碰头，你来吗？",
      bye: "我得去送工具了。今天有几句我回去还会笑。",
    },
    {
      id: "R04", name: "邱岩", age: 34, presentation: "man", pronoun: "他", players: openTo,
      scenes: ["S02", "S07"], traits: ["steady", "direct", "warm"], interests: ["walking", "craft"],
      bio: "周末打社区球赛。愿意先听完，再给一个具体的时间或办法。",
      reason: "习惯把安排说具体，碰到不同意见会找一个能做的选项。",
      goal: "想认真认识，也重视已经答应别人的事", limit: 45, obligation: "赶社区球赛前的集合",
      stayStyle: "offer-walk",
      greeting: "等位大概要十分钟。你愿意等的话我去拿水，我也可以跟你出去转一圈。",
      story: "上回下雨，球场换到一个小学。打完我才发现篮筐比平时矮半截。",
      listen: "听懂了。换成我也会先试那一个，你当时是怎么定下来的？",
      quiet: "可以歇会儿。我去给你倒杯水，你慢慢看。",
      joke: "好消息是已经歪得很统一了。",
      turnDown: "今天再往后我就来不及集合了。我得按原来的时间走。",
      next: "周日上午十一点，书店咖啡门口",
      proposal: "周日十一点我有空。书店咖啡门口见，你看行吗？",
      bye: "我得去集合。你也慢慢来，路上小心。",
    },
    {
      id: "R06", name: "顾宁", age: 36, presentation: "woman", pronoun: "她", players: openTo,
      scenes: ["S02"], traits: ["space", "warm", "curious"], interests: ["shows", "books"],
      bio: "能在一幅画前站很久。比起赶景点，更愿意留点空白。",
      reason: "会留出沉默的空间，注意到细节后才慢慢开口。",
      goal: "想遇到能一起看东西也能安静待着的人", limit: 38, obligation: "搭回程的车",
      nextStyle: "clarify",
      greeting: "我刚在门口看了眼书架。你喜欢靠窗，还是想找个安静角落？",
      story: "我在旧书夹页里捡过一张没寄出去的明信片，后来又原样夹回去了。",
      listen: "临时换个计划，有时反倒能注意到原来忽略的东西。",
      quiet: "好。我也想再看一眼这边，待会儿汇合。",
      joke: "我可以晚三秒才笑吗？我刚想明白。",
      turnDown: "今晚不再换地方了。我还得坐挺久的车回去。",
      next: "周日下午三点，书店门口",
      proposal: "如果你也想看那排旧杂志，周日三点我可以来一次。",
      bye: "我先走了。今天这样慢慢聊一会儿，挺难得的。",
    },
    {
      id: "R07", name: "夏译", age: 30, presentation: "nonbinary", pronoun: "TA", players: openTo,
      scenes: ["S05", "S07"], traits: ["warm", "space", "steady"], interests: ["food", "shows"],
      bio: "背着排练谱子来赴约。会让话题缓一缓，想清楚再接回去。",
      reason: "会接住停顿，有分歧时愿意把节奏留给彼此。",
      goal: "想和熟悉的人相处得更自在", limit: 46, obligation: "回排练场",
      stayStyle: "leave", nextStyle: "check-context",
      greeting: "以前我们一群人来，可听不清对面说什么。今天能先慢慢点菜了。",
      story: "今天排练有个人忘了带谱，前半小时全靠我用手比划。",
      listen: "嗯。你刚讲到那一段的时候，声音一下就轻了。我在听。",
      quiet: "可以等一下。我正好把谱子收一收。",
      joke: "这一段能重排吗？刚才那个表情我没忍住。",
      turnDown: "今天到这吧，排练还等着我。刚才说的话可以先放一放。",
      next: "周日下午四点，河边长椅",
      proposal: "如果还想聊，周日四点河边长椅那儿？这回不用赶排练。",
      bye: "我先回排练了。今天说到的就留在今天吧。",
    },
    {
      id: "R08", name: "陈诺", age: 25, presentation: "man", pronoun: "他", players: openTo,
      scenes: ["S07"], traits: ["warm", "humor", "curious"], interests: ["craft", "food"],
      bio: "第一次主动约人做陶艺。觉得手上有活时更好开口。",
      reason: "会用手上的小事化解尴尬，也会问你想怎么做。",
      goal: "想看看一起做陶艺会不会比干聊轻松", limit: 42, obligation: "去把借来的工具还掉",
      stayStyle: "leave",
      greeting: "上次喝咖啡我光顾着捏杯套了。今天终于能正大光明地捏东西。",
      story: "我小时候做过一只泥巴兔子，回家跟我爸说那是一条狗。",
      listen: "你等我把手擦一下，我想听后面。刚才这个边快掉下来了。",
      quiet: "好，我先顾一下这个快塌的边。你不用管我。",
      joke: "这只杯子不歪。它只是有一个独立的人生方向。",
      turnDown: "我得先把工具还了。要不把杯子先托给店里？",
      next: "周六下午两点，陶艺店门口",
      proposal: "周六两点来给杯子上釉？我想看看它到底还能歪成什么样。",
      bye: "那我先去还工具了。杯子记得留给店里。",
    },
    {
      id: "R11", name: "闻嘉", age: 28, presentation: "woman", pronoun: "她", players: openTo,
      scenes: ["S05", "S07"], traits: ["humor", "curious", "direct"], interests: ["food", "craft"],
      bio: "周末帮朋友收市集。碰到冷场会从身边找个小梗。",
      reason: "擅长接住自嘲，也会在需要时直接说自己的看法。",
      goal: "想遇到能一起笑也能各说各话的人", limit: 45, obligation: "帮朋友收市集",
      stayStyle: "leave",
      greeting: "我刚差点按平时的习惯把这事发群里。两个人见，原来还是会有点不一样。",
      story: "上回收摊搬了十二把椅子，朋友请我喝奶茶，给了十二分甜。",
      listen: "我本来想接个梗。算了，你这个故事还没讲完，我先听。",
      quiet: "那先吃。我也想看看这小碟里到底是什么。",
      joke: "可以，给这个突发事件发一张优秀参与奖。",
      turnDown: "我答应去搬椅子了。今天就先散吧。",
      next: "周日下午三点，市集入口",
      proposal: "周日三点我有空。要不要在市集入口见，先说好不用搬椅子？",
      bye: "椅子在等我。我先走啦，你也早点回。",
    },
    {
      id: "R15", name: "陶桥", age: 33, presentation: "man", pronoun: "他", players: openTo,
      scenes: ["S05", "S07"], traits: ["direct", "steady", "curious"], interests: ["food", "walking"],
      bio: "记得熟人平时喜欢的东西。遇到含糊的约定会先问清楚。",
      reason: "愿意问清对方的意思，能把模糊的计划变成具体选项。",
      goal: "想知道这次单独见面意味着什么", limit: 44, obligation: "去站口接朋友",
      greeting: "今天就咱俩，我想先听你的意见。还是点上次没点到的那个？",
      story: "你知道吗，上次群里都说吃面，最后有四个人点了饭。",
      listen: "你是说你想试一次，还是以后都愿意这么安排？我怕我听岔了。",
      quiet: "好，等你想说再说。我先去拿两双筷子。",
      joke: "这个可以先记下来，下次群里他们又说随便时拿出来。",
      turnDown: "我等会儿得去接人。你说的再待一会儿，咱改天留长一点吧。",
      next: "周六下午五点，地铁口旁的小馆",
      proposal: "周六五点我可以。地铁口那个小馆，想去的话我们就定那里。",
      bye: "我先去接人。你刚才说的我听明白了。",
    },
  ];

  const action = (id, label, options = {}) => ({ id, label, ...options });
  const scenes = [
    {
      id: "S02", name: "书店咖啡首见", place: "书店咖啡门口", time: "16:00", pace: "quiet",
      intro: "玻璃上还留着午后太阳的温度。窗边坐满了，对方手里夹着两张等位号。",
      hint: "你可以挑一个舒服的地点，也可以先听听对方想去哪。",
      nodes: {
        start: [
          action("wait", "先等位，看看店里", { to: "indoor", location: "书店等位区", change: "quiet-table", reply: "行，先等等。那边有一架旧杂志，可以边看边等。", minutes: 5 }),
          action("walk", "出去走十分钟", { to: "outdoor", location: "书店旁的小巷", reply: "好。走左边吧，右边刚好是学校放学那条路。", minutes: 10 }),
        ],
        indoor: [
          action("window", "问问窗边旧书架", { to: "connect", reply: "那排有些书会夹着前一位读者的小纸条。我每次都忍不住翻一下。" }),
          action("seat", "选个安静的位置", { to: "connect", voice: "quiet" }),
        ],
        outdoor: [
          action("alley", "问那扇绿门的来历", { to: "connect", change: "alley-noise", voice: "story" }),
          action("slow", "安静走一小段", { to: "connect", voice: "quiet" }),
        ],
      },
    },
    {
      id: "S05", name: "朋友第一次单独见面", place: "夜宵店的双人桌", time: "19:30", pace: "slow",
      intro: "平时一群人要拼两张桌。今晚靠墙的位置只摆了两副碗筷。",
      hint: "可以从你们已经熟悉的小事聊起，也可以说说为什么想单独见。",
      nodes: {
        start: [
          action("order", "先点上次没吃到的那碗面", { to: "meal", change: "meal-arrives", reply: "好，我还记得上回它刚上桌就被分完了。" }),
          action("invite-story", "说今天想单独见面的原因", { to: "meal", tags: ["relationship"], reply: "我听到了。等会儿菜上来，我们再慢慢说。" }),
        ],
        meal: [
          action("meal", "聊聊今晚跟以前有什么不同", { to: "connect", reply: "人少了以后，真的能听清你说话。以前总有人在桌对面抢着接。" }),
          action("menu", "先吃点东西，给话题留点空", { to: "connect", voice: "quiet" }),
        ],
      },
    },
    {
      id: "S07", name: "第二次约会做陶艺", place: "陶艺店的长工作台", time: "15:10", pace: "hands-on",
      intro: "这是第二次见面。上次只喝了杯咖啡，这次两人面前各有一只还没定型的杯子。",
      hint: "手上的小事已经是话题。你可以一起想办法，也可以欣赏这只歪杯子。",
      nodes: {
        start: [
          action("repair", "把塌下去的杯沿慢慢扶起来", { to: "clay", reply: "我托这边，你用湿手扶那边。慢一点，好像能救。", minutes: 8 }),
          action("keep-cup", "留下这个歪杯子", { to: "clay", voice: "joke", minutes: 4 }),
        ],
        clay: [
          action("glaze", "问下次能不能给杯子上釉", { to: "glaze-plans", change: "kiln-closes", reply: "可以先让店员收着。上釉得等它干透，今天做不了。" }),
          action("two-cups", "看看两只杯子并排的样子", { to: "connect", voice: "listen" }),
          action("photo", "先问对方愿不愿意拍杯子", { to: "connect", tags: ["photos"], reply: "杯子可以。我想只拍作品，别把我也拍进去。" }),
        ],
        "glaze-plans": [
          action("keep-together", "把两只杯子挨着放上晾干架", { to: "connect", location: "陶艺店的晾干架旁", reply: "放一块儿好认。等店员说干透了，再各挑各的颜色。" }),
          action("separate", "把自己的杯子交给店员收好", { to: "connect", reply: "行，我也去给我的杯子写张便笺。下次来了一眼能找着。" }),
        ],
      },
    },
  ];

  const shared = {
    connect: [
      action("own-story", "说起最近一次临时改计划", { to: "decision", voice: "listen", minutes: 12 }),
      action("ask-role", "接着问对方最近在忙什么", { to: "decision", tags: ["work"], voice: "story" }),
      action("keep-light", "聊点轻松的，留一点空白", { to: "decision", voice: "quiet" }),
      action("define", "问今天在对方心里算不算约会", { scene: "S05", tags: ["relationship"], to: "decision", reply: "我愿意把今天当成约会。之后怎么相处，可以等你也想聊时再谈。" }),
    ],
    decision: [
      action("stay", "问对方今天能否再待一会儿", { type: "stay" }),
      action("ask-again", "问有没有愿意再见的时间", { type: "invite" }),
      action("linger", "照现在的节奏再相处一会儿", { type: "linger", minutes: 20 }),
    ],
    proposal: [action("confirm", "确认对方给的具体时间和地点", { type: "confirm" })],
  };
  const leave = action("leave", "今天就到这里，道个别", { type: "leave" });

  const changes = {
    "quiet-table": { text: "店员把靠墙的位置擦干净，抬头叫到了你的号。", location: "书店里靠墙的桌子" },
    "alley-noise": { text: "巷口的摊主拉开折叠桌，你们往安静的一侧让了让。", surprise: true },
    "meal-arrives": { text: "两碗面先后上桌，对方把小碟推到两人中间。" },
    "kiln-closes": { text: "店员拿来标签，让你们把成品先留在晾干架上。" },
  };

  const content = { topics, traits, interests, roles, scenes, shared, leave, changes };
  if (typeof module !== "undefined") module.exports = content;
  else window.DatingContent = content;
})();
