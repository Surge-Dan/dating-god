(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.RadarRules=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const VERSION='2.0.0';
const rules=[
  {
    "id": "D01-01",
    "version": "2.0.0",
    "group": "邀约与行程组织",
    "category": "negotiation",
    "title": "已经约定需确认具体时间地点，到了约定确认节点仍未给出安排",
    "premise": "已经约定需确认具体时间地点，到了约定确认节点仍未给出安排",
    "counterexample": "不以普通聊天回得慢判断；未约定确认节点先澄清",
    "repair": "补齐必要信息，把时间、地点、是否继续的选择交还双方。",
    "sourceIds": [
      "X03",
      "X12",
      "B05",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "不以普通聊天回得慢判断；未约定确认节点先澄清",
    "activityIds": []
  },
  {
    "id": "D01-02",
    "version": "2.0.0",
    "group": "邀约与行程组织",
    "category": "friction",
    "title": "已知道行程取消，却明说让对方白跑也无所谓，不通知",
    "premise": "已知道行程取消，却明说让对方白跑也无所谓，不通知",
    "counterexample": "急事、断网、未能及时联系需允许解释",
    "repair": "补齐必要信息，把时间、地点、是否继续的选择交还双方。",
    "sourceIds": [
      "X03",
      "X12",
      "B05",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "急事、断网、未能及时联系需允许解释",
    "activityIds": []
  },
  {
    "id": "D01-03",
    "version": "2.0.0",
    "group": "邀约与行程组织",
    "category": "boundary",
    "title": "对方只同意公共场所见面，仍强迫改去家中或其他私密场所",
    "premise": "对方只同意公共场所见面，仍强迫改去家中或其他私密场所",
    "counterexample": "提议变更、接受拒绝本身正常",
    "repair": "补齐必要信息，把时间、地点、是否继续的选择交还双方。",
    "sourceIds": [
      "X03",
      "X12",
      "B05",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "提议变更、接受拒绝本身正常",
    "activityIds": []
  },
  {
    "id": "D01-04",
    "version": "2.0.0",
    "group": "邀约与行程组织",
    "category": "friction",
    "title": "原本是两人约会，临时带朋友并要求对方必须接受",
    "premise": "原本是两人约会，临时带朋友并要求对方必须接受",
    "counterexample": "事先同意聚会或偶遇后询问意愿不判错；限制离开另按边界",
    "repair": "补齐必要信息，把时间、地点、是否继续的选择交还双方。",
    "sourceIds": [
      "X03",
      "X12",
      "B05",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "事先同意聚会或偶遇后询问意愿不判错；限制离开另按边界",
    "activityIds": []
  },
  {
    "id": "D01-05",
    "version": "2.0.0",
    "group": "邀约与行程组织",
    "category": "negotiation",
    "title": "对方已说本次只有一小时，仍把延长行程当成双方已答应",
    "premise": "对方已说本次只有一小时，仍把延长行程当成双方已答应",
    "counterexample": "时间可重新协商，不以真实打字等待推进剧情",
    "repair": "补齐必要信息，把时间、地点、是否继续的选择交还双方。",
    "sourceIds": [
      "X03",
      "X12",
      "B05",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "时间可重新协商，不以真实打字等待推进剧情",
    "activityIds": []
  },
  {
    "id": "D01-06",
    "version": "2.0.0",
    "group": "邀约与行程组织",
    "category": "friction",
    "title": "对方明确不想某个活动，仍反复安排该项目且拒绝备选",
    "premise": "对方明确不想某个活动，仍反复安排该项目且拒绝备选",
    "counterexample": "尚未表达偏好不能推断“完全不顾对方”",
    "repair": "补齐必要信息，把时间、地点、是否继续的选择交还双方。",
    "sourceIds": [
      "X03",
      "X12",
      "B05",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "尚未表达偏好不能推断“完全不顾对方”",
    "activityIds": []
  },
  {
    "id": "D01-07",
    "version": "2.0.0",
    "group": "邀约与行程组织",
    "category": "negotiation",
    "title": "新增第二站的交通、票务或时长尚未说明，双方未确认能否出发",
    "premise": "新增第二站的交通、票务或时长尚未说明，双方未确认能否出发",
    "counterexample": "信息补齐后由双方选择；无视明确拒绝不再只是协商",
    "repair": "补齐必要信息，把时间、地点、是否继续的选择交还双方。",
    "sourceIds": [
      "X03",
      "X12",
      "B05",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "信息补齐后由双方选择；无视明确拒绝不再只是协商",
    "activityIds": []
  },
  {
    "id": "D01-08",
    "version": "2.0.0",
    "group": "邀约与行程组织",
    "category": "friction",
    "title": "明确说故意迟到或让对方等，是为了测试其够不够在乎",
    "premise": "明确说故意迟到或让对方等，是为了测试其够不够在乎",
    "counterexample": "普通迟到与不可预见交通不等于有意测试",
    "repair": "补齐必要信息，把时间、地点、是否继续的选择交还双方。",
    "sourceIds": [
      "X03",
      "X12",
      "B05",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "普通迟到与不可预见交通不等于有意测试",
    "activityIds": []
  },
  {
    "id": "D01-09",
    "version": "2.0.0",
    "group": "邀约与行程组织",
    "category": "negotiation",
    "title": "会合方案对一方明显不可行，尚未形成双方能接受的备选",
    "premise": "会合方案对一方明显不可行，尚未形成双方能接受的备选",
    "counterexample": "谁路程更长本身不证明不平等；贬低或强迫另判",
    "repair": "补齐必要信息，把时间、地点、是否继续的选择交还双方。",
    "sourceIds": [
      "X03",
      "X12",
      "B05",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "谁路程更长本身不证明不平等；贬低或强迫另判",
    "activityIds": [
      "A09"
    ]
  },
  {
    "id": "D01-10",
    "version": "2.0.0",
    "group": "邀约与行程组织",
    "category": "friction",
    "title": "把对方不能赴约解释为必须接受惩罚、赔礼或服从下次安排",
    "premise": "把对方不能赴约解释为必须接受惩罚、赔礼或服从下次安排",
    "counterexample": "可以表达失望、协商取消成本或不再邀约",
    "repair": "补齐必要信息，把时间、地点、是否继续的选择交还双方。",
    "sourceIds": [
      "X03",
      "X12",
      "B05",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可以表达失望、协商取消成本或不再邀约",
    "activityIds": []
  },
  {
    "id": "D02-01",
    "version": "2.0.0",
    "group": "身份、信息与意图表达",
    "category": "boundary",
    "title": "既定事实表明有需披露的关系约定，却明确以虚假关系状态取得同意",
    "premise": "既定事实表明有需披露的关系约定，却明确以虚假关系状态取得同意",
    "counterexample": "非排他关系不自动等于欺骗，需核对双方约定",
    "repair": "说明已知事实、承认不一致，允许对方据此重新选择。只有明确承认或既定虚构事实才能认定欺骗。",
    "sourceIds": [
      "C01",
      "X01",
      "B01",
      "B02"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "非排他关系不自动等于欺骗，需核对双方约定",
    "activityIds": []
  },
  {
    "id": "D02-02",
    "version": "2.0.0",
    "group": "身份、信息与意图表达",
    "category": "friction",
    "title": "明确承认故意用不属于自己的照片诱导见面",
    "premise": "明确承认故意用不属于自己的照片诱导见面",
    "counterexample": "外貌变化、角度差异不直接判假照",
    "repair": "说明已知事实、承认不一致，允许对方据此重新选择。只有明确承认或既定虚构事实才能认定欺骗。",
    "sourceIds": [
      "C01",
      "X01",
      "B01",
      "B02"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "外貌变化、角度差异不直接判假照",
    "activityIds": []
  },
  {
    "id": "D02-03",
    "version": "2.0.0",
    "group": "身份、信息与意图表达",
    "category": "friction",
    "title": "明说编造职业或收入以影响对方决定",
    "premise": "明说编造职业或收入以影响对方决定",
    "counterexample": "职业普通、收入低或拒答收入本身无错",
    "repair": "说明已知事实、承认不一致，允许对方据此重新选择。只有明确承认或既定虚构事实才能认定欺骗。",
    "sourceIds": [
      "C01",
      "X01",
      "B01",
      "B02"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "职业普通、收入低或拒答收入本身无错",
    "activityIds": []
  },
  {
    "id": "D02-04",
    "version": "2.0.0",
    "group": "身份、信息与意图表达",
    "category": "friction",
    "title": "承认借“认真交往”的虚假承诺获取只在该前提下才获准的安排",
    "premise": "承认借“认真交往”的虚假承诺获取只在该前提下才获准的安排",
    "counterexample": "后来改变想法、暂不确定不能倒推此前在骗",
    "repair": "说明已知事实、承认不一致，允许对方据此重新选择。只有明确承认或既定虚构事实才能认定欺骗。",
    "sourceIds": [
      "C01",
      "X01",
      "B01",
      "B02"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "后来改变想法、暂不确定不能倒推此前在骗",
    "activityIds": []
  },
  {
    "id": "D02-05",
    "version": "2.0.0",
    "group": "身份、信息与意图表达",
    "category": "negotiation",
    "title": "对关键生活期待前后说法不同，双方需要据实澄清",
    "premise": "对关键生活期待前后说法不同，双方需要据实澄清",
    "counterexample": "可能是更正、记错或想法变化，不直接指控恶意",
    "repair": "说明已知事实、承认不一致，允许对方据此重新选择。只有明确承认或既定虚构事实才能认定欺骗。",
    "sourceIds": [
      "C01",
      "X01",
      "B01",
      "B02"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可能是更正、记错或想法变化，不直接指控恶意",
    "activityIds": []
  },
  {
    "id": "D02-06",
    "version": "2.0.0",
    "group": "身份、信息与意图表达",
    "category": "friction",
    "title": "用虚构专业资格要求对方服从自己的建议，事实已有明确证据",
    "premise": "用虚构专业资格要求对方服从自己的建议，事实已有明确证据",
    "counterexample": "分享经验可以，专业身份也不免除询问意愿",
    "repair": "说明已知事实、承认不一致，允许对方据此重新选择。只有明确承认或既定虚构事实才能认定欺骗。",
    "sourceIds": [
      "C01",
      "X01",
      "B01",
      "B02"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "分享经验可以，专业身份也不免除询问意愿",
    "activityIds": []
  },
  {
    "id": "D02-07",
    "version": "2.0.0",
    "group": "身份、信息与意图表达",
    "category": "friction",
    "title": "尚未达成承诺，就向对方声称双方已约定未来安排",
    "premise": "尚未达成承诺，就向对方声称双方已约定未来安排",
    "counterexample": "表达个人愿望不等于冒充共同决定；未明前情先澄清",
    "repair": "说明已知事实、承认不一致，允许对方据此重新选择。只有明确承认或既定虚构事实才能认定欺骗。",
    "sourceIds": [
      "C01",
      "X01",
      "B01",
      "B02"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "表达个人愿望不等于冒充共同决定；未明前情先澄清",
    "activityIds": []
  },
  {
    "id": "D02-08",
    "version": "2.0.0",
    "group": "身份、信息与意图表达",
    "category": "boundary",
    "title": "故意隐去已知会影响本次参与意愿的具体安排，并以“来了就得接受”施压",
    "premise": "故意隐去已知会影响本次参与意愿的具体安排，并以“来了就得接受”施压",
    "counterexample": "正常惊喜仍应允许拒绝，不等于所有细节都必须预告",
    "repair": "说明已知事实、承认不一致，允许对方据此重新选择。只有明确承认或既定虚构事实才能认定欺骗。",
    "sourceIds": [
      "C01",
      "X01",
      "B01",
      "B02"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "正常惊喜仍应允许拒绝，不等于所有细节都必须预告",
    "activityIds": []
  },
  {
    "id": "D02-09",
    "version": "2.0.0",
    "group": "身份、信息与意图表达",
    "category": "friction",
    "title": "用“我一开始就这样”否认本场明确说过的不同约定",
    "premise": "用“我一开始就这样”否认本场明确说过的不同约定",
    "counterexample": "前情不完整时先核对，不让模型补造历史",
    "repair": "说明已知事实、承认不一致，允许对方据此重新选择。只有明确承认或既定虚构事实才能认定欺骗。",
    "sourceIds": [
      "C01",
      "X01",
      "B01",
      "B02"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "前情不完整时先核对，不让模型补造历史",
    "activityIds": []
  },
  {
    "id": "D02-10",
    "version": "2.0.0",
    "group": "身份、信息与意图表达",
    "category": "friction",
    "title": "在对方纠正已可证实的信息后，仍要求其公开替自己作假证明",
    "premise": "在对方纠正已可证实的信息后，仍要求其公开替自己作假证明",
    "counterexample": "不要求用户披露隐私或证明所有自述",
    "repair": "说明已知事实、承认不一致，允许对方据此重新选择。只有明确承认或既定虚构事实才能认定欺骗。",
    "sourceIds": [
      "C01",
      "X01",
      "B01",
      "B02"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "不要求用户披露隐私或证明所有自述",
    "activityIds": []
  },
  {
    "id": "D03-01",
    "version": "2.0.0",
    "group": "倾听、话轮与交流空间",
    "category": "friction",
    "title": "对方请求说完后仍反复打断、抢走话题",
    "premise": "对方请求说完后仍反复打断、抢走话题",
    "counterexample": "偶然重叠、双方兴奋接话不自动判错",
    "repair": "接住刚才的内容，提供表达空间；不要求话轮、问题或隐私披露等额。",
    "sourceIds": [
      "R2",
      "R7",
      "N5",
      "C04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "偶然重叠、双方兴奋接话不自动判错",
    "activityIds": []
  },
  {
    "id": "D03-02",
    "version": "2.0.0",
    "group": "倾听、话轮与交流空间",
    "category": "friction",
    "title": "对方正在回答，替其断言想法并拒绝其纠正",
    "premise": "对方正在回答，替其断言想法并拒绝其纠正",
    "counterexample": "受邀代为说明或共同补充可以",
    "repair": "接住刚才的内容，提供表达空间；不要求话轮、问题或隐私披露等额。",
    "sourceIds": [
      "R2",
      "R7",
      "N5",
      "C04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "受邀代为说明或共同补充可以",
    "activityIds": []
  },
  {
    "id": "D03-03",
    "version": "2.0.0",
    "group": "倾听、话轮与交流空间",
    "category": "boundary",
    "title": "明确不愿回答后，持续追问私密经历",
    "premise": "明确不愿回答后，持续追问私密经历",
    "counterexample": "双方自愿深入谈话不限制深度",
    "repair": "接住刚才的内容，提供表达空间；不要求话轮、问题或隐私披露等额。",
    "sourceIds": [
      "R2",
      "R7",
      "N5",
      "C04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "双方自愿深入谈话不限制深度",
    "activityIds": []
  },
  {
    "id": "D03-04",
    "version": "2.0.0",
    "group": "倾听、话轮与交流空间",
    "category": "friction",
    "title": "对方刚说需要被听见，仍把每段内容转为自己的成就展示",
    "premise": "对方刚说需要被听见，仍把每段内容转为自己的成就展示",
    "counterexample": "分享类似经验不天然是抢话",
    "repair": "接住刚才的内容，提供表达空间；不要求话轮、问题或隐私披露等额。",
    "sourceIds": [
      "R2",
      "R7",
      "N5",
      "C04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "分享类似经验不天然是抢话",
    "activityIds": []
  },
  {
    "id": "D03-05",
    "version": "2.0.0",
    "group": "倾听、话轮与交流空间",
    "category": "friction",
    "title": "对方已表示想自己理解，仍用“你不懂”继续长篇教学",
    "premise": "对方已表示想自己理解，仍用“你不懂”继续长篇教学",
    "counterexample": "被邀请的讲解、双方都乐于听不报雷",
    "repair": "接住刚才的内容，提供表达空间；不要求话轮、问题或隐私披露等额。",
    "sourceIds": [
      "R2",
      "R7",
      "N5",
      "C04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "被邀请的讲解、双方都乐于听不报雷",
    "activityIds": [
      "A01",
      "A06"
    ]
  },
  {
    "id": "D03-06",
    "version": "2.0.0",
    "group": "倾听、话轮与交流空间",
    "category": "friction",
    "title": "把对方回应当考试，答不出就贬低其资格或智力",
    "premise": "把对方回应当考试，答不出就贬低其资格或智力",
    "counterexample": "轻松互考、猜谜且仍受欢迎可以",
    "repair": "接住刚才的内容，提供表达空间；不要求话轮、问题或隐私披露等额。",
    "sourceIds": [
      "R2",
      "R7",
      "N5",
      "C04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "轻松互考、猜谜且仍受欢迎可以",
    "activityIds": [
      "A07"
    ]
  },
  {
    "id": "D03-07",
    "version": "2.0.0",
    "group": "倾听、话轮与交流空间",
    "category": "negotiation",
    "title": "连续单向提问让对方明确说像被审讯，却不调整方式",
    "premise": "连续单向提问让对方明确说像被审讯，却不调整方式",
    "counterexample": "提问数量不是规则阈值；安静也不等于不参与",
    "repair": "接住刚才的内容，提供表达空间；不要求话轮、问题或隐私披露等额。",
    "sourceIds": [
      "R2",
      "R7",
      "N5",
      "C04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "提问数量不是规则阈值；安静也不等于不参与",
    "activityIds": []
  },
  {
    "id": "D03-08",
    "version": "2.0.0",
    "group": "倾听、话轮与交流空间",
    "category": "friction",
    "title": "对方说明听不清或需要慢一点，仍故意加速并嘲弄",
    "premise": "对方说明听不清或需要慢一点，仍故意加速并嘲弄",
    "counterexample": "口音、语速、语言能力本身不判错",
    "repair": "接住刚才的内容，提供表达空间；不要求话轮、问题或隐私披露等额。",
    "sourceIds": [
      "R2",
      "R7",
      "N5",
      "C04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "口音、语速、语言能力本身不判错",
    "activityIds": []
  },
  {
    "id": "D03-09",
    "version": "2.0.0",
    "group": "倾听、话轮与交流空间",
    "category": "boundary",
    "title": "以“我都讲了”要求对方必须披露同等隐私",
    "premise": "以“我都讲了”要求对方必须披露同等隐私",
    "counterexample": "互惠是自愿交流，不是隐私债务",
    "repair": "接住刚才的内容，提供表达空间；不要求话轮、问题或隐私披露等额。",
    "sourceIds": [
      "R2",
      "R7",
      "N5",
      "C04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "互惠是自愿交流，不是隐私债务",
    "activityIds": []
  },
  {
    "id": "D03-10",
    "version": "2.0.0",
    "group": "倾听、话轮与交流空间",
    "category": "friction",
    "title": "对方纠正自己被误解的意思，仍坚持“我比你更懂你”",
    "premise": "对方纠正自己被误解的意思，仍坚持“我比你更懂你”",
    "counterexample": "可以说明自己的理解，但要允许对方自述",
    "repair": "接住刚才的内容，提供表达空间；不要求话轮、问题或隐私披露等额。",
    "sourceIds": [
      "R2",
      "R7",
      "N5",
      "C04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可以说明自己的理解，但要允许对方自述",
    "activityIds": []
  },
  {
    "id": "D04-01",
    "version": "2.0.0",
    "group": "玩笑、评价与尊重",
    "category": "friction",
    "title": "用性别概括贬低对方，并以“都这样”否定其个体表达",
    "premise": "用性别概括贬低对方，并以“都这样”否定其个体表达",
    "counterexample": "讨论性别经验或平等议题不判失礼",
    "repair": "停止把人当笑料，针对自己的言行承担责任，不要求对方证明“开得起玩笑”。",
    "sourceIds": [
      "R4",
      "B08",
      "X01",
      "X07",
      "X09"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "讨论性别经验或平等议题不判失礼",
    "activityIds": []
  },
  {
    "id": "D04-02",
    "version": "2.0.0",
    "group": "玩笑、评价与尊重",
    "category": "friction",
    "title": "以地域、族群或身份作贬低理由",
    "premise": "以地域、族群或身份作贬低理由",
    "counterexample": "谈文化差异、互相欢迎的称呼需看语境",
    "repair": "停止把人当笑料，针对自己的言行承担责任，不要求对方证明“开得起玩笑”。",
    "sourceIds": [
      "R4",
      "B08",
      "X01",
      "X07",
      "X09"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "谈文化差异、互相欢迎的称呼需看语境",
    "activityIds": []
  },
  {
    "id": "D04-03",
    "version": "2.0.0",
    "group": "玩笑、评价与尊重",
    "category": "friction",
    "title": "嘲笑身体、外貌或穿着，要求对方接受评价",
    "premise": "嘲笑身体、外貌或穿着，要求对方接受评价",
    "counterexample": "受邀给穿搭意见可具体表达，不羞辱",
    "repair": "停止把人当笑料，针对自己的言行承担责任，不要求对方证明“开得起玩笑”。",
    "sourceIds": [
      "R4",
      "B08",
      "X01",
      "X07",
      "X09"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "受邀给穿搭意见可具体表达，不羞辱",
    "activityIds": []
  },
  {
    "id": "D04-04",
    "version": "2.0.0",
    "group": "玩笑、评价与尊重",
    "category": "friction",
    "title": "先具体贬低对方，再以勉强认可为由要求其接受追求/服从",
    "premise": "先具体贬低对方，再以勉强认可为由要求其接受追求/服从",
    "counterexample": "一句笨拙夸赞不能直接推断内心动机；无明确施压先澄清",
    "repair": "停止把人当笑料，针对自己的言行承担责任，不要求对方证明“开得起玩笑”。",
    "sourceIds": [
      "R4",
      "B08",
      "X01",
      "X07",
      "X09"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "一句笨拙夸赞不能直接推断内心动机；无明确施压先澄清",
    "activityIds": []
  },
  {
    "id": "D04-05",
    "version": "2.0.0",
    "group": "玩笑、评价与尊重",
    "category": "friction",
    "title": "对方说某个梗不舒服后，仍换说法继续拿其痛处开玩笑",
    "premise": "对方说某个梗不舒服后，仍换说法继续拿其痛处开玩笑",
    "counterexample": "双方持续欢迎的互损不凭关键词误报",
    "repair": "停止把人当笑料，针对自己的言行承担责任，不要求对方证明“开得起玩笑”。",
    "sourceIds": [
      "R4",
      "B08",
      "X01",
      "X07",
      "X09"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "双方持续欢迎的互损不凭关键词误报",
    "activityIds": []
  },
  {
    "id": "D04-06",
    "version": "2.0.0",
    "group": "玩笑、评价与尊重",
    "category": "friction",
    "title": "公开嘲笑对方不懂知识、发音或用词，拒绝其不想被纠正的要求",
    "premise": "公开嘲笑对方不懂知识、发音或用词，拒绝其不想被纠正的要求",
    "counterexample": "受邀纠错、必要信息更正可以",
    "repair": "停止把人当笑料，针对自己的言行承担责任，不要求对方证明“开得起玩笑”。",
    "sourceIds": [
      "R4",
      "B08",
      "X01",
      "X07",
      "X09"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "受邀纠错、必要信息更正可以",
    "activityIds": [
      "A06",
      "A07"
    ]
  },
  {
    "id": "D04-07",
    "version": "2.0.0",
    "group": "玩笑、评价与尊重",
    "category": "friction",
    "title": "拿前任、朋友伴侣作羞辱性比较，要求对方证明更值钱或更听话",
    "premise": "拿前任、朋友伴侣作羞辱性比较，要求对方证明更值钱或更听话",
    "counterexample": "正常提及过去或交流偏好不等于比较羞辱",
    "repair": "停止把人当笑料，针对自己的言行承担责任，不要求对方证明“开得起玩笑”。",
    "sourceIds": [
      "R4",
      "B08",
      "X01",
      "X07",
      "X09"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "正常提及过去或交流偏好不等于比较羞辱",
    "activityIds": []
  },
  {
    "id": "D04-08",
    "version": "2.0.0",
    "group": "玩笑、评价与尊重",
    "category": "friction",
    "title": "用未经依据的心理/疾病标签贬低对方或堵住讨论",
    "premise": "用未经依据的心理/疾病标签贬低对方或堵住讨论",
    "counterexample": "自述诊断、讨论求助不算冒犯他人",
    "repair": "停止把人当笑料，针对自己的言行承担责任，不要求对方证明“开得起玩笑”。",
    "sourceIds": [
      "R4",
      "B08",
      "X01",
      "X07",
      "X09"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "自述诊断、讨论求助不算冒犯他人",
    "activityIds": []
  },
  {
    "id": "D04-09",
    "version": "2.0.0",
    "group": "玩笑、评价与尊重",
    "category": "friction",
    "title": "对方说明不适后直接讥讽其矫情、玻璃心，并拒绝讨论具体行为",
    "premise": "对方说明不适后直接讥讽其矫情、玻璃心，并拒绝讨论具体行为",
    "counterexample": "可以不同意解释，不以感受差自动定罪",
    "repair": "停止把人当笑料，针对自己的言行承担责任，不要求对方证明“开得起玩笑”。",
    "sourceIds": [
      "R4",
      "B08",
      "X01",
      "X07",
      "X09"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可以不同意解释，不以感受差自动定罪",
    "activityIds": []
  },
  {
    "id": "D04-10",
    "version": "2.0.0",
    "group": "玩笑、评价与尊重",
    "category": "friction",
    "title": "把对方过往受伤、被骗或被拒经历当作其不值得被尊重的证据",
    "premise": "把对方过往受伤、被骗或被拒经历当作其不值得被尊重的证据",
    "counterexample": "倾听经历或表达不适配可以，不责怪受害者",
    "repair": "停止把人当笑料，针对自己的言行承担责任，不要求对方证明“开得起玩笑”。",
    "sourceIds": [
      "R4",
      "B08",
      "X01",
      "X07",
      "X09"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "倾听经历或表达不适配可以，不责怪受害者",
    "activityIds": []
  },
  {
    "id": "D05-01",
    "version": "2.0.0",
    "group": "金钱、消费与分担",
    "category": "friction",
    "title": "对方已拒绝超预算，仍把更贵消费当作双方已同意",
    "premise": "对方已拒绝超预算，仍把更贵消费当作双方已同意",
    "counterexample": "单纯提议为协商；强迫消费另按边界，自己请客也需尊重是否参加",
    "repair": "说清预算与约定，落实自愿分担；不按花费或性别设统一义务。",
    "sourceIds": [
      "C03",
      "E2", "E3", "E4",
      "B05",
      "B08",
      "X09",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "单纯提议为协商；强迫消费另按边界，自己请客也需尊重是否参加",
    "activityIds": [
      "A04",
      "A17"
    ]
  },
  {
    "id": "D05-02",
    "version": "2.0.0",
    "group": "金钱、消费与分担",
    "category": "negotiation",
    "title": "未经确认点高价项目，事后要求对方承担新增费用",
    "premise": "未经确认点高价项目，事后要求对方承担新增费用",
    "counterexample": "费用不明先核对，不凭价格判断拜金",
    "repair": "说清预算与约定，落实自愿分担；不按花费或性别设统一义务。",
    "sourceIds": [
      "C03",
      "E2", "E3", "E4",
      "B05",
      "B08",
      "X09",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "费用不明先核对，不凭价格判断拜金",
    "activityIds": [
      "A02"
    ]
  },
  {
    "id": "D05-03",
    "version": "2.0.0",
    "group": "金钱、消费与分担",
    "category": "boundary",
    "title": "要求借钱、透支或贷款来证明喜欢，拒绝后继续施压",
    "premise": "要求借钱、透支或贷款来证明喜欢，拒绝后继续施压",
    "counterexample": "普通求助、表达经济困难不自动是操控",
    "repair": "说清预算与约定，落实自愿分担；不按花费或性别设统一义务。",
    "sourceIds": [
      "C03",
      "E2", "E3", "E4",
      "B05",
      "B08",
      "X09",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "普通求助、表达经济困难不自动是操控",
    "activityIds": []
  },
  {
    "id": "D05-04",
    "version": "2.0.0",
    "group": "金钱、消费与分担",
    "category": "friction",
    "title": "明确约定请客/分担后，临买单单方改口且要求对方无条件接受",
    "premise": "明确约定请客/分担后，临买单单方改口且要求对方无条件接受",
    "counterexample": "临时经济变化可说明并重新协商",
    "repair": "说清预算与约定，落实自愿分担；不按花费或性别设统一义务。",
    "sourceIds": [
      "C03",
      "E2", "E3", "E4",
      "B05",
      "B08",
      "X09",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "临时经济变化可说明并重新协商",
    "activityIds": []
  },
  {
    "id": "D05-05",
    "version": "2.0.0",
    "group": "金钱、消费与分担",
    "category": "friction",
    "title": "已经确认自己承担的费用，且明确说有能力但就是让对方代付",
    "premise": "已经确认自己承担的费用，且明确说有能力但就是让对方代付",
    "counterexample": "接电话、忘带卡或暂时困难不证明逃单",
    "repair": "说清预算与约定，落实自愿分担；不按花费或性别设统一义务。",
    "sourceIds": [
      "C03",
      "E2", "E3", "E4",
      "B05",
      "B08",
      "X09",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "接电话、忘带卡或暂时困难不证明逃单",
    "activityIds": []
  },
  {
    "id": "D05-06",
    "version": "2.0.0",
    "group": "金钱、消费与分担",
    "category": "boundary",
    "title": "以请客、送礼或车费要求身体接触、继续见面或服从",
    "premise": "以请客、送礼或车费要求身体接触、继续见面或服从",
    "counterexample": "收下礼物和感谢都不是亲密授权",
    "repair": "说清预算与约定，落实自愿分担；不按花费或性别设统一义务。",
    "sourceIds": [
      "C03",
      "E2", "E3", "E4",
      "B05",
      "B08",
      "X09",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "收下礼物和感谢都不是亲密授权",
    "activityIds": []
  },
  {
    "id": "D05-07",
    "version": "2.0.0",
    "group": "金钱、消费与分担",
    "category": "friction",
    "title": "用团购、优惠券、低消费或收入羞辱对方的人格",
    "premise": "用团购、优惠券、低消费或收入羞辱对方的人格",
    "counterexample": "不喜欢消费方式可以说明，不要求继续约会",
    "repair": "说清预算与约定，落实自愿分担；不按花费或性别设统一义务。",
    "sourceIds": [
      "C03",
      "E2", "E3", "E4",
      "B05",
      "B08",
      "X09",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "不喜欢消费方式可以说明，不要求继续约会",
    "activityIds": [
      "A10"
    ]
  },
  {
    "id": "D05-08",
    "version": "2.0.0",
    "group": "金钱、消费与分担",
    "category": "friction",
    "title": "用礼物价格给关系等级评分并当面羞辱对方",
    "premise": "用礼物价格给关系等级评分并当面羞辱对方",
    "counterexample": "可以不收、不喜欢或协商礼物预算",
    "repair": "说清预算与约定，落实自愿分担；不按花费或性别设统一义务。",
    "sourceIds": [
      "C03",
      "E2", "E3", "E4",
      "B05",
      "B08",
      "X09",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可以不收、不喜欢或协商礼物预算",
    "activityIds": []
  },
  {
    "id": "D05-09",
    "version": "2.0.0",
    "group": "金钱、消费与分担",
    "category": "boundary",
    "title": "对方拒绝贵重礼物后，仍强行交付并要求回报",
    "premise": "对方拒绝贵重礼物后，仍强行交付并要求回报",
    "counterexample": "表达想送礼且接受拒绝不判错",
    "repair": "说清预算与约定，落实自愿分担；不按花费或性别设统一义务。",
    "sourceIds": [
      "C03",
      "E2", "E3", "E4",
      "B05",
      "B08",
      "X09",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "表达想送礼且接受拒绝不判错",
    "activityIds": [
      "A13"
    ]
  },
  {
    "id": "D05-10",
    "version": "2.0.0",
    "group": "金钱、消费与分担",
    "category": "negotiation",
    "title": "账单到来且此前未约定，双方等待对方先行动",
    "premise": "账单到来且此前未约定，双方等待对方先行动",
    "counterexample": "先给协商提示，不以谁没抢单判人品",
    "repair": "说清预算与约定，落实自愿分担；不按花费或性别设统一义务。",
    "sourceIds": [
      "C03",
      "E2", "E3", "E4",
      "B05",
      "B08",
      "X09",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "先给协商提示，不以谁没抢单判人品",
    "activityIds": [
      "A01"
    ]
  },
  {
    "id": "D06-01",
    "version": "2.0.0",
    "group": "吃饭、食物与个人习惯",
    "category": "boundary",
    "title": "已明确某食物不能吃，仍擅自加入或强迫尝试",
    "premise": "已明确某食物不能吃，仍擅自加入或强迫尝试",
    "counterexample": "不推断对方是假过敏，不要求用身体证明",
    "repair": "确认食物需要、分享与分工，必要时改菜；不把一顿饭当人品预测试验。",
    "sourceIds": [
      "C09",
      "X06",
      "X12",
      "B05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "不推断对方是假过敏，不要求用身体证明",
    "activityIds": [
      "A02",
      "A12",
      "A21"
    ]
  },
  {
    "id": "D06-02",
    "version": "2.0.0",
    "group": "吃饭、食物与个人习惯",
    "category": "friction",
    "title": "对方不想吃某菜，仍用不给面子持续劝食",
    "premise": "对方不想吃某菜，仍用不给面子持续劝食",
    "counterexample": "一次询问并接受拒绝可以",
    "repair": "确认食物需要、分享与分工，必要时改菜；不把一顿饭当人品预测试验。",
    "sourceIds": [
      "C09",
      "X06",
      "X12",
      "B05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "一次询问并接受拒绝可以",
    "activityIds": []
  },
  {
    "id": "D06-03",
    "version": "2.0.0",
    "group": "吃饭、食物与个人习惯",
    "category": "negotiation",
    "title": "未经确认替对方加辣、换饮品或决定份量",
    "premise": "未经确认替对方加辣、换饮品或决定份量",
    "counterexample": "对方已授权的代点单不判错",
    "repair": "确认食物需要、分享与分工，必要时改菜；不把一顿饭当人品预测试验。",
    "sourceIds": [
      "C09",
      "X06",
      "X12",
      "B05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "对方已授权的代点单不判错",
    "activityIds": []
  },
  {
    "id": "D06-04",
    "version": "2.0.0",
    "group": "吃饭、食物与个人习惯",
    "category": "friction",
    "title": "共同食物已约好留给对方，却在知情后全部拿走",
    "premise": "共同食物已约好留给对方，却在知情后全部拿走",
    "counterexample": "没听见、误会或无分配约定先澄清",
    "repair": "确认食物需要、分享与分工，必要时改菜；不把一顿饭当人品预测试验。",
    "sourceIds": [
      "C09",
      "X06",
      "X12",
      "B05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "没听见、误会或无分配约定先澄清",
    "activityIds": [
      "A03"
    ]
  },
  {
    "id": "D06-05",
    "version": "2.0.0",
    "group": "吃饭、食物与个人习惯",
    "category": "friction",
    "title": "对方表达想慢慢吃/还没吃饱，仍以赶进度催逼或嘲笑",
    "premise": "对方表达想慢慢吃/还没吃饱，仍以赶进度催逼或嘲笑",
    "counterexample": "确有预约限制可以协商，不强迫吞咽",
    "repair": "确认食物需要、分享与分工，必要时改菜；不把一顿饭当人品预测试验。",
    "sourceIds": [
      "C09",
      "X06",
      "X12",
      "B05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "确有预约限制可以协商，不强迫吞咽",
    "activityIds": []
  },
  {
    "id": "D06-06",
    "version": "2.0.0",
    "group": "吃饭、食物与个人习惯",
    "category": "boundary",
    "title": "对方拒绝共用餐具后仍伸入其杯碗或夹其食物",
    "premise": "对方拒绝共用餐具后仍伸入其杯碗或夹其食物",
    "counterexample": "双方自愿分享可以，不能推定人人介意",
    "repair": "确认食物需要、分享与分工，必要时改菜；不把一顿饭当人品预测试验。",
    "sourceIds": [
      "C09",
      "X06",
      "X12",
      "B05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "双方自愿分享可以，不能推定人人介意",
    "activityIds": []
  },
  {
    "id": "D06-07",
    "version": "2.0.0",
    "group": "吃饭、食物与个人习惯",
    "category": "friction",
    "title": "一方已说不想全程烤/煮，仍命令其为自己服务",
    "premise": "一方已说不想全程烤/煮，仍命令其为自己服务",
    "counterexample": "自愿分工、服务员代烤或能力差异不判错",
    "repair": "确认食物需要、分享与分工，必要时改菜；不把一顿饭当人品预测试验。",
    "sourceIds": [
      "C09",
      "X06",
      "X12",
      "B05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "自愿分工、服务员代烤或能力差异不判错",
    "activityIds": [
      "A03"
    ]
  },
  {
    "id": "D06-08",
    "version": "2.0.0",
    "group": "吃饭、食物与个人习惯",
    "category": "friction",
    "title": "用自己的饮食标准训斥对方自律、身材或价值",
    "premise": "用自己的饮食标准训斥对方自律、身材或价值",
    "counterexample": "双方愿意讨论健康经验可以，不擅自诊断",
    "repair": "确认食物需要、分享与分工，必要时改菜；不把一顿饭当人品预测试验。",
    "sourceIds": [
      "C09",
      "X06",
      "X12",
      "B05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "双方愿意讨论健康经验可以，不擅自诊断",
    "activityIds": []
  },
  {
    "id": "D06-09",
    "version": "2.0.0",
    "group": "吃饭、食物与个人习惯",
    "category": "friction",
    "title": "已说明饿了或菜会凉，仍强迫长时间等摆拍且不许先吃",
    "premise": "已说明饿了或菜会凉，仍强迫长时间等摆拍且不许先吃",
    "counterexample": "双方愿意先拍照不自动有问题",
    "repair": "确认食物需要、分享与分工，必要时改菜；不把一顿饭当人品预测试验。",
    "sourceIds": [
      "C09",
      "X06",
      "X12",
      "B05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "双方愿意先拍照不自动有问题",
    "activityIds": []
  },
  {
    "id": "D06-10",
    "version": "2.0.0",
    "group": "吃饭、食物与个人习惯",
    "category": "care",
    "title": "共享食物位置不便、份量不够或一方忙着操作",
    "premise": "共享食物位置不便、份量不够或一方忙着操作",
    "counterexample": "可以问是否调整；没注意到不记自私标签",
    "repair": "确认食物需要、分享与分工，必要时改菜；不把一顿饭当人品预测试验。",
    "sourceIds": [
      "C09",
      "X06",
      "X12",
      "B05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可以问是否调整；没注意到不记自私标签",
    "activityIds": []
  },
  {
    "id": "D07-01",
    "version": "2.0.0",
    "group": "走路、天气与体贴",
    "category": "friction",
    "title": "对方明确说脚痛或跟不上，仍故意快走并嘲讽",
    "premise": "对方明确说脚痛或跟不上，仍故意快走并嘲讽",
    "counterexample": "步幅差异或没注意到先给照顾提示",
    "repair": "先确认眼前需要，提供选择，不以性别规定谁必须牺牲。",
    "sourceIds": [
      "C01",
      "E3",
      "X06",
      "X12",
      "B06"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "步幅差异或没注意到先给照顾提示",
    "activityIds": [
      "A04",
      "A08",
      "A20"
    ]
  },
  {
    "id": "D07-02",
    "version": "2.0.0",
    "group": "走路、天气与体贴",
    "category": "care",
    "title": "道路一侧确有积水、车流或施工，需要商量站位",
    "premise": "道路一侧确有积水、车流或施工，需要商量站位",
    "counterexample": "不设男外女内的固定礼仪，安全因现场而变",
    "repair": "先确认眼前需要，提供选择，不以性别规定谁必须牺牲。",
    "sourceIds": [
      "C01",
      "E3",
      "X06",
      "X12",
      "B06"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "不设男外女内的固定礼仪，安全因现场而变",
    "activityIds": [
      "A08"
    ]
  },
  {
    "id": "D07-03",
    "version": "2.0.0",
    "group": "走路、天气与体贴",
    "category": "care",
    "title": "实际下雨且同用一把伞，有人肩膀被淋湿",
    "premise": "实际下雨且同用一把伞，有人肩膀被淋湿",
    "counterexample": "调整伞位、找屋檐；不要求只遮一方",
    "repair": "先确认眼前需要，提供选择，不以性别规定谁必须牺牲。",
    "sourceIds": [
      "C01",
      "E3",
      "X06",
      "X12",
      "B06"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "调整伞位、找屋檐；不要求只遮一方",
    "activityIds": [
      "A08",
      "A21"
    ]
  },
  {
    "id": "D07-04",
    "version": "2.0.0",
    "group": "走路、天气与体贴",
    "category": "friction",
    "title": "对方说累、冷或不舒服，仍羞辱其扫兴并禁止休息",
    "premise": "对方说累、冷或不舒服，仍羞辱其扫兴并禁止休息",
    "counterexample": "体力不同不是谁的错，可以调整/结束",
    "repair": "先确认眼前需要，提供选择，不以性别规定谁必须牺牲。",
    "sourceIds": [
      "C01",
      "E3",
      "X06",
      "X12",
      "B06"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "体力不同不是谁的错，可以调整/结束",
    "activityIds": [
      "A08",
      "A18",
      "A21"
    ]
  },
  {
    "id": "D07-05",
    "version": "2.0.0",
    "group": "走路、天气与体贴",
    "category": "boundary",
    "title": "对方拒绝帮助后仍抢包、拉手或接管其物品",
    "premise": "对方拒绝帮助后仍抢包、拉手或接管其物品",
    "counterexample": "紧急避险另看具体事实；日常帮助先问",
    "repair": "先确认眼前需要，提供选择，不以性别规定谁必须牺牲。",
    "sourceIds": [
      "C01",
      "E3",
      "X06",
      "X12",
      "B06"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "紧急避险另看具体事实；日常帮助先问",
    "activityIds": []
  },
  {
    "id": "D07-06",
    "version": "2.0.0",
    "group": "走路、天气与体贴",
    "category": "negotiation",
    "title": "双方对路线/交通方式有不同偏好，尚未确认可行选择",
    "premise": "双方对路线/交通方式有不同偏好，尚未确认可行选择",
    "counterexample": "熟路带路本身正常；强行夺走选择或限制离场另判",
    "repair": "先确认眼前需要，提供选择，不以性别规定谁必须牺牲。",
    "sourceIds": [
      "C01",
      "E3",
      "X06",
      "X12",
      "B06"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "熟路带路本身正常；强行夺走选择或限制离场另判",
    "activityIds": [
      "A09",
      "A20"
    ]
  },
  {
    "id": "D07-07",
    "version": "2.0.0",
    "group": "走路、天气与体贴",
    "category": "care",
    "title": "对方明确需要坐下、安静或室内环境，现场有可行备选",
    "premise": "对方明确需要坐下、安静或室内环境，现场有可行备选",
    "counterexample": "可以询问换位置，不能替其诊断身体状况",
    "repair": "先确认眼前需要，提供选择，不以性别规定谁必须牺牲。",
    "sourceIds": [
      "C01",
      "E3",
      "X06",
      "X12",
      "B06"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可以询问换位置，不能替其诊断身体状况",
    "activityIds": []
  },
  {
    "id": "D07-08",
    "version": "2.0.0",
    "group": "走路、天气与体贴",
    "category": "care",
    "title": "上车时手上东西多，可询问是否帮忙开门/拿东西",
    "premise": "上车时手上东西多，可询问是否帮忙开门/拿东西",
    "counterexample": "没开门不算缺教养，拒绝帮助就尊重",
    "repair": "先确认眼前需要，提供选择，不以性别规定谁必须牺牲。",
    "sourceIds": [
      "C01",
      "E3",
      "X06",
      "X12",
      "B06"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "没开门不算缺教养，拒绝帮助就尊重",
    "activityIds": []
  },
  {
    "id": "D07-09",
    "version": "2.0.0",
    "group": "走路、天气与体贴",
    "category": "friction",
    "title": "以照顾为名坚持做对方已说不需要的事，并要求感激",
    "premise": "以照顾为名坚持做对方已说不需要的事，并要求感激",
    "counterexample": "一次好意未被接受不证明双方谁有问题",
    "repair": "先确认眼前需要，提供选择，不以性别规定谁必须牺牲。",
    "sourceIds": [
      "C01",
      "E3",
      "X06",
      "X12",
      "B06"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "一次好意未被接受不证明双方谁有问题",
    "activityIds": []
  },
  {
    "id": "D07-10",
    "version": "2.0.0",
    "group": "走路、天气与体贴",
    "category": "negotiation",
    "title": "一方想独自走一段/各自返程，另一方不理解",
    "premise": "一方想独自走一段/各自返程，另一方不理解",
    "counterexample": "先协商，保持安全自主不是缺乏好感的证据",
    "repair": "先确认眼前需要，提供选择，不以性别规定谁必须牺牲。",
    "sourceIds": [
      "C01",
      "E3",
      "X06",
      "X12",
      "B06"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "先协商，保持安全自主不是缺乏好感的证据",
    "activityIds": []
  },
  {
    "id": "D08-01",
    "version": "2.0.0",
    "group": "手作、游戏与运动协作",
    "category": "friction",
    "title": "对方想自己做，仍抢过工具替其完成",
    "premise": "对方想自己做，仍抢过工具替其完成",
    "counterexample": "对方请求帮助或同意示范可以",
    "repair": "允许自己试、约定玩法和强度，必要时找工作人员。",
    "sourceIds": [
      "N5",
      "R4",
      "B08",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "对方请求帮助或同意示范可以",
    "activityIds": [
      "A11"
    ]
  },
  {
    "id": "D08-02",
    "version": "2.0.0",
    "group": "手作、游戏与运动协作",
    "category": "friction",
    "title": "不顾对方明确选择，强制按自己审美改作品",
    "premise": "不顾对方明确选择，强制按自己审美改作品",
    "counterexample": "可以建议，不把审美差异当水平高低",
    "repair": "允许自己试、约定玩法和强度，必要时找工作人员。",
    "sourceIds": [
      "N5",
      "R4",
      "B08",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可以建议，不把审美差异当水平高低",
    "activityIds": [
      "A11",
      "A13"
    ]
  },
  {
    "id": "D08-03",
    "version": "2.0.0",
    "group": "手作、游戏与运动协作",
    "category": "friction",
    "title": "因输赢或手笨辱骂对方能力、性别或人格",
    "premise": "因输赢或手笨辱骂对方能力、性别或人格",
    "counterexample": "双方欢迎的竞争玩笑需看反馈",
    "repair": "允许自己试、约定玩法和强度，必要时找工作人员。",
    "sourceIds": [
      "N5",
      "R4",
      "B08",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "双方欢迎的竞争玩笑需看反馈",
    "activityIds": [
      "A14",
      "A15"
    ]
  },
  {
    "id": "D08-04",
    "version": "2.0.0",
    "group": "手作、游戏与运动协作",
    "category": "negotiation",
    "title": "一方想练习、一方想计分，却未经确认直接按高强度比赛",
    "premise": "一方想练习、一方想计分，却未经确认直接按高强度比赛",
    "counterexample": "玩法冲突先协商，不给低水平扣分",
    "repair": "允许自己试、约定玩法和强度，必要时找工作人员。",
    "sourceIds": [
      "N5",
      "R4",
      "B08",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "玩法冲突先协商，不给低水平扣分",
    "activityIds": [
      "A14",
      "A16",
      "A18"
    ]
  },
  {
    "id": "D08-05",
    "version": "2.0.0",
    "group": "手作、游戏与运动协作",
    "category": "boundary",
    "title": "无视场地/教练明确限制，逼对方进行危险动作",
    "premise": "无视场地/教练明确限制，逼对方进行危险动作",
    "counterexample": "具体安全信息由引擎/工作人员设定，不凭模型猜",
    "repair": "允许自己试、约定玩法和强度，必要时找工作人员。",
    "sourceIds": [
      "N5",
      "R4",
      "B08",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "具体安全信息由引擎/工作人员设定，不凭模型猜",
    "activityIds": [
      "A19",
      "A20"
    ]
  },
  {
    "id": "D08-06",
    "version": "2.0.0",
    "group": "手作、游戏与运动协作",
    "category": "friction",
    "title": "合作出现失误就全归咎对方，拒绝已证实的自身责任",
    "premise": "合作出现失误就全归咎对方，拒绝已证实的自身责任",
    "counterexample": "合理复盘技术问题可以，不要求平均担责",
    "repair": "允许自己试、约定玩法和强度，必要时找工作人员。",
    "sourceIds": [
      "N5",
      "R4",
      "B08",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "合理复盘技术问题可以，不要求平均担责",
    "activityIds": [
      "A12"
    ]
  },
  {
    "id": "D08-07",
    "version": "2.0.0",
    "group": "手作、游戏与运动协作",
    "category": "friction",
    "title": "明示故意破坏对方作品/游戏成果以取乐或赢",
    "premise": "明示故意破坏对方作品/游戏成果以取乐或赢",
    "counterexample": "双方事先同意的游戏机制不算破坏",
    "repair": "允许自己试、约定玩法和强度，必要时找工作人员。",
    "sourceIds": [
      "N5",
      "R4",
      "B08",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "双方事先同意的游戏机制不算破坏",
    "activityIds": []
  },
  {
    "id": "D08-08",
    "version": "2.0.0",
    "group": "手作、游戏与运动协作",
    "category": "friction",
    "title": "共享代币、材料或时段有约定，单方占用并拒绝归还",
    "premise": "共享代币、材料或时段有约定，单方占用并拒绝归还",
    "counterexample": "个人物品可自主安排，先核对所有权",
    "repair": "允许自己试、约定玩法和强度，必要时找工作人员。",
    "sourceIds": [
      "N5",
      "R4",
      "B08",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "个人物品可自主安排，先核对所有权",
    "activityIds": [
      "A17"
    ]
  },
  {
    "id": "D08-09",
    "version": "2.0.0",
    "group": "手作、游戏与运动协作",
    "category": "friction",
    "title": "对方在专注制作，已请安静仍持续催回应/证明在乎",
    "premise": "对方在专注制作，已请安静仍持续催回应/证明在乎",
    "counterexample": "安静做事不代表不投入约会",
    "repair": "允许自己试、约定玩法和强度，必要时找工作人员。",
    "sourceIds": [
      "N5",
      "R4",
      "B08",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "安静做事不代表不投入约会",
    "activityIds": []
  },
  {
    "id": "D08-10",
    "version": "2.0.0",
    "group": "手作、游戏与运动协作",
    "category": "boundary",
    "title": "擅动安全装备或要求对方绕过专业检查",
    "premise": "擅动安全装备或要求对方绕过专业检查",
    "counterexample": "帮忙搬运普通材料与安全装备操作分开",
    "repair": "允许自己试、约定玩法和强度，必要时找工作人员。",
    "sourceIds": [
      "N5",
      "R4",
      "B08",
      "E5"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "帮忙搬运普通材料与安全装备操作分开",
    "activityIds": [
      "A19"
    ]
  },
  {
    "id": "D09-01",
    "version": "2.0.0",
    "group": "公共空间、文化活动与服务人员",
    "category": "friction",
    "title": "上菜/服务有问题时辱骂、威胁或用职业羞辱工作人员",
    "premise": "上菜/服务有问题时辱骂、威胁或用职业羞辱工作人员",
    "counterexample": "礼貌催单、退换、投诉与拒绝不安全餐食可以",
    "repair": "向工作人员合理沟通，减少干扰；不用消费和身份作为支配他人的理由。",
    "sourceIds": [
      "B05",
      "B06",
      "E6",
      "R4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "礼貌催单、退换、投诉与拒绝不安全餐食可以",
    "activityIds": [
      "A02"
    ]
  },
  {
    "id": "D09-02",
    "version": "2.0.0",
    "group": "公共空间、文化活动与服务人员",
    "category": "friction",
    "title": "强行插队、逼他人让位，已有明确现场行为证据",
    "premise": "强行插队、逼他人让位，已有明确现场行为证据",
    "counterexample": "工作人员安排或他人自愿让位不判错；不猜是否想表现有面子",
    "repair": "向工作人员合理沟通，减少干扰；不用消费和身份作为支配他人的理由。",
    "sourceIds": [
      "B05",
      "B06",
      "E6",
      "R4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "工作人员安排或他人自愿让位不判错；不猜是否想表现有面子",
    "activityIds": [
      "A04"
    ]
  },
  {
    "id": "D09-03",
    "version": "2.0.0",
    "group": "公共空间、文化活动与服务人员",
    "category": "friction",
    "title": "拍摄/摆拍已挡通道或影响他人，被提醒后仍继续",
    "premise": "拍摄/摆拍已挡通道或影响他人，被提醒后仍继续",
    "counterexample": "短暂且不妨碍他人的拍摄可以",
    "repair": "向工作人员合理沟通，减少干扰；不用消费和身份作为支配他人的理由。",
    "sourceIds": [
      "B05",
      "B06",
      "E6",
      "R4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "短暂且不妨碍他人的拍摄可以",
    "activityIds": [
      "A10"
    ]
  },
  {
    "id": "D09-04",
    "version": "2.0.0",
    "group": "公共空间、文化活动与服务人员",
    "category": "friction",
    "title": "放映/演出中持续大声说话，已被提醒仍不收敛",
    "premise": "放映/演出中持续大声说话，已被提醒仍不收敛",
    "counterexample": "必要低声交流、无障碍需求不一概负面化",
    "repair": "向工作人员合理沟通，减少干扰；不用消费和身份作为支配他人的理由。",
    "sourceIds": [
      "B05",
      "B06",
      "E6",
      "R4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "必要低声交流、无障碍需求不一概负面化",
    "activityIds": [
      "A05",
      "A24"
    ]
  },
  {
    "id": "D09-05",
    "version": "2.0.0",
    "group": "公共空间、文化活动与服务人员",
    "category": "boundary",
    "title": "已明确禁止拍摄/触碰的现场，仍强拉对方参与",
    "premise": "已明确禁止拍摄/触碰的现场，仍强拉对方参与",
    "counterexample": "规则须是本场真实设定，不凭常识补造",
    "repair": "向工作人员合理沟通，减少干扰；不用消费和身份作为支配他人的理由。",
    "sourceIds": [
      "B05",
      "B06",
      "E6",
      "R4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "规则须是本场真实设定，不凭常识补造",
    "activityIds": [
      "A06"
    ]
  },
  {
    "id": "D09-06",
    "version": "2.0.0",
    "group": "公共空间、文化活动与服务人员",
    "category": "friction",
    "title": "对方不愿与陌生人冲突，仍借保护之名强迫其介入",
    "premise": "对方不愿与陌生人冲突，仍借保护之名强迫其介入",
    "counterexample": "合理求助、紧急避险应单独处理",
    "repair": "向工作人员合理沟通，减少干扰；不用消费和身份作为支配他人的理由。",
    "sourceIds": [
      "B05",
      "B06",
      "E6",
      "R4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "合理求助、紧急避险应单独处理",
    "activityIds": []
  },
  {
    "id": "D09-07",
    "version": "2.0.0",
    "group": "公共空间、文化活动与服务人员",
    "category": "friction",
    "title": "对方请求避开烟味后，仍近距离吸烟并羞辱其需求",
    "premise": "对方请求避开烟味后，仍近距离吸烟并羞辱其需求",
    "counterexample": "个人习惯可协商，不给吸烟者贴人格标签",
    "repair": "向工作人员合理沟通，减少干扰；不用消费和身份作为支配他人的理由。",
    "sourceIds": [
      "B05",
      "B06",
      "E6",
      "R4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "个人习惯可协商，不给吸烟者贴人格标签",
    "activityIds": []
  },
  {
    "id": "D09-08",
    "version": "2.0.0",
    "group": "公共空间、文化活动与服务人员",
    "category": "friction",
    "title": "明知公共区域需共同维护，仍要求同伴替自己清理故意留下的垃圾",
    "premise": "明知公共区域需共同维护，仍要求同伴替自己清理故意留下的垃圾",
    "counterexample": "意外洒落、身体困难可请求帮助",
    "repair": "向工作人员合理沟通，减少干扰；不用消费和身份作为支配他人的理由。",
    "sourceIds": [
      "B05",
      "B06",
      "E6",
      "R4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "意外洒落、身体困难可请求帮助",
    "activityIds": []
  },
  {
    "id": "D09-09",
    "version": "2.0.0",
    "group": "公共空间、文化活动与服务人员",
    "category": "friction",
    "title": "嘲笑对方不懂餐具、品牌或展览礼仪并公开“教育”",
    "premise": "嘲笑对方不懂餐具、品牌或展览礼仪并公开“教育”",
    "counterexample": "受邀介绍使用方法不算爹味",
    "repair": "向工作人员合理沟通，减少干扰；不用消费和身份作为支配他人的理由。",
    "sourceIds": [
      "B05",
      "B06",
      "E6",
      "R4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "受邀介绍使用方法不算爹味",
    "activityIds": []
  },
  {
    "id": "D09-10",
    "version": "2.0.0",
    "group": "公共空间、文化活动与服务人员",
    "category": "care",
    "title": "噪音、拥挤或站位影响同行者看清/听清",
    "premise": "噪音、拥挤或站位影响同行者看清/听清",
    "counterexample": "可以换座/站位/求助；不把敏感或听力差异判错",
    "repair": "向工作人员合理沟通，减少干扰；不用消费和身份作为支配他人的理由。",
    "sourceIds": [
      "B05",
      "B06",
      "E6",
      "R4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可以换座/站位/求助；不把敏感或听力差异判错",
    "activityIds": [
      "A24"
    ]
  },
  {
    "id": "D10-01",
    "version": "2.0.0",
    "group": "饮酒、夜场与状态",
    "category": "boundary",
    "title": "明确不喝或想停后，仍劝酒、逼喝或起哄",
    "premise": "明确不喝或想停后，仍劝酒、逼喝或起哄",
    "counterexample": "询问饮品并接受无酒精选择可以",
    "repair": "尊重不喝、停止推进、保持能独立离开的条件，不以饮酒制造义务。",
    "sourceIds": [
      "E5",
      "R5",
      "B06",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "询问饮品并接受无酒精选择可以",
    "activityIds": [
      "A22"
    ]
  },
  {
    "id": "D10-02",
    "version": "2.0.0",
    "group": "饮酒、夜场与状态",
    "category": "boundary",
    "title": "对方不知情/不同意时，往其饮品添加酒精或其他成分",
    "premise": "对方不知情/不同意时，往其饮品添加酒精或其他成分",
    "counterexample": "明确同意的调饮需按已知内容执行",
    "repair": "尊重不喝、停止推进、保持能独立离开的条件，不以饮酒制造义务。",
    "sourceIds": [
      "E5",
      "R5",
      "B06",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "明确同意的调饮需按已知内容执行",
    "activityIds": []
  },
  {
    "id": "D10-03",
    "version": "2.0.0",
    "group": "饮酒、夜场与状态",
    "category": "boundary",
    "title": "利用明显无法清楚决定的状态取得亲密/隐私答应",
    "premise": "利用明显无法清楚决定的状态取得亲密/隐私答应",
    "counterexample": "不能用此前同意或没反对替代当前有效意愿",
    "repair": "尊重不喝、停止推进、保持能独立离开的条件，不以饮酒制造义务。",
    "sourceIds": [
      "E5",
      "R5",
      "B06",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "不能用此前同意或没反对替代当前有效意愿",
    "activityIds": []
  },
  {
    "id": "D10-04",
    "version": "2.0.0",
    "group": "饮酒、夜场与状态",
    "category": "friction",
    "title": "以酒量、是否喝酒羞辱成熟度、性别或诚意",
    "premise": "以酒量、是否喝酒羞辱成熟度、性别或诚意",
    "counterexample": "聊口味或自愿品饮可以",
    "repair": "尊重不喝、停止推进、保持能独立离开的条件，不以饮酒制造义务。",
    "sourceIds": [
      "E5",
      "R5",
      "B06",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "聊口味或自愿品饮可以",
    "activityIds": []
  },
  {
    "id": "D10-05",
    "version": "2.0.0",
    "group": "饮酒、夜场与状态",
    "category": "boundary",
    "title": "已喝酒且本场明确不具安全驾驶条件，仍要求同伴坐自己车",
    "premise": "已喝酒且本场明确不具安全驾驶条件，仍要求同伴坐自己车",
    "counterexample": "不猜血液指标；可选独立安全返程",
    "repair": "尊重不喝、停止推进、保持能独立离开的条件，不以饮酒制造义务。",
    "sourceIds": [
      "E5",
      "R5",
      "B06",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "不猜血液指标；可选独立安全返程",
    "activityIds": []
  },
  {
    "id": "D10-06",
    "version": "2.0.0",
    "group": "饮酒、夜场与状态",
    "category": "negotiation",
    "title": "点了整瓶或额外一轮，未经确认就要求共同承担消费",
    "premise": "点了整瓶或额外一轮，未经确认就要求共同承担消费",
    "counterexample": "自愿自己买单也不意味着别人必须喝",
    "repair": "尊重不喝、停止推进、保持能独立离开的条件，不以饮酒制造义务。",
    "sourceIds": [
      "E5",
      "R5",
      "B06",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "自愿自己买单也不意味着别人必须喝",
    "activityIds": []
  },
  {
    "id": "D10-07",
    "version": "2.0.0",
    "group": "饮酒、夜场与状态",
    "category": "care",
    "title": "对方表示头晕、疲惫或需要水和安静环境",
    "premise": "对方表示头晕、疲惫或需要水和安静环境",
    "counterexample": "先询问、找工作人员；不责怪喝酒者遭遇风险",
    "repair": "尊重不喝、停止推进、保持能独立离开的条件，不以饮酒制造义务。",
    "sourceIds": [
      "E5",
      "R5",
      "B06",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "先询问、找工作人员；不责怪喝酒者遭遇风险",
    "activityIds": []
  },
  {
    "id": "D10-08",
    "version": "2.0.0",
    "group": "饮酒、夜场与状态",
    "category": "boundary",
    "title": "对方不想跳舞/上台，仍靠拉拽或围观起哄迫其参加",
    "premise": "对方不想跳舞/上台，仍靠拉拽或围观起哄迫其参加",
    "counterexample": "主动邀请并接受拒绝可以",
    "repair": "尊重不喝、停止推进、保持能独立离开的条件，不以饮酒制造义务。",
    "sourceIds": [
      "E5",
      "R5",
      "B06",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "主动邀请并接受拒绝可以",
    "activityIds": [
      "A23"
    ]
  },
  {
    "id": "D10-09",
    "version": "2.0.0",
    "group": "饮酒、夜场与状态",
    "category": "negotiation",
    "title": "现场太吵，对方想去安静公共区域，另一方仍想留在舞池",
    "premise": "现场太吵，对方想去安静公共区域，另一方仍想留在舞池",
    "counterexample": "可以各自决定或协商，不将偏好当扫兴",
    "repair": "尊重不喝、停止推进、保持能独立离开的条件，不以饮酒制造义务。",
    "sourceIds": [
      "E5",
      "R5",
      "B06",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可以各自决定或协商，不将偏好当扫兴",
    "activityIds": [
      "A23"
    ]
  },
  {
    "id": "D10-10",
    "version": "2.0.0",
    "group": "饮酒、夜场与状态",
    "category": "friction",
    "title": "醉后以“记不清/喝多了”要求他人不能提已发生的不适",
    "premise": "醉后以“记不清/喝多了”要求他人不能提已发生的不适",
    "counterexample": "状态可解释行为，但不取消停止、尊重与修复",
    "repair": "尊重不喝、停止推进、保持能独立离开的条件，不以饮酒制造义务。",
    "sourceIds": [
      "E5",
      "R5",
      "B06",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "状态可解释行为，但不取消停止、尊重与修复",
    "activityIds": []
  },
  {
    "id": "D11-01",
    "version": "2.0.0",
    "group": "亲密试探与身体自主",
    "category": "boundary",
    "title": "未获当下有效授权即请求执行接触，或明确拒绝后仍尝试同类动作",
    "premise": "未获当下有效授权即请求执行接触，或明确拒绝后仍尝试同类动作",
    "counterexample": "询问意愿并等待同意可以；请求/被阻止/已执行按引擎事实分开",
    "repair": "停止未经确认的推进，恢复空间，允许撤回与退出；不是提供绕过拒绝的话术。",
    "sourceIds": [
      "R5",
      "E5",
      "X04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "询问意愿并等待同意可以；请求/被阻止/已执行按引擎事实分开",
    "activityIds": []
  },
  {
    "id": "D11-02",
    "version": "2.0.0",
    "group": "亲密试探与身体自主",
    "category": "boundary",
    "title": "把一次牵手/拥抱的许可扩大成其他接触许可",
    "premise": "把一次牵手/拥抱的许可扩大成其他接触许可",
    "counterexample": "同意针对具体行为和当下，不推定自动升级",
    "repair": "停止未经确认的推进，恢复空间，允许撤回与退出；不是提供绕过拒绝的话术。",
    "sourceIds": [
      "R5",
      "E5",
      "X04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "同意针对具体行为和当下，不推定自动升级",
    "activityIds": []
  },
  {
    "id": "D11-03",
    "version": "2.0.0",
    "group": "亲密试探与身体自主",
    "category": "boundary",
    "title": "对方中途撤回，仍以已经开始为由继续",
    "premise": "对方中途撤回，仍以已经开始为由继续",
    "counterexample": "撤回可以发生在任何阶段",
    "repair": "停止未经确认的推进，恢复空间，允许撤回与退出；不是提供绕过拒绝的话术。",
    "sourceIds": [
      "R5",
      "E5",
      "X04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "撤回可以发生在任何阶段",
    "activityIds": []
  },
  {
    "id": "D11-04",
    "version": "2.0.0",
    "group": "亲密试探与身体自主",
    "category": "boundary",
    "title": "把沉默、僵住或没躲开当成已同意",
    "premise": "把沉默、僵住或没躲开当成已同意",
    "counterexample": "不知道时先停下确认，不能用神情猜许可",
    "repair": "停止未经确认的推进，恢复空间，允许撤回与退出；不是提供绕过拒绝的话术。",
    "sourceIds": [
      "R5",
      "E5",
      "X04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "不知道时先停下确认，不能用神情猜许可",
    "activityIds": [
      "A23"
    ]
  },
  {
    "id": "D11-05",
    "version": "2.0.0",
    "group": "亲密试探与身体自主",
    "category": "boundary",
    "title": "用“看完电影/气氛到了”声称亲密是必走流程",
    "premise": "用“看完电影/气氛到了”声称亲密是必走流程",
    "counterexample": "环境浪漫不产生义务",
    "repair": "停止未经确认的推进，恢复空间，允许撤回与退出；不是提供绕过拒绝的话术。",
    "sourceIds": [
      "R5",
      "E5",
      "X04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "环境浪漫不产生义务",
    "activityIds": [
      "A05"
    ]
  },
  {
    "id": "D11-06",
    "version": "2.0.0",
    "group": "亲密试探与身体自主",
    "category": "boundary",
    "title": "以恋人/伴侣身份否定对方本次拒绝权",
    "premise": "以恋人/伴侣身份否定对方本次拒绝权",
    "counterexample": "长期关系也保留自主",
    "repair": "停止未经确认的推进，恢复空间，允许撤回与退出；不是提供绕过拒绝的话术。",
    "sourceIds": [
      "R5",
      "E5",
      "X04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "长期关系也保留自主",
    "activityIds": []
  },
  {
    "id": "D11-07",
    "version": "2.0.0",
    "group": "亲密试探与身体自主",
    "category": "boundary",
    "title": "以对方过去曾愿意为由要求这次不能拒绝",
    "premise": "以对方过去曾愿意为由要求这次不能拒绝",
    "counterexample": "偏好和边界可以变化",
    "repair": "停止未经确认的推进，恢复空间，允许撤回与退出；不是提供绕过拒绝的话术。",
    "sourceIds": [
      "R5",
      "E5",
      "X04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "偏好和边界可以变化",
    "activityIds": []
  },
  {
    "id": "D11-08",
    "version": "2.0.0",
    "group": "亲密试探与身体自主",
    "category": "friction",
    "title": "把拒绝解释为不正常、没经验或故作矜持进行羞辱",
    "premise": "把拒绝解释为不正常、没经验或故作矜持进行羞辱",
    "counterexample": "可以表达失望，但不贬低边界",
    "repair": "停止未经确认的推进，恢复空间，允许撤回与退出；不是提供绕过拒绝的话术。",
    "sourceIds": [
      "R5",
      "E5",
      "X04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可以表达失望，但不贬低边界",
    "activityIds": []
  },
  {
    "id": "D11-09",
    "version": "2.0.0",
    "group": "亲密试探与身体自主",
    "category": "boundary",
    "title": "借教学、拥挤或照顾之名触碰，且拒绝后的停止要求被忽略",
    "premise": "借教学、拥挤或照顾之名触碰，且拒绝后的停止要求被忽略",
    "counterexample": "紧急避险与主动同意帮助按具体事实处理",
    "repair": "停止未经确认的推进，恢复空间，允许撤回与退出；不是提供绕过拒绝的话术。",
    "sourceIds": [
      "R5",
      "E5",
      "X04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "紧急避险与主动同意帮助按具体事实处理",
    "activityIds": [
      "A11",
      "A15"
    ]
  },
  {
    "id": "D11-10",
    "version": "2.0.0",
    "group": "亲密试探与身体自主",
    "category": "friction",
    "title": "接受拒绝后又用冷嘲热讽让对方为此内疚",
    "premise": "接受拒绝后又用冷嘲热讽让对方为此内疚",
    "counterexample": "需要独处可以说明，不以惩罚逼改变决定",
    "repair": "停止未经确认的推进，恢复空间，允许撤回与退出；不是提供绕过拒绝的话术。",
    "sourceIds": [
      "R5",
      "E5",
      "X04",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "需要独处可以说明，不以惩罚逼改变决定",
    "activityIds": []
  },
  {
    "id": "D12-01",
    "version": "2.0.0",
    "group": "照片、隐私与授权用途",
    "category": "boundary",
    "title": "未获有效授权就请求拍摄对方，或明确拒绝后仍尝试拍摄/偷拍",
    "premise": "未获有效授权就请求拍摄对方，或明确拒绝后仍尝试拍摄/偷拍",
    "counterexample": "可先询问；只拍自己的物品另看范围，被阻止不记录为已经拍到",
    "repair": "按对象、内容、用途、时点核对许可；已拍不等于已获发布/转发许可。",
    "sourceIds": [
      "B04",
      "E6",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可先询问；只拍自己的物品另看范围，被阻止不记录为已经拍到",
    "activityIds": [
      "A10",
      "A16"
    ]
  },
  {
    "id": "D12-02",
    "version": "2.0.0",
    "group": "照片、隐私与授权用途",
    "category": "boundary",
    "title": "允许拍照却未允许发布，仍公开带人像的约会内容",
    "premise": "允许拍照却未允许发布，仍公开带人像的约会内容",
    "counterexample": "拍摄和发布分别确认",
    "repair": "按对象、内容、用途、时点核对许可；已拍不等于已获发布/转发许可。",
    "sourceIds": [
      "B04",
      "E6",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "拍摄和发布分别确认",
    "activityIds": []
  },
  {
    "id": "D12-03",
    "version": "2.0.0",
    "group": "照片、隐私与授权用途",
    "category": "boundary",
    "title": "未获同意公开实时位置、住处或行程",
    "premise": "未获同意公开实时位置、住处或行程",
    "counterexample": "自愿共享与模糊场景照片需看可识别程度",
    "repair": "按对象、内容、用途、时点核对许可；已拍不等于已获发布/转发许可。",
    "sourceIds": [
      "B04",
      "E6",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "自愿共享与模糊场景照片需看可识别程度",
    "activityIds": []
  },
  {
    "id": "D12-04",
    "version": "2.0.0",
    "group": "照片、隐私与授权用途",
    "category": "boundary",
    "title": "借手机查路线，却翻聊天、相册或代发内容",
    "premise": "借手机查路线，却翻聊天、相册或代发内容",
    "counterexample": "授权限于具体用途，意外看到不等于故意翻查",
    "repair": "按对象、内容、用途、时点核对许可；已拍不等于已获发布/转发许可。",
    "sourceIds": [
      "B04",
      "E6",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "授权限于具体用途，意外看到不等于故意翻查",
    "activityIds": []
  },
  {
    "id": "D12-05",
    "version": "2.0.0",
    "group": "照片、隐私与授权用途",
    "category": "boundary",
    "title": "对方撤回授权后，仍用以前可以为由继续使用",
    "premise": "对方撤回授权后，仍用以前可以为由继续使用",
    "counterexample": "已授权行为也需尊重后续撤回",
    "repair": "按对象、内容、用途、时点核对许可；已拍不等于已获发布/转发许可。",
    "sourceIds": [
      "B04",
      "E6",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "已授权行为也需尊重后续撤回",
    "activityIds": []
  },
  {
    "id": "D12-06",
    "version": "2.0.0",
    "group": "照片、隐私与授权用途",
    "category": "boundary",
    "title": "强索密码、定位或设备检查作为忠诚证明",
    "premise": "强索密码、定位或设备检查作为忠诚证明",
    "counterexample": "自愿单次协助不等于永久查阅权",
    "repair": "按对象、内容、用途、时点核对许可；已拍不等于已获发布/转发许可。",
    "sourceIds": [
      "B04",
      "E6",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "自愿单次协助不等于永久查阅权",
    "activityIds": []
  },
  {
    "id": "D12-07",
    "version": "2.0.0",
    "group": "照片、隐私与授权用途",
    "category": "boundary",
    "title": "要求提供第三方电话/住址，被拒仍施压",
    "premise": "要求提供第三方电话/住址，被拒仍施压",
    "counterexample": "介绍联系可先征得第三方意愿",
    "repair": "按对象、内容、用途、时点核对许可；已拍不等于已获发布/转发许可。",
    "sourceIds": [
      "B04",
      "E6",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "介绍联系可先征得第三方意愿",
    "activityIds": []
  },
  {
    "id": "D12-08",
    "version": "2.0.0",
    "group": "照片、隐私与授权用途",
    "category": "boundary",
    "title": "未经确认把私人经历/聊天转发群聊供他人点评取笑",
    "premise": "未经确认把私人经历/聊天转发群聊供他人点评取笑",
    "counterexample": "向可信支持者求助、必要安全举证不能一概等同恶意曝光",
    "repair": "按对象、内容、用途、时点核对许可；已拍不等于已获发布/转发许可。",
    "sourceIds": [
      "B04",
      "E6",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "向可信支持者求助、必要安全举证不能一概等同恶意曝光",
    "activityIds": []
  },
  {
    "id": "D12-09",
    "version": "2.0.0",
    "group": "照片、隐私与授权用途",
    "category": "boundary",
    "title": "要求对方拍私密身体照片，拒绝后持续催促或威胁",
    "premise": "要求对方拍私密身体照片，拒绝后持续催促或威胁",
    "counterexample": "无需说明拒绝理由，不用关系进度推定许可",
    "repair": "按对象、内容、用途、时点核对许可；已拍不等于已获发布/转发许可。",
    "sourceIds": [
      "B04",
      "E6",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "无需说明拒绝理由，不用关系进度推定许可",
    "activityIds": []
  },
  {
    "id": "D12-10",
    "version": "2.0.0",
    "group": "照片、隐私与授权用途",
    "category": "friction",
    "title": "照顾过程中持续拍摄，对方已要停拍却仍优先录素材",
    "premise": "照顾过程中持续拍摄，对方已要停拍却仍优先录素材",
    "counterexample": "双方自愿记录可以，不凭外观推断作秀动机",
    "repair": "按对象、内容、用途、时点核对许可；已拍不等于已获发布/转发许可。",
    "sourceIds": [
      "B04",
      "E6",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "双方自愿记录可以，不凭外观推断作秀动机",
    "activityIds": []
  },
  {
    "id": "D13-01",
    "version": "2.0.0",
    "group": "数字互动、注意力与私人空间",
    "category": "friction",
    "title": "对方明确希望专心交谈，仍持续刷无关内容且嘲笑其需求",
    "premise": "对方明确希望专心交谈，仍持续刷无关内容且嘲笑其需求",
    "counterexample": "回重要消息、看地图、辅助沟通要排除",
    "repair": "说明必要联络，协商注意力与联系预期，不靠计时器推断喜欢程度。",
    "sourceIds": [
      "R3",
      "B04",
      "X03",
      "X05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "回重要消息、看地图、辅助沟通要排除",
    "activityIds": [
      "A01"
    ]
  },
  {
    "id": "D13-02",
    "version": "2.0.0",
    "group": "数字互动、注意力与私人空间",
    "category": "negotiation",
    "title": "需要处理紧急联络而暂离交流，双方对等待安排不清楚",
    "premise": "需要处理紧急联络而暂离交流，双方对等待安排不清楚",
    "counterexample": "先说明和协商，不把有工作/家庭责任算雷",
    "repair": "说明必要联络，协商注意力与联系预期，不靠计时器推断喜欢程度。",
    "sourceIds": [
      "R3",
      "B04",
      "X03",
      "X05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "先说明和协商，不把有工作/家庭责任算雷",
    "activityIds": []
  },
  {
    "id": "D13-03",
    "version": "2.0.0",
    "group": "数字互动、注意力与私人空间",
    "category": "boundary",
    "title": "要求每条消息立刻回，否则威胁惩罚、曝光或限制活动",
    "premise": "要求每条消息立刻回，否则威胁惩罚、曝光或限制活动",
    "counterexample": "表达希望多联系或离开不合适关系可以",
    "repair": "说明必要联络，协商注意力与联系预期，不靠计时器推断喜欢程度。",
    "sourceIds": [
      "R3",
      "B04",
      "X03",
      "X05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "表达希望多联系或离开不合适关系可以",
    "activityIds": []
  },
  {
    "id": "D13-04",
    "version": "2.0.0",
    "group": "数字互动、注意力与私人空间",
    "category": "boundary",
    "title": "对方说不愿发送即时照片证明所在位置，仍持续命令",
    "premise": "对方说不愿发送即时照片证明所在位置，仍持续命令",
    "counterexample": "自愿报平安不是随时被核验的义务",
    "repair": "说明必要联络，协商注意力与联系预期，不靠计时器推断喜欢程度。",
    "sourceIds": [
      "R3",
      "B04",
      "X03",
      "X05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "自愿报平安不是随时被核验的义务",
    "activityIds": []
  },
  {
    "id": "D13-05",
    "version": "2.0.0",
    "group": "数字互动、注意力与私人空间",
    "category": "negotiation",
    "title": "双方对公开标记/关系展示期待不同，尚未说清",
    "premise": "双方对公开标记/关系展示期待不同，尚未说清",
    "counterexample": "不公开可能因隐私或阶段，不直接判藏着掖着",
    "repair": "说明必要联络，协商注意力与联系预期，不靠计时器推断喜欢程度。",
    "sourceIds": [
      "R3",
      "B04",
      "X03",
      "X05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "不公开可能因隐私或阶段，不直接判藏着掖着",
    "activityIds": []
  },
  {
    "id": "D13-06",
    "version": "2.0.0",
    "group": "数字互动、注意力与私人空间",
    "category": "boundary",
    "title": "以关心为由禁止正常工作、朋友联系或单独活动",
    "premise": "以关心为由禁止正常工作、朋友联系或单独活动",
    "counterexample": "表达不安与协商具体行为不等于有权隔离",
    "repair": "说明必要联络，协商注意力与联系预期，不靠计时器推断喜欢程度。",
    "sourceIds": [
      "R3",
      "B04",
      "X03",
      "X05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "表达不安与协商具体行为不等于有权隔离",
    "activityIds": []
  },
  {
    "id": "D13-07",
    "version": "2.0.0",
    "group": "数字互动、注意力与私人空间",
    "category": "friction",
    "title": "对方请不要边约会边向群友实时直播评价，仍持续转述",
    "premise": "对方请不要边约会边向群友实时直播评价，仍持续转述",
    "counterexample": "不涉及对方隐私的必要联络另看情境",
    "repair": "说明必要联络，协商注意力与联系预期，不靠计时器推断喜欢程度。",
    "sourceIds": [
      "R3",
      "B04",
      "X03",
      "X05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "不涉及对方隐私的必要联络另看情境",
    "activityIds": []
  },
  {
    "id": "D13-08",
    "version": "2.0.0",
    "group": "数字互动、注意力与私人空间",
    "category": "negotiation",
    "title": "一方希望约会少用手机，另一方有不同习惯",
    "premise": "一方希望约会少用手机，另一方有不同习惯",
    "counterexample": "可约定可接受的用途，不以拿起次数定罪",
    "repair": "说明必要联络，协商注意力与联系预期，不靠计时器推断喜欢程度。",
    "sourceIds": [
      "R3",
      "B04",
      "X03",
      "X05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可约定可接受的用途，不以拿起次数定罪",
    "activityIds": []
  },
  {
    "id": "D13-09",
    "version": "2.0.0",
    "group": "数字互动、注意力与私人空间",
    "category": "boundary",
    "title": "擅自操作对方账号关注/取消关注/拉黑别人",
    "premise": "擅自操作对方账号关注/取消关注/拉黑别人",
    "counterexample": "本人明确授权的单次协助不扩大范围",
    "repair": "说明必要联络，协商注意力与联系预期，不靠计时器推断喜欢程度。",
    "sourceIds": [
      "R3",
      "B04",
      "X03",
      "X05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "本人明确授权的单次协助不扩大范围",
    "activityIds": []
  },
  {
    "id": "D13-10",
    "version": "2.0.0",
    "group": "数字互动、注意力与私人空间",
    "category": "friction",
    "title": "以在线状态、已读标记为唯一依据，指控对方必然背叛或故意冷落",
    "premise": "以在线状态、已读标记为唯一依据，指控对方必然背叛或故意冷落",
    "counterexample": "可以求证具体约定，不把平台状态当动机证据",
    "repair": "说明必要联络，协商注意力与联系预期，不靠计时器推断喜欢程度。",
    "sourceIds": [
      "R3",
      "B04",
      "X03",
      "X05"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可以求证具体约定，不把平台状态当动机证据",
    "activityIds": []
  },
  {
    "id": "D14-01",
    "version": "2.0.0",
    "group": "暧昧、拉扯与表达分寸",
    "category": "friction",
    "title": "有明确语境证据的首次不受欢迎性化评价/索取，或已拒后继续黄腔",
    "premise": "有明确语境证据的首次不受欢迎性化评价/索取，或已拒后继续黄腔",
    "counterexample": "不把所有两性话题视为冒犯；是否欢迎不明先澄清，不靠关键词",
    "repair": "保留趣味与试探，去掉羞辱、明确操控及强制回报；不用套路制造不安全感。",
    "sourceIds": [
      "B02",
      "B08",
      "X01",
      "X05",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "不把所有两性话题视为冒犯；是否欢迎不明先澄清，不靠关键词",
    "activityIds": [
      "A22"
    ]
  },
  {
    "id": "D14-02",
    "version": "2.0.0",
    "group": "暧昧、拉扯与表达分寸",
    "category": "friction",
    "title": "土味情话未被欢迎，仍逼对方配合回应或夸自己会撩",
    "premise": "土味情话未被欢迎，仍逼对方配合回应或夸自己会撩",
    "counterexample": "一次笨拙情话不是失礼，尴尬可以自然过去",
    "repair": "保留趣味与试探，去掉羞辱、明确操控及强制回报；不用套路制造不安全感。",
    "sourceIds": [
      "B02",
      "B08",
      "X01",
      "X05",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "一次笨拙情话不是失礼，尴尬可以自然过去",
    "activityIds": []
  },
  {
    "id": "D14-03",
    "version": "2.0.0",
    "group": "暧昧、拉扯与表达分寸",
    "category": "friction",
    "title": "明确说要故意冷落以让对方更服从",
    "premise": "明确说要故意冷落以让对方更服从",
    "counterexample": "忙、独处或少聊不能推断操控",
    "repair": "保留趣味与试探，去掉羞辱、明确操控及强制回报；不用套路制造不安全感。",
    "sourceIds": [
      "B02",
      "B08",
      "X01",
      "X05",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "忙、独处或少聊不能推断操控",
    "activityIds": []
  },
  {
    "id": "D14-04",
    "version": "2.0.0",
    "group": "暧昧、拉扯与表达分寸",
    "category": "friction",
    "title": "明说用第三人刺激嫉妒来测试/控制对方",
    "premise": "明说用第三人刺激嫉妒来测试/控制对方",
    "counterexample": "正常提及朋友、前任或他人优点不直接判错",
    "repair": "保留趣味与试探，去掉羞辱、明确操控及强制回报；不用套路制造不安全感。",
    "sourceIds": [
      "B02",
      "B08",
      "X01",
      "X05",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "正常提及朋友、前任或他人优点不直接判错",
    "activityIds": []
  },
  {
    "id": "D14-05",
    "version": "2.0.0",
    "group": "暧昧、拉扯与表达分寸",
    "category": "friction",
    "title": "被拒绝称呼/玩笑后仍用该称呼反复逗弄",
    "premise": "被拒绝称呼/玩笑后仍用该称呼反复逗弄",
    "counterexample": "熟悉且自愿的昵称可以",
    "repair": "保留趣味与试探，去掉羞辱、明确操控及强制回报；不用套路制造不安全感。",
    "sourceIds": [
      "B02",
      "B08",
      "X01",
      "X05",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "熟悉且自愿的昵称可以",
    "activityIds": []
  },
  {
    "id": "D14-06",
    "version": "2.0.0",
    "group": "暧昧、拉扯与表达分寸",
    "category": "boundary",
    "title": "把高强度示爱、送礼或公开表白与必须答应绑定",
    "premise": "把高强度示爱、送礼或公开表白与必须答应绑定",
    "counterexample": "热情与礼物本身不是操控证据",
    "repair": "保留趣味与试探，去掉羞辱、明确操控及强制回报；不用套路制造不安全感。",
    "sourceIds": [
      "B02",
      "B08",
      "X01",
      "X05",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "热情与礼物本身不是操控证据",
    "activityIds": []
  },
  {
    "id": "D14-07",
    "version": "2.0.0",
    "group": "暧昧、拉扯与表达分寸",
    "category": "friction",
    "title": "说“这是拿捏你的技巧”并实施已明确的施压行为",
    "premise": "说“这是拿捏你的技巧”并实施已明确的施压行为",
    "counterexample": "讨论网上套路、引用或反讽需区分主体",
    "repair": "保留趣味与试探，去掉羞辱、明确操控及强制回报；不用套路制造不安全感。",
    "sourceIds": [
      "B02",
      "B08",
      "X01",
      "X05",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "讨论网上套路、引用或反讽需区分主体",
    "activityIds": []
  },
  {
    "id": "D14-08",
    "version": "2.0.0",
    "group": "暧昧、拉扯与表达分寸",
    "category": "negotiation",
    "title": "一方喜欢玩梗、一方不懂，双方误解语气",
    "premise": "一方喜欢玩梗、一方不懂，双方误解语气",
    "counterexample": "先解释，不因不接梗判无趣或能力差",
    "repair": "保留趣味与试探，去掉羞辱、明确操控及强制回报；不用套路制造不安全感。",
    "sourceIds": [
      "B02",
      "B08",
      "X01",
      "X05",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "先解释，不因不接梗判无趣或能力差",
    "activityIds": []
  },
  {
    "id": "D14-09",
    "version": "2.0.0",
    "group": "暧昧、拉扯与表达分寸",
    "category": "friction",
    "title": "为了营造神秘，明确故意编造紧急情况令对方担心",
    "premise": "为了营造神秘，明确故意编造紧急情况令对方担心",
    "counterexample": "真有急事、保护隐私或暂不想说不算欺骗",
    "repair": "保留趣味与试探，去掉羞辱、明确操控及强制回报；不用套路制造不安全感。",
    "sourceIds": [
      "B02",
      "B08",
      "X01",
      "X05",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "真有急事、保护隐私或暂不想说不算欺骗",
    "activityIds": []
  },
  {
    "id": "D14-10",
    "version": "2.0.0",
    "group": "暧昧、拉扯与表达分寸",
    "category": "friction",
    "title": "将对方接受一次调情解释成承诺进展，拒绝其澄清",
    "premise": "将对方接受一次调情解释成承诺进展，拒绝其澄清",
    "counterexample": "调情不是关系定位或身体许可",
    "repair": "保留趣味与试探，去掉羞辱、明确操控及强制回报；不用套路制造不安全感。",
    "sourceIds": [
      "B02",
      "B08",
      "X01",
      "X05",
      "X07"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "调情不是关系定位或身体许可",
    "activityIds": []
  },
  {
    "id": "D15-01",
    "version": "2.0.0",
    "group": "关系定位、排他与未来期待",
    "category": "negotiation",
    "title": "一方想认真交往，一方只愿轻松认识，需求明确冲突",
    "premise": "一方想认真交往，一方只愿轻松认识，需求明确冲突",
    "counterexample": "不判断谁更高级；可以协商或结束",
    "repair": "把自己的期待说清楚，核对共同约定，不拿标签代替选择。",
    "sourceIds": [
      "B01",
      "B02",
      "X05",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "不判断谁更高级；可以协商或结束",
    "activityIds": []
  },
  {
    "id": "D15-02",
    "version": "2.0.0",
    "group": "关系定位、排他与未来期待",
    "category": "boundary",
    "title": "自己坚持不排他，却强迫对方删除其他交往对象",
    "premise": "自己坚持不排他，却强迫对方删除其他交往对象",
    "counterexample": "双方自愿且清楚的安排可以不同，不能单方强迫",
    "repair": "把自己的期待说清楚，核对共同约定，不拿标签代替选择。",
    "sourceIds": [
      "B01",
      "B02",
      "X05",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "双方自愿且清楚的安排可以不同，不能单方强迫",
    "activityIds": []
  },
  {
    "id": "D15-03",
    "version": "2.0.0",
    "group": "关系定位、排他与未来期待",
    "category": "friction",
    "title": "双方已明确同意的约定被否认，仍要求对方按该约定单向付出",
    "premise": "双方已明确同意的约定被否认，仍要求对方按该约定单向付出",
    "counterexample": "坦诚提出变更、允许对方不同意可以",
    "repair": "把自己的期待说清楚，核对共同约定，不拿标签代替选择。",
    "sourceIds": [
      "B01",
      "B02",
      "X05",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "坦诚提出变更、允许对方不同意可以",
    "activityIds": []
  },
  {
    "id": "D15-04",
    "version": "2.0.0",
    "group": "关系定位、排他与未来期待",
    "category": "boundary",
    "title": "用没有名分为由否定对方拒绝身体/隐私要求的权利",
    "premise": "用没有名分为由否定对方拒绝身体/隐私要求的权利",
    "counterexample": "任何关系状态都有自主边界",
    "repair": "把自己的期待说清楚，核对共同约定，不拿标签代替选择。",
    "sourceIds": [
      "B01",
      "B02",
      "X05",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "任何关系状态都有自主边界",
    "activityIds": []
  },
  {
    "id": "D15-05",
    "version": "2.0.0",
    "group": "关系定位、排他与未来期待",
    "category": "negotiation",
    "title": "对未来规划的期望不同，尚未形成共同决定",
    "premise": "对未来规划的期望不同，尚未形成共同决定",
    "counterexample": "不承诺婚姻、不想生育等是可表达的偏好",
    "repair": "把自己的期待说清楚，核对共同约定，不拿标签代替选择。",
    "sourceIds": [
      "B01",
      "B02",
      "X05",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "不承诺婚姻、不想生育等是可表达的偏好",
    "activityIds": []
  },
  {
    "id": "D15-06",
    "version": "2.0.0",
    "group": "关系定位、排他与未来期待",
    "category": "friction",
    "title": "对方说暂不讨论结婚，仍连续逼问并以年龄/性别羞辱",
    "premise": "对方说暂不讨论结婚，仍连续逼问并以年龄/性别羞辱",
    "counterexample": "认真筛选长期目标可以，但接受不谈/不合适",
    "repair": "把自己的期待说清楚，核对共同约定，不拿标签代替选择。",
    "sourceIds": [
      "B01",
      "B02",
      "X05",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "认真筛选长期目标可以，但接受不谈/不合适",
    "activityIds": []
  },
  {
    "id": "D15-07",
    "version": "2.0.0",
    "group": "关系定位、排他与未来期待",
    "category": "friction",
    "title": "以认识家人/公开关系作为即刻证明爱意的强制考试",
    "premise": "以认识家人/公开关系作为即刻证明爱意的强制考试",
    "counterexample": "表达自己需要被认可可以，不能剥夺选择",
    "repair": "把自己的期待说清楚，核对共同约定，不拿标签代替选择。",
    "sourceIds": [
      "B01",
      "B02",
      "X05",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "表达自己需要被认可可以，不能剥夺选择",
    "activityIds": []
  },
  {
    "id": "D15-08",
    "version": "2.0.0",
    "group": "关系定位、排他与未来期待",
    "category": "negotiation",
    "title": "多次具体未来承诺未落实，仍以同一承诺要求新投入",
    "premise": "多次具体未来承诺未落实，仍以同一承诺要求新投入",
    "counterexample": "先核对本场证据，不从一次改期诊断钓鱼",
    "repair": "把自己的期待说清楚，核对共同约定，不拿标签代替选择。",
    "sourceIds": [
      "B01",
      "B02",
      "X05",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "先核对本场证据，不从一次改期诊断钓鱼",
    "activityIds": []
  },
  {
    "id": "D15-09",
    "version": "2.0.0",
    "group": "关系定位、排他与未来期待",
    "category": "negotiation",
    "title": "双方约定可能因阶段变化需要重谈，一方却认为不可修改",
    "premise": "双方约定可能因阶段变化需要重谈，一方却认为不可修改",
    "counterexample": "承诺可讨论变化，不代表可以无告知违背",
    "repair": "把自己的期待说清楚，核对共同约定，不拿标签代替选择。",
    "sourceIds": [
      "B01",
      "B02",
      "X05",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "承诺可讨论变化，不代表可以无告知违背",
    "activityIds": []
  },
  {
    "id": "D15-10",
    "version": "2.0.0",
    "group": "关系定位、排他与未来期待",
    "category": "friction",
    "title": "把短期/开放/未定位关系参与者一概贬低，拒绝听其真实约定",
    "premise": "把短期/开放/未定位关系参与者一概贬低，拒绝听其真实约定",
    "counterexample": "可以选择不参与，不对群体作人格指控",
    "repair": "把自己的期待说清楚，核对共同约定，不拿标签代替选择。",
    "sourceIds": [
      "B01",
      "B02",
      "X05",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可以选择不参与，不对群体作人格指控",
    "activityIds": []
  },
  {
    "id": "D16-01",
    "version": "2.0.0",
    "group": "分歧、暂停与修复",
    "category": "friction",
    "title": "面对具体反馈，转而辱骂对方身份或人格",
    "premise": "面对具体反馈，转而辱骂对方身份或人格",
    "counterexample": "不同意判断、提出异议可以",
    "repair": "指出具体问题、停止、协商下一步；情绪本身不判错，道歉也不清零。",
    "sourceIds": [
      "B03",
      "B08",
      "N1",
      "N4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "不同意判断、提出异议可以",
    "activityIds": []
  },
  {
    "id": "D16-02",
    "version": "2.0.0",
    "group": "分歧、暂停与修复",
    "category": "boundary",
    "title": "对方请求暂停，仍追堵或要求立刻给满意答案",
    "premise": "对方请求暂停，仍追堵或要求立刻给满意答案",
    "counterexample": "确认安全与必要安排不等于逼问",
    "repair": "指出具体问题、停止、协商下一步；情绪本身不判错，道歉也不清零。",
    "sourceIds": [
      "B03",
      "B08",
      "N1",
      "N4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "确认安全与必要安排不等于逼问",
    "activityIds": []
  },
  {
    "id": "D16-03",
    "version": "2.0.0",
    "group": "分歧、暂停与修复",
    "category": "friction",
    "title": "明说“按我要求做才理你”，以交流作为服从交换",
    "premise": "明说“按我要求做才理你”，以交流作为服从交换",
    "counterexample": "说明需要休息或不想继续关系可以",
    "repair": "指出具体问题、停止、协商下一步；情绪本身不判错，道歉也不清零。",
    "sourceIds": [
      "B03",
      "B08",
      "N1",
      "N4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "说明需要休息或不想继续关系可以",
    "activityIds": []
  },
  {
    "id": "D16-04",
    "version": "2.0.0",
    "group": "分歧、暂停与修复",
    "category": "friction",
    "title": "把停止对方不适的前提设为其先道歉/承认自己敏感",
    "premise": "把停止对方不适的前提设为其先道歉/承认自己敏感",
    "counterexample": "先停止相关行为，再谈双方理解",
    "repair": "指出具体问题、停止、协商下一步；情绪本身不判错，道歉也不清零。",
    "sourceIds": [
      "B03",
      "B08",
      "N1",
      "N4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "先停止相关行为，再谈双方理解",
    "activityIds": []
  },
  {
    "id": "D16-05",
    "version": "2.0.0",
    "group": "分歧、暂停与修复",
    "category": "friction",
    "title": "以送礼或已道歉要求对方必须马上原谅",
    "premise": "以送礼或已道歉要求对方必须马上原谅",
    "counterexample": "可以表达修复意愿，允许需要时间或离开",
    "repair": "指出具体问题、停止、协商下一步；情绪本身不判错，道歉也不清零。",
    "sourceIds": [
      "B03",
      "B08",
      "N1",
      "N4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可以表达修复意愿，允许需要时间或离开",
    "activityIds": []
  },
  {
    "id": "D16-06",
    "version": "2.0.0",
    "group": "分歧、暂停与修复",
    "category": "friction",
    "title": "反复将自己的已证实行为推成对方逼的，拒绝承担具体责任",
    "premise": "反复将自己的已证实行为推成对方逼的，拒绝承担具体责任",
    "counterexample": "说明背景不必等于甩锅，需看原话",
    "repair": "指出具体问题、停止、协商下一步；情绪本身不判错，道歉也不清零。",
    "sourceIds": [
      "B03",
      "B08",
      "N1",
      "N4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "说明背景不必等于甩锅，需看原话",
    "activityIds": []
  },
  {
    "id": "D16-07",
    "version": "2.0.0",
    "group": "分歧、暂停与修复",
    "category": "friction",
    "title": "对方澄清后仍不断翻出无关过往，要求一次性认输",
    "premise": "对方澄清后仍不断翻出无关过往，要求一次性认输",
    "counterexample": "相关问题可讨论，不强迫压下合理不满",
    "repair": "指出具体问题、停止、协商下一步；情绪本身不判错，道歉也不清零。",
    "sourceIds": [
      "B03",
      "B08",
      "N1",
      "N4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "相关问题可讨论，不强迫压下合理不满",
    "activityIds": []
  },
  {
    "id": "D16-08",
    "version": "2.0.0",
    "group": "分歧、暂停与修复",
    "category": "boundary",
    "title": "摔砸物品、威胁伤害或用肢体威吓让对方服从",
    "premise": "摔砸物品、威胁伤害或用肢体威吓让对方服从",
    "counterexample": "不把生气、哭泣或提高音量单独当暴力",
    "repair": "指出具体问题、停止、协商下一步；情绪本身不判错，道歉也不清零。",
    "sourceIds": [
      "B03",
      "B08",
      "N1",
      "N4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "不把生气、哭泣或提高音量单独当暴力",
    "activityIds": []
  },
  {
    "id": "D16-09",
    "version": "2.0.0",
    "group": "分歧、暂停与修复",
    "category": "friction",
    "title": "对方不接受自己解释，就要求其负责安抚自己的情绪",
    "premise": "对方不接受自己解释，就要求其负责安抚自己的情绪",
    "counterexample": "可以寻求支持，不能强制对方消除后果",
    "repair": "指出具体问题、停止、协商下一步；情绪本身不判错，道歉也不清零。",
    "sourceIds": [
      "B03",
      "B08",
      "N1",
      "N4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可以寻求支持，不能强制对方消除后果",
    "activityIds": []
  },
  {
    "id": "D16-10",
    "version": "2.0.0",
    "group": "分歧、暂停与修复",
    "category": "care",
    "title": "争执后双方都愿意缓一缓，需要约定是否/何时再谈",
    "premise": "争执后双方都愿意缓一缓，需要约定是否/何时再谈",
    "counterexample": "暂停不是冷暴力，不硬套统一冷却分钟数",
    "repair": "指出具体问题、停止、协商下一步；情绪本身不判错，道歉也不清零。",
    "sourceIds": [
      "B03",
      "B08",
      "N1",
      "N4"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "暂停不是冷暴力，不硬套统一冷却分钟数",
    "activityIds": []
  },
  {
    "id": "D17-01",
    "version": "2.0.0",
    "group": "散场、交通与退出",
    "category": "boundary",
    "title": "对方明确想结束，仍声称必须自己批准才能走",
    "premise": "对方明确想结束，仍声称必须自己批准才能走",
    "counterexample": "可以表达想再聊，但接受不继续",
    "repair": "允许结束，确认实际需要的交接/交通，不让礼仪高于安全与自主。",
    "sourceIds": [
      "E5",
      "B07",
      "X08",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可以表达想再聊，但接受不继续",
    "activityIds": []
  },
  {
    "id": "D17-02",
    "version": "2.0.0",
    "group": "散场、交通与退出",
    "category": "boundary",
    "title": "挡路、扣留物品或阻碍交通来拖住对方",
    "premise": "挡路、扣留物品或阻碍交通来拖住对方",
    "counterexample": "必要物品交接不得作为强迫继续的条件",
    "repair": "允许结束，确认实际需要的交接/交通，不让礼仪高于安全与自主。",
    "sourceIds": [
      "E5",
      "B07",
      "X08",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "必要物品交接不得作为强迫继续的条件",
    "activityIds": []
  },
  {
    "id": "D17-03",
    "version": "2.0.0",
    "group": "散场、交通与退出",
    "category": "boundary",
    "title": "对方想独立返程，仍强迫上自己车或索取住址",
    "premise": "对方想独立返程，仍强迫上自己车或索取住址",
    "counterexample": "提出送行并接受拒绝可以",
    "repair": "允许结束，确认实际需要的交接/交通，不让礼仪高于安全与自主。",
    "sourceIds": [
      "E5",
      "B07",
      "X08",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "提出送行并接受拒绝可以",
    "activityIds": []
  },
  {
    "id": "D17-04",
    "version": "2.0.0",
    "group": "散场、交通与退出",
    "category": "negotiation",
    "title": "最后一班公共交通/既定离场时间临近，第二站计划未重核",
    "premise": "最后一班公共交通/既定离场时间临近，第二站计划未重核",
    "counterexample": "提前讨论备选，不以实时输入时长逼剧情",
    "repair": "允许结束，确认实际需要的交接/交通，不让礼仪高于安全与自主。",
    "sourceIds": [
      "E5",
      "B07",
      "X08",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "提前讨论备选，不以实时输入时长逼剧情",
    "activityIds": [
      "A24"
    ]
  },
  {
    "id": "D17-05",
    "version": "2.0.0",
    "group": "散场、交通与退出",
    "category": "boundary",
    "title": "为继续约会故意取消对方已约好的车或返程安排",
    "premise": "为继续约会故意取消对方已约好的车或返程安排",
    "counterexample": "明确授权变更才可执行",
    "repair": "允许结束，确认实际需要的交接/交通，不让礼仪高于安全与自主。",
    "sourceIds": [
      "E5",
      "B07",
      "X08",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "明确授权变更才可执行",
    "activityIds": []
  },
  {
    "id": "D17-06",
    "version": "2.0.0",
    "group": "散场、交通与退出",
    "category": "friction",
    "title": "对方说今天没感觉，立即以外貌、收入或性别羞辱其选择",
    "premise": "对方说今天没感觉，立即以外貌、收入或性别羞辱其选择",
    "counterexample": "失落、遗憾不需要被惩罚",
    "repair": "允许结束，确认实际需要的交接/交通，不让礼仪高于安全与自主。",
    "sourceIds": [
      "E5",
      "B07",
      "X08",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "失落、遗憾不需要被惩罚",
    "activityIds": []
  },
  {
    "id": "D17-07",
    "version": "2.0.0",
    "group": "散场、交通与退出",
    "category": "friction",
    "title": "把对方离开解释为必须赔偿亲密、时间或情绪投入",
    "premise": "把对方离开解释为必须赔偿亲密、时间或情绪投入",
    "counterexample": "约定费用可合理核对，亲密不作赔偿",
    "repair": "允许结束，确认实际需要的交接/交通，不让礼仪高于安全与自主。",
    "sourceIds": [
      "E5",
      "B07",
      "X08",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "约定费用可合理核对，亲密不作赔偿",
    "activityIds": []
  },
  {
    "id": "D17-08",
    "version": "2.0.0",
    "group": "散场、交通与退出",
    "category": "boundary",
    "title": "要求对方去不愿去的地方完成道别/最后拥抱",
    "premise": "要求对方去不愿去的地方完成道别/最后拥抱",
    "counterexample": "可直接道别，不强求仪式",
    "repair": "允许结束，确认实际需要的交接/交通，不让礼仪高于安全与自主。",
    "sourceIds": [
      "E5",
      "B07",
      "X08",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可直接道别，不强求仪式",
    "activityIds": []
  },
  {
    "id": "D17-09",
    "version": "2.0.0",
    "group": "散场、交通与退出",
    "category": "care",
    "title": "夜场散场需要确认公共会合点、物品和各自回程",
    "premise": "夜场散场需要确认公共会合点、物品和各自回程",
    "counterexample": "问是否需要帮助，不强迫陪同或报地址",
    "repair": "允许结束，确认实际需要的交接/交通，不让礼仪高于安全与自主。",
    "sourceIds": [
      "E5",
      "B07",
      "X08",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "问是否需要帮助，不强迫陪同或报地址",
    "activityIds": []
  },
  {
    "id": "D17-10",
    "version": "2.0.0",
    "group": "散场、交通与退出",
    "category": "negotiation",
    "title": "普通不合适时双方对如何结束有差异",
    "premise": "普通不合适时双方对如何结束有差异",
    "counterexample": "安全退出可不解释；不把不愿当面结束判错",
    "repair": "允许结束，确认实际需要的交接/交通，不让礼仪高于安全与自主。",
    "sourceIds": [
      "E5",
      "B07",
      "X08",
      "X12"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report",
      "live-speech",
      "live-action"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "安全退出可不解释；不把不愿当面结束判错",
    "activityIds": []
  },
  {
    "id": "D18-01",
    "version": "2.0.0",
    "group": "约会之后、联系与长期边界",
    "category": "boundary",
    "title": "明确不联系后仍换账号、借朋友或到住处强行接触",
    "premise": "明确不联系后仍换账号、借朋友或到住处强行接触",
    "counterexample": "双方同意的必要交接另看具体范围",
    "repair": "表达一次清楚意愿，尊重未选择继续和明确不联系；现实跨天模式不能靠模型编造。",
    "sourceIds": [
      "B02",
      "B04",
      "B07",
      "B08",
      "X02",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "双方同意的必要交接另看具体范围",
    "activityIds": []
  },
  {
    "id": "D18-02",
    "version": "2.0.0",
    "group": "约会之后、联系与长期边界",
    "category": "friction",
    "title": "没有被喜欢，就要求对方承认自己优越或道歉",
    "premise": "没有被喜欢，就要求对方承认自己优越或道歉",
    "counterexample": "难过和自我怀疑可以被支持，不是行为错误",
    "repair": "表达一次清楚意愿，尊重未选择继续和明确不联系；现实跨天模式不能靠模型编造。",
    "sourceIds": [
      "B02",
      "B04",
      "B07",
      "B08",
      "X02",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "难过和自我怀疑可以被支持，不是行为错误",
    "activityIds": []
  },
  {
    "id": "D18-03",
    "version": "2.0.0",
    "group": "约会之后、联系与长期边界",
    "category": "boundary",
    "title": "以曝光聊天/隐私威胁见面、付款或复合",
    "premise": "以曝光聊天/隐私威胁见面、付款或复合",
    "counterexample": "向支持者求助/必要举证不能一概当曝光威胁",
    "repair": "表达一次清楚意愿，尊重未选择继续和明确不联系；现实跨天模式不能靠模型编造。",
    "sourceIds": [
      "B02",
      "B04",
      "B07",
      "B08",
      "X02",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "向支持者求助/必要举证不能一概当曝光威胁",
    "activityIds": []
  },
  {
    "id": "D18-04",
    "version": "2.0.0",
    "group": "约会之后、联系与长期边界",
    "category": "boundary",
    "title": "对方拒绝后向其朋友/单位施压，要求帮助改变决定",
    "premise": "对方拒绝后向其朋友/单位施压，要求帮助改变决定",
    "counterexample": "不把一般向自己朋友倾诉等同施压",
    "repair": "表达一次清楚意愿，尊重未选择继续和明确不联系；现实跨天模式不能靠模型编造。",
    "sourceIds": [
      "B02",
      "B04",
      "B07",
      "B08",
      "X02",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "不把一般向自己朋友倾诉等同施压",
    "activityIds": []
  },
  {
    "id": "D18-05",
    "version": "2.0.0",
    "group": "约会之后、联系与长期边界",
    "category": "friction",
    "title": "要求“到家报平安”被拒后持续指责、查证或设惩罚",
    "premise": "要求“到家报平安”被拒后持续指责、查证或设惩罚",
    "counterexample": "自愿互报是体贴，不是控制义务",
    "repair": "表达一次清楚意愿，尊重未选择继续和明确不联系；现实跨天模式不能靠模型编造。",
    "sourceIds": [
      "B02",
      "B04",
      "B07",
      "B08",
      "X02",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "自愿互报是体贴，不是控制义务",
    "activityIds": []
  },
  {
    "id": "D18-06",
    "version": "2.0.0",
    "group": "约会之后、联系与长期边界",
    "category": "negotiation",
    "title": "对联系频率与下次见面时间期待不同，需要明确沟通",
    "premise": "对联系频率与下次见面时间期待不同，需要明确沟通",
    "counterexample": "没有固定天数/分钟数能证明喜欢或敷衍",
    "repair": "表达一次清楚意愿，尊重未选择继续和明确不联系；现实跨天模式不能靠模型编造。",
    "sourceIds": [
      "B02",
      "B04",
      "B07",
      "B08",
      "X02",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "没有固定天数/分钟数能证明喜欢或敷衍",
    "activityIds": []
  },
  {
    "id": "D18-07",
    "version": "2.0.0",
    "group": "约会之后、联系与长期边界",
    "category": "friction",
    "title": "以既往付出不断追讨已被明确拒绝的恋爱机会",
    "premise": "以既往付出不断追讨已被明确拒绝的恋爱机会",
    "counterexample": "可以总结经验、停止付出，不能索取关系债",
    "repair": "表达一次清楚意愿，尊重未选择继续和明确不联系；现实跨天模式不能靠模型编造。",
    "sourceIds": [
      "B02",
      "B04",
      "B07",
      "B08",
      "X02",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "可以总结经验、停止付出，不能索取关系债",
    "activityIds": []
  },
  {
    "id": "D18-08",
    "version": "2.0.0",
    "group": "约会之后、联系与长期边界",
    "category": "boundary",
    "title": "对方结束关系后仍要求共享密码、定位或删正常联系人",
    "premise": "对方结束关系后仍要求共享密码、定位或删正常联系人",
    "counterexample": "关系内外都需当下自愿授权",
    "repair": "表达一次清楚意愿，尊重未选择继续和明确不联系；现实跨天模式不能靠模型编造。",
    "sourceIds": [
      "B02",
      "B04",
      "B07",
      "B08",
      "X02",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "关系内外都需当下自愿授权",
    "activityIds": []
  },
  {
    "id": "D18-09",
    "version": "2.0.0",
    "group": "约会之后、联系与长期边界",
    "category": "friction",
    "title": "明知现有约定未达成，却向外宣称对方已答应并制造公开压力",
    "premise": "明知现有约定未达成，却向外宣称对方已答应并制造公开压力",
    "counterexample": "介绍自己的期待需标为单方，不冒充共识",
    "repair": "表达一次清楚意愿，尊重未选择继续和明确不联系；现实跨天模式不能靠模型编造。",
    "sourceIds": [
      "B02",
      "B04",
      "B07",
      "B08",
      "X02",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": true,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "介绍自己的期待需标为单方，不冒充共识",
    "activityIds": []
  },
  {
    "id": "D18-10",
    "version": "2.0.0",
    "group": "约会之后、联系与长期边界",
    "category": "negotiation",
    "title": "用户自述跨天承诺/联系模式与感受，需要核对具体事件",
    "premise": "用户自述跨天承诺/联系模式与感受，需要核对具体事件",
    "counterexample": "标明现实自述；不从当前一场模拟推断长期操控",
    "repair": "表达一次清楚意愿，尊重未选择继续和明确不联系；现实跨天模式不能靠模型编造。",
    "sourceIds": [
      "B02",
      "B04",
      "B07",
      "B08",
      "X02",
      "X11"
    ],
    "sourceType": "original-adaptation",
    "requiresPriorEvidence": false,
    "entries": [
      "micro-practice",
      "self-report"
    ],
    "unknown": "引用、否定、假设、主体不明或前情不足时待澄清，不记已发生负面行为。",
    "distinction": "标明现实自述；不从当前一场模拟推断长期操控",
    "activityIds": []
  }
];
const activities=[
  {
    "id": "A01",
    "name": "咖啡／茶饮",
    "ruleIds": [
      "D03-05",
      "D05-10",
      "D13-01"
    ],
    "care": "询问饮品/座位，D09-10",
    "counterexample": "必要看手机；不同口味不需纠正"
  },
  {
    "id": "A02",
    "name": "餐厅约饭",
    "ruleIds": [
      "D05-02",
      "D06-01",
      "D09-01"
    ],
    "care": "D06-10调整共享菜位置",
    "counterexample": "AA/请客均可；合理催单/投诉"
  },
  {
    "id": "A03",
    "name": "火锅／烤肉",
    "ruleIds": [
      "D06-04",
      "D06-07"
    ],
    "care": "询问是否代烤/留菜",
    "counterexample": "服务员代烤；自愿一方多做"
  },
  {
    "id": "A04",
    "name": "夜市小吃",
    "ruleIds": [
      "D05-01",
      "D07-01",
      "D09-02"
    ],
    "care": "会合点、尝不同份量",
    "counterexample": "各买各喜欢的；不共享食物"
  },
  {
    "id": "A05",
    "name": "电影院",
    "ruleIds": [
      "D09-04",
      "D11-05"
    ],
    "care": "座位、散场会合点",
    "counterexample": "观影沉默；散场不牵手"
  },
  {
    "id": "A06",
    "name": "美术馆／展览",
    "ruleIds": [
      "D03-05",
      "D04-06",
      "D09-05"
    ],
    "care": "允许不同观看节奏",
    "counterexample": "受邀科普；不同解读"
  },
  {
    "id": "A07",
    "name": "书店",
    "ruleIds": [
      "D03-06",
      "D04-06"
    ],
    "care": "听一本书为何被喜欢",
    "counterexample": "不认识作家；安静翻书"
  },
  {
    "id": "A08",
    "name": "公园散步",
    "ruleIds": [
      "D07-01",
      "D07-02",
      "D07-03",
      "D07-04"
    ],
    "care": "换路、坐下、避雨",
    "counterexample": "舒适沉默；不必男外女内"
  },
  {
    "id": "A09",
    "name": "CityWalk",
    "ruleIds": [
      "D01-09",
      "D07-06"
    ],
    "care": "一起查备选返程",
    "counterexample": "带路失误；各自回程"
  },
  {
    "id": "A10",
    "name": "市集／快闪",
    "ruleIds": [
      "D05-07",
      "D09-03",
      "D12-01"
    ],
    "care": "看各自兴趣后约会合",
    "counterexample": "不买东西；拒绝合照"
  },
  {
    "id": "A11",
    "name": "陶艺",
    "ruleIds": [
      "D08-01",
      "D08-02",
      "D11-09"
    ],
    "care": "先问是否示范",
    "counterexample": "不熟练；想自己试"
  },
  {
    "id": "A12",
    "name": "烘焙",
    "ruleIds": [
      "D06-01",
      "D08-06"
    ],
    "care": "确认分工与等待",
    "counterexample": "配方偏好不同；承认不会"
  },
  {
    "id": "A13",
    "name": "饰品／绘画",
    "ruleIds": [
      "D08-02",
      "D05-09"
    ],
    "care": "保留各自作品选择",
    "counterexample": "不交换作品；拒绝收礼"
  },
  {
    "id": "A14",
    "name": "桌游",
    "ruleIds": [
      "D08-03",
      "D08-04"
    ],
    "care": "先确认讲规则/计分",
    "counterexample": "竞争型玩法自愿；新手问规则"
  },
  {
    "id": "A15",
    "name": "台球",
    "ruleIds": [
      "D11-09",
      "D08-03"
    ],
    "care": "用示范代替扶手",
    "counterexample": "拒绝贴身教学；自己练"
  },
  {
    "id": "A16",
    "name": "保龄球",
    "ruleIds": [
      "D08-04",
      "D12-01"
    ],
    "care": "选合适球重，问是否休息",
    "counterexample": "成绩低；不想被录"
  },
  {
    "id": "A17",
    "name": "电玩城",
    "ruleIds": [
      "D05-01",
      "D08-08"
    ],
    "care": "共同选收手节点",
    "counterexample": "各玩各的；不续币"
  },
  {
    "id": "A18",
    "name": "羽毛球",
    "ruleIds": [
      "D08-04",
      "D07-04"
    ],
    "care": "降强度、休息",
    "counterexample": "实力差；不竞技"
  },
  {
    "id": "A19",
    "name": "攀岩",
    "ruleIds": [
      "D08-05",
      "D08-10"
    ],
    "care": "找教练、选适合路线",
    "counterexample": "害怕、退出、要求检查"
  },
  {
    "id": "A20",
    "name": "骑行",
    "ruleIds": [
      "D07-01",
      "D07-06",
      "D08-05"
    ],
    "care": "约休息点与归还安排",
    "counterexample": "骑得慢；选短路线"
  },
  {
    "id": "A21",
    "name": "野餐／短徒步",
    "ruleIds": [
      "D06-01",
      "D07-03",
      "D07-04"
    ],
    "care": "避雨、折返与公共休息点",
    "counterexample": "少走一段；不拍照打卡"
  },
  {
    "id": "A22",
    "name": "清吧",
    "ruleIds": [
      "D10-01",
      "D14-01"
    ],
    "care": "无酒精选择和安静座位",
    "counterexample": "不喝酒；不接暧昧梗"
  },
  {
    "id": "A23",
    "name": "热闹酒吧",
    "ruleIds": [
      "D10-08",
      "D10-09",
      "D11-04"
    ],
    "care": "询问是否换安静区域",
    "counterexample": "不跳舞、不贴近、不续摊"
  },
  {
    "id": "A24",
    "name": "Livehouse",
    "ruleIds": [
      "D09-04",
      "D09-10",
      "D17-04"
    ],
    "care": "站位、物品和公共会合点",
    "counterexample": "各自欣赏；散场直接回家"
  }
];
function freeze(x){if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}
freeze(rules);freeze(activities);return Object.freeze({VERSION,rules,activities,getRule:id=>rules.find(r=>r.id===id)||null});});
