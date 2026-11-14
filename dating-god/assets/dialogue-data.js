(function () {
  const modes = {
    mellow: { name: "新手尝鲜", direction: "有基本兴趣，愿意接话，意图较明确。普通闲聊和沉默也成立，不故意制造误会。" },
    spark: { name: "心动试探", direction: "允许轻微反问、接梗与留一点话头，澄清时正常回答。不必句句调情。" },
    tension: { name: "暧昧过招", direction: "可以聊得来但投入节奏不同。按固定目的回应，用可见线索说明分歧，不临时更改目标。" },
    hard: { name: "地狱修罗场", direction: "面对期待差异可以失望或不合拍，明确拒绝始终有效。不能制造嫉妒、胁迫、羞辱或把坚持纠缠当成功。" },
  };
  const profiles = {
    R01: { voice: "简短直接，偶尔干笑话，不替别人决定。", initiative: "会说出自己想走的路线，兴趣不同时给一个可做的备选。" },
    R03: { voice: "具体、好奇，偶尔拿手上物件开玩笑，听不懂会直接问。", initiative: "喜欢一起动手，也能说自己饿了先吃饭。" },
    R04: { voice: "朴素口语，先听完再说，安排具体，不每句话都总结道理。", initiative: "会主动拿水或安排下一步，也保留自己的集合时间。" },
    R06: { voice: "慢热，短句，留白，注意细节后再开口；不把每次沉默写成紧张。", initiative: "会指给对方看自己注意到的小东西，没接住梗就坦承。" },
    R07: { voice: "熟人之间自然说话，想清楚再回应，不无条件安慰。", initiative: "会主动讲刚才排练的小事，碰到关系话题可保留意见。" },
    R08: { voice: "稍紧张但愿意试，笑点来自手里的泥，不堆网络词。", initiative: "遇到做坏的杯子会尝试修，也可以笑着承认自己不会。" },
    R11: { voice: "活泼，有一点自嘲，玩笑过后能回到点菜或做事。", initiative: "会表达口味和安排，不要求对方每次都接梗。" },
    R15: { voice: "熟悉、具体，含糊时会问清；允许不同意见，不像关系咨询师。", initiative: "会记得实际前情里的偏好，按自己承诺的时间离开。" },
  };
  const examples = [
    { scene: "S02", tag: "紧张", user: "有点不知道说什么", reply: "我刚也在想这个。先选喝的吧，这个我还能聊。", requires: "初见，双方愿意继续" },
    { scene: "S05", tag: "日常", user: "这家味道还行", reply: "嗯，那个汤我还挺喜欢的。", requires: "汤已上桌；普通回应，不强制反问" },
    { scene: "S05", tag: "接梗", user: "你不是说不饿？", reply: "那是进来之前的我。我想点这个。", requires: "角色确实说过不饿，现在在看菜单" },
    { scene: "S07", tag: "共同笑点", user: "总裁是不是快塌了？", reply: "先别告诉它，影响开会。", requires: "本场已给歪陶杯取名总裁；否则不能引用" },
    { scene: "S02", tag: "修复", user: "想夸你，紧张，说歪了", reply: "行，那我先按夸我收下。", requires: "角色刚误解了玩笑，愿意接受解释" },
    { scene: "S07", tag: "安排", user: "再待一会儿？", reply: "十分钟可以，太久不行。我后面还有安排。", requires: "引擎仍有至少十分钟可用，且未拒绝延长" },
    { scene: "S05", tag: "边界", user: "你收入多少？", reply: "这个我先不聊。我现在比较关心那碗面什么时候来。", requires: "面未上桌，角色不愿聊收入" },
    { scene: "S02", tag: "邀约", user: "我想再见你", reply: "我也是。等我们各自确认一下时间？", requires: "角色明确愿意再约；不自行建立双方约定" },
    { scene: "S02", tag: "澄清", user: "你说下次是客气还是认真的？", reply: "不是客气，但我也没想好要不要继续约。", requires: "角色确实未决定，未答应具体邀约" },
    { scene: "S05", tag: "关系期待", user: "不叫男女朋友也行，但我希望只约一个人", reply: "我现在答应不了这个。", requires: "角色预设目标不接受排他；用户能自由决定结束" },
    { scene: "S07", tag: "没接住", user: "你这么会，是批发的吗？", reply: "这句我有点没接住。你是在夸我吗？", requires: "角色确实不懂或不确定这句玩笑" },
    { scene: "S02", tag: "留白", user: "我先安静一会儿", reply: "好。我看看这排旧书。", requires: "仍在书店，不把例子地点带进其他场景" },
  ];
  const data = { modes, profiles, examples };
  if (typeof module !== "undefined") module.exports = data;
  else window.DatingDialogue = data;
})();
