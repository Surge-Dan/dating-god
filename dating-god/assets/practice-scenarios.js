(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DatingPracticeScenarios=api;})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const scenarios={
  'natural-close-v1':{
    id:'natural-close-v1',title:'到点了，怎么自然收尾？',activityId:'A08',goal:'接住对方的时间安排；想继续聊可以说出来，也给对方留出选择。',startNode:'start',
    nodes:{
      start:{prompt:'“我差不多十分钟后得去取个东西，今天咱们就先到这儿吧？”',choices:[
        {id:'accept',label:'“好呀，不耽误你。今天还挺开心的，路上小心。”',reply:'“嗯，今天聊得挺开心的，回头再聊。”',outcome:'接住了对方的时间安排。',nextNode:'farewell'},
        {id:'pressure',label:'“还早呢，要不再走一圈？”',reply:'“我今天真得走了，改天再走吧。”',outcome:'对方再次明确今天要离开；接下来是一次修复机会。',nextNode:'repair'},
        {id:'express',label:'“我还有点舍不得结束，不过你先去忙。改天有空的话，我们再约。”',reply:'“好呀，改天再约。今天先走啦。”',outcome:'表达了还想继续聊，也把决定留给对方。',nextNode:'farewell'}
      ]},
      farewell:{prompt:'“那我先往车站走啦。今天挺开心的。”',choices:[
        {id:'close-warmly',label:'“我也是，今天先到这儿。路上小心。”',reply:'“好，拜拜。”',outcome:'简单、温和地结束了这次见面。',nextNode:null},
        {id:'offer-help',label:'“车站怎么走？我可以帮你看一下，不用的话就算啦。”',reply:'“我知道怎么走，谢谢。你也回去吧。”',outcome:'提出了具体帮助，也接受了对方的选择。',nextNode:null}
      ]},
      repair:{prompt:'“我今天真有安排，别一直劝我改主意啦。”',choices:[
        {id:'repair',label:'“好，我不劝了。刚才没听进去，抱歉。你先去忙，路上小心。”',reply:'“好，那改天再聊。拜拜。”',outcome:'听见了对方的意思，也用行动收住了刚才的劝说。',nextNode:null},
        {id:'persist',label:'“我就是想多跟你待会儿，你不用这么严肃吧。”',reply:'“我先走啦。拜拜。”',outcome:'继续解释自己的本意，没有回应对方说不想改安排。',nextNode:null}
      ]}
    }
  }
};
const clone=value=>JSON.parse(JSON.stringify(value));
function get(id){return scenarios[id]?clone(scenarios[id]):null;}
function choose(scenarioId,nodeId,choiceId){const scenario=scenarios[scenarioId],node=scenario?.nodes[nodeId],choice=node?.choices.find(item=>item.id===choiceId);return choice?{scenarioId,nodeId,choiceId,label:choice.label,reply:choice.reply,outcome:choice.outcome,nextNode:choice.nextNode,ended:choice.nextNode===null}:null;}
return Object.freeze({get,choose});
});
