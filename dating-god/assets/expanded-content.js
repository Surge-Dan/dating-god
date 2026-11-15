(function () {
  "use strict";
  const groups = ["吃喝", "文娱", "户外", "逛街", "手作", "游戏", "运动", "夜间"];
  const pairs = [[0,4],[1,2],[2,5],[3,7],[4,6],[5,0],[6,1],[7,3],[0,6],[1,7],[2,4],[3,5],[4,1],[5,2],[6,3],[7,0]];
  const metadata = (activityId, category, duration, cost, alcohol, outdoor, pacing, requirements) => ({activityId, category, duration, cost, alcohol, outdoor, pacing, requirements, talkMinutes: category === "文娱" ? 1 : category === "运动" ? 2 : 3, travelMinutes: 5});
  function scene(id, name, category, place, duration, cost, description, opening, initialState, steps, extra = {}) {
    const nodes = {};
    steps.forEach(([node, choices], index) => {
      nodes[node] = choices.map(([key, label, reply, patch, minutes = 3, expense = 0, location, to, requires]) => ({id: `${id}-${key}`, label, reply, patch: {progress: node, ...patch}, minutes, cost: expense, to: to || steps[index + 1]?.[0] || "decision", ...(location ? {location} : {}), ...(requires ? {requires} : {}), ...(/碰拳|跳舞|赠送|拍照/.test(label) ? {requiresConsent:true,tags:[/拍照/.test(label)?"photos":/赠送/.test(label)?"relationship":"intimacy"]} : {})}));
    });
    return {id, name, ...metadata(id, category, duration, cost, false, category === "户外" || category === "逛街", "边做边聊，允许各自停一会儿", ["公共场所见面", "预算为模拟设定，不代表实际场馆价格"]), place, time: "15:00", pace: "activity", description, intro: description, hint: opening, opening, initialState: {progress: "arrived", ...initialState}, nodes, ...extra};
  }
  const scenes = [
    scene("A03", "火锅／烤肉", "吃喝", "火锅店等位区", 70, 90, "锅底单放在桌角，旁边写着可以分锅。", "我吃不了太辣。你想分锅，还是一起选清淡的？", {pot: "unset", heat: "low", food: "raw"}, [
      ["start", [["split","选鸳鸯锅，各吃各的辣度","那就不用谁迁就谁了。",{pot:"split"},4],["mild","商量用清汤锅","可以，我去蘸料里找点味道。",{pot:"clear"},4]]],
      ["ingredients", [["veg","先点蔬菜和菌菇","先少点，吃完再加。",{order:"vegetables"},4],["mix","各选一份想吃的","我想点牛肉，你挑你的那份。",{order:"mixed"},4]]],
      ["sauce", [["separate","自己调一碗蘸料","我这碗不放香菜，别拿错了。",{sauce:"separate"},3],["ask-sauce","问对方有没有想试的搭配","芝麻酱加一点醋，我喜欢这个。",{sauce:"shared-tip"},3]]],
      ["cooking", [["offer","先问要不要帮忙下菜","蘑菇可以，肉我想自己看时间。",{help:"mushrooms-only",food:"cooking"},8],["own","各自照看锅里的食物","行，你那边好了就先吃。",{help:false,food:"cooking"},8]]],
      ["taste", [["wait-cook","等食物充分煮熟再夹","这份好了，刚才那份再等等。",{food:"cooked"},8],["cool","把烫的食物放碟里晾一下","我也先晾会儿，实在太烫。",{food:"cooked",pace:"slow"},8]]],
      ["bill", [["finish","不再加菜，准备结账","刚好吃完，别硬点了。",{order:"closed"},5],["add-tea","各自加一杯无糖茶","我也要茶，解一下嘴里的味道。",{order:"closed",drink:"tea"},5,8]]]
    ]),
    scene("A04", "夜市吃小吃", "吃喝", "夜市公共入口", 60, 45, "入口的摊位图有几处被贴上了售罄贴纸。", "我们各挑一家？不喜欢吃的不用陪着点。", {queue:"none",snack:"none"}, [
      ["start", [["route-left","先逛左边的咸食摊","我想看看那家煎饼。",{route:"savory"},5,0,"夜市咸食一侧"],["route-right","先看看甜品和饮料","好，我先认一下回来的路口。",{route:"sweet"},5,0,"夜市甜品一侧"]]],
      ["queue", [["short-line","选人少的摊位","先吃到东西也挺重要的。",{queue:"short"},4],["wait-line","确认愿意等十分钟","十分钟可以，再久我们就换一家。",{queue:"bounded"},10]]],
      ["order", [["own-snack","各买自己选的小份","我的先拿好了，你慢慢选。",{snack:"individual"},4],["ask-share","先问是否愿意分着尝","可以分这个，用两把小叉子吧。",{snack:"shared-with-permission"},4]]],
      ["seating", [["public-table","去公共餐桌坐一下","那张刚空出来，我们过去。",{rest:"table"},5,0,"夜市公共餐桌"],["quiet-edge","移到不挡通道的边上","这里不挤，先把东西吃完。",{rest:"edge"},5,0,"夜市外侧休息区"]]],
      ["sold-out", [["change-stall","接受想吃的摊位售罄，换一家","行，我还有第二顺位。",{backup:"new-stall"},5],["skip","不补买，留着下次再吃","也不是非得今晚吃到。",{backup:"skip"},2]]],
      ["exit-route", [["station","一起走回公共地铁口","我往这个口，你看你的路线。",{route:"station"},6,0,"夜市地铁口"],["gate","在入口道别，各自返程","好，我从另一边坐车。",{route:"gate"},4,0,"夜市公共入口"]]]
    ], {outdoor:true,pacing:"走走停停，排队时聊天"}),
    scene("A05", "电影院", "文娱", "影院公共大厅", 125, 55, "电子屏列着片长，下一场还有十五分钟检票。", "我想看完整场。先确认片长和回程来不来得及？", {ticket:"unset",screening:"not-started",noise:"normal"}, [
      ["start", [["drama","一起确认想看的剧情片","这个片长我们都来得及。",{film:"drama"},4],["comedy","一起确认喜剧片","好，先别看评论，免得被剧透。",{film:"comedy"},4]]],
      ["seat", [["middle","选择中后排，各自确认座位","这排可以，旁边还有过道。",{ticket:"middle-row"},3],["aisle","选择方便出入的过道座位","行，坐哪边舒服就选哪边。",{ticket:"aisle"},3]]],
      ["snack", [["water","各买一瓶水","我也要水，零食先不用。",{snack:"water"},3],["popcorn","问是否愿意买小桶爆米花","小桶可以，我不想看完还剩一大桶。",{snack:"small-popcorn"},3,12]]],
      ["screening", [["watch","收起手机，安静看完整场","进去以后我们就先看电影。",{screening:"finished",noise:"quiet"},90,0,"影院放映厅"],["watch-aisle","确认可随时自行离席后入场","需要出去就先出去，不用一直解释。",{screening:"finished",noise:"quiet"},90,0,"影院放映厅"]]],
      ["after-film", [["one-shot","散场后聊一幕印象深的画面","我记得最后那个空镜，你怎么理解？",{discussion:"specific-scene",noise:"normal"},8,0,"影院公共大厅"],["different-taste","坦白有一段没看进去","我倒喜欢那段，我们看到的重点不一样。",{discussion:"different-taste",noise:"normal"},8,0,"影院公共大厅"]]],
      ["return", [["check-route","各自检查末班与回程","我这班还有时间，你先看你的。",{return:"checked"},4],["no-spoilers","把还想聊的留到路上，不剧透旁人","好，出门再说那个结尾。",{return:"public-exit"},4,0,"影院商场公共出口"]]]
    ], {pacing:"放映中安静，散场后展开交谈",requirements:["双方已确认片目与片长","电影票为本场虚构预算","放映中不要求交谈"],talkMinutes:1}),
    scene("A06", "美术馆／展览", "文娱", "展馆公共前厅", 85, 40, "前厅的导览图标着展厅方向和闭馆时间。", "先各挑一件想看的？我们不必每幅都意见一致。", {route:"unset",work:"none"}, [
      ["start", [["painting","从绘画展厅开始","我也想先看那面蓝色的墙。",{route:"painting"},4,0,"绘画展厅"],["installation","从装置区开始","行，先看看它到底在动什么。",{route:"installation"},4,0,"装置展区"]]],
      ["choose-work", [["pick-own","各选一件愿意多看一会儿的作品","我选这个小的，远看差点漏过去。",{work:"individual-choice"},10],["read-label","先读说明，再说直观感觉","说明我看了，但还是觉得有点好笑。",{work:"label-read"},8]]],
      ["interpret", [["different","说出与对方不同的理解","原来你注意的是那块阴影。",{interpretation:"different"},8],["ask-detail","问对方最先看见哪个细节","那个歪掉的角，让我一直想扶正。",{interpretation:"detail"},8]]],
      ["separate", [["meet-bench","商量各看十分钟，在长椅汇合","好，十分钟后这张长椅。",{meeting:"bench-confirmed"},10,0,"展厅长椅旁"],["together","继续一起看下一小厅","行，漏掉的也不用赶着补。",{meeting:"together"},10,0,"相邻小展厅"]]],
      ["closing", [["last-room","闭馆前只看最后一个小厅","就这个，看完我们出去。",{closing:"last-room"},12],["shop-skip","跳过纪念品商店，慢慢出馆","今天不一定要带点什么走。",{closing:"exit"},6]]],
      ["courtyard", [["remember","在公共庭院说起想带走的画面","我还在想刚才那个小角落。",{memory:"named"},6,0,"展馆公共庭院"],["quiet","在出口安静坐一会儿","可以，让眼睛歇一歇。",{memory:"quiet"},6,0,"展馆公共出口"]]]
    ]),
    scene("A07", "书店／二手书市", "文娱", "二手书店入口", 55, 20, "窄书架之间贴着手写分类，店里允许只看不买。", "各找一本书？可以喜欢完全不同的东西。", {book:"none",note:"unread"}, [
      ["start", [["fiction","先去小说那一排","我想找一本封面很奇怪的。",{shelf:"fiction"},5,0,"小说书架"],["essay","先看随笔和旧杂志","我看看有没有以前的城市地图。",{shelf:"essays"},5,0,"随笔旧刊区"]]],
      ["pick-book", [["for-self","挑一本自己真想看的书","这本我会读，你不用替我挑热门的。",{book:"self-selected"},6],["recommend","先问对方愿不愿意听一本推荐","说吧，先别把结尾告诉我。",{book:"recommendation-requested"},6]]],
      ["old-note", [["replace-note","发现旧便笺后原样夹回","留给下一位吧，像这本书自带的门票。",{note:"replaced"},4],["cover-only","不读私人字条，只聊书的装帧","行，我也不太想拆别人的信。",{note:"not-read"},4]]],
      ["split-shelves", [["meet-cashier","各逛一排，约在收银台旁汇合","十分钟？到点我们都过去。",{meeting:"cashier"},10],["same-row","一起看同一排，各自翻几页","好，不用一直说话。",{meeting:"same-row"},8]]],
      ["purchase", [["buy-one","各自决定是否买手上的书","我留这本，别的先放回去。",{purchase:"own-choice"},4],["no-buy","把书放回原位，今天只逛","也挺好，我记住书名了。",{purchase:"none"},4]]],
      ["doorstep", [["title","在门口说一个最意外的书名","那个名字我能笑到下周。",{takeaway:"title"},4,0,"书店公共门口"],["walk-out","把通道让出来，再商量去向","出去再说，后面有人要进来。",{takeaway:"exit"},3,0,"书店公共门口"]]]
    ]),
    scene("A08", "公园散步", "户外", "公园公共东门", 55, 0, "入口地图标着树荫路、湖边与公共出口。", "你今天想走多远？累了就折返。", {route:"unset",energy:"comfortable"}, [
      ["start", [["shade","选有树荫的短路线","我也怕晒，走这条。",{route:"shade"},5,0,"公园树荫步道"],["lake","选平坦的湖边路线","好，走到那座桥就看看要不要回。",{route:"lake"},5,0,"公园湖边步道"]]],
      ["pace", [["slow","说清想走慢一点","那就慢点，不用走出锻炼的速度。",{pace:"slow"},7],["look","停下来看看路边的树牌","原来这棵树叫这个名字。",{pace:"stop-and-look"},5]]],
      ["water", [["bring-water","各自喝带来的水","我也歇口气。",{water:"own"},3],["buy-water","在公共售卖点各买水","我买常温的，你选你的。",{water:"bought"},4,5,"公园售卖亭旁"]]],
      ["bench", [["sit","在公共长椅坐五分钟","好，这边坐着能看见湖。",{energy:"rested"},5,0,"步道公共长椅"],["stand","不想坐就站着看一会儿","可以，等会儿我们往回走。",{energy:"rested"},4]]],
      ["turn-back", [["short-return","按原路慢慢折返","来时那段安静，走回去吧。",{route:"return-original"},10],["near-exit","走最近的公共出口","我看一下牌子，这边近一些。",{route:"nearest-exit"},8]]],
      ["gate", [["separate","在出口各看交通安排","我去坐公交，你的车站在哪边？",{return:"separate"},3,0,"公园公共出口"],["notice","聊起刚才注意到的小事","我也记得那只总不肯下水的鸟。",{return:"last-chat"},4,0,"公园公共出口"]]]
    ]),
    scene("A09", "街区CityWalk", "户外", "街区公共地图牌旁", 75, 15, "路口地图上有老街、河边与几处公共休息点。", "我想走老街，你有没有特别想看的地方？", {route:"unset",detour:false}, [
      ["start", [["old-street","选有老建筑的短线","那就先看左边这排房子。",{route:"old-street"},5],["river","选河边平坦的路线","好，过桥之前再决定走多远。",{route:"river"},5]]],
      ["wayfinding", [["sign","停下看清路标再走","等我也认一下，不然一会儿各指各的。",{navigation:"sign"},5],["map","用地图确认下个公共路口","就到这个路口，别一次绕太远。",{navigation:"map"},5]]],
      ["shop", [["ask-enter","问是否想进眼前的小店","进去看看可以，我暂时没打算买。",{detour:true},10,0,"街区小店公共陈列区"],["pass","不进店，继续沿公共街道走","行，那块招牌看看就够了。",{detour:false},7,0,"街区公共步道"]]],
      ["route-change", [["quiet-road","绕开施工路，走安静一侧","多走五分钟可以，别穿施工围挡。",{route:"quiet-detour"},8],["turn-back","不绕远，回到熟悉路口","好，今天不用集齐整张地图。",{route:"return"},7]]],
      ["rest", [["public-seat","在公共休息点坐一会儿","鞋底终于不用工作了。",{energy:"rested"},5,0,"街区公共休息点"],["tea-to-go","各买饮料，站在不挡路处喝","我点无糖的。",{drink:"own-choice"},5,10,"沿街饮料店外休息区"]]],
      ["intersection", [["station-route","确认各自车站方向","我往南，你不用陪我绕。",{return:"station"},6,0,"公共交通路口"],["landmark","用刚见过的招牌记住会合点","下次认这个就比报门牌容易。",{return:"landmark"},4,0,"街区公共路口"]]]
    ])
  ];

  scenes.push(
    scene("A10", "周末市集／快闪", "逛街", "周末市集公共入口", 65, 30, "摊位地图分成旧物、手作和吃喝三排，出口旁有服务台。", "各挑一排看看？如果分开逛，先约好在哪碰头。", {meeting:"unset",purchase:"none"}, [
      ["start", [["old-goods","先看旧物摊","我想看看那台旧收音机。",{zone:"old-goods"},6],["craft-stalls","先看手作摊","那边有做小木勺的，我们过去。",{zone:"craft"},6]]],
      ["stop-stall", [["ask-maker","问摊主一件东西怎么做","原来那道痕是手工磨出来的。",{discovery:"making-process"},6],["browse","只看看，不因介绍就必须买","我也想再比较一下。",{discovery:"browse"},5]]],
      ["meet-point", [["split-confirm","约十分钟后在服务台见","十分钟，服务台，不是隔壁饮料车。",{meeting:"service-desk"},10],["stay-pair","继续一起走，各自决定停哪里","行，你想停就说，我也会说。",{meeting:"together"},8]]],
      ["budget", [["small-item","在自己预算里选一个小物件","我只留这枚徽章，别的放回去。",{purchase:"small-own-item"},5],["skip-buy","决定今天不买纪念品","看过也算逛到了。",{purchase:"none"},3]]],
      ["reunite", [["service-desk","回到约定的服务台等一下","我到了，刚才那排真容易错过。",{meeting:"reunited"},6,0,"市集服务台"],["message-location","先说明自己还在摊前，再到服务台汇合","好，位置说清楚就不用互相找。",{meeting:"reunited-after-update"},8,0,"市集服务台"]]],
      ["exit", [["compare-finds","说说各自最想推荐的一个摊","你指的那个，我刚好没注意到。",{takeaway:"recommendation"},5],["find-gate","照地图走回公共出口","这回我们认准同一个门。",{takeaway:"exit"},5,0,"市集公共出口"]]]
    ]),
    scene("A12", "烘焙体验", "手作", "烘焙教室公共操作台", 110, 120, "台上摆着称、配方和过敏原提示，烤箱由工作人员操作。", "先看配料有没有不能吃的，再决定做什么。", {recipe:"unset",dough:"unmixed",oven:"staff-only"}, [
      ["start", [["no-nuts","选择不含坚果的饼干配方","那就用这份，配料表也再核一下。",{recipe:"no-nuts"},5],["plain","选择原味小蛋糕配方","先做基础的，我想尝尝原来的味道。",{recipe:"plain-cake"},5]]],
      ["weigh", [["divide","一人读配方，一人称量","你读到哪我就加到哪，别一起抢。",{division:"reader-and-scale"},12],["separate","各称一份，互相核对重量","行，称完再一起看一眼。",{division:"separate"},12]]],
      ["mix", [["slow-mix","慢慢混合，按配方停手","现在这样就行，别把它搅成练臂力。",{dough:"mixed"},15],["ask-staff","觉得太干，先请老师看","先别凭感觉加水，问一下比较稳。",{dough:"checked-by-staff"},15]]],
      ["bake", [["staff-oven","把烤盘交给工作人员入炉","好，我们在外面等，不自己碰炉子。",{dough:"baked",oven:"completed-by-staff"},30],["timer","确认工作人员设定的等待时间","三十分钟，那我们能歇一会儿。",{dough:"baked",oven:"completed-by-staff"},30]]],
      ["cool", [["wait-cool","等成品冷却再尝","闻着很香，也得等嘴能接受。",{product:"cooled"},12],["compare","隔着托盘看看各自的成品","我这只怎么像戴了帽子。",{product:"cooled"},12]]],
      ["pack", [["own-box","各自分装自己的成品","这盒你的，这盒我的，别拿错。",{packed:"separate"},8],["ask-exchange","先问要不要互换一块","一块可以，我也想尝你的那个。",{packed:"one-piece-exchange"},8]]]
    ], {requirements:["先核对食物过敏原","烤箱与高温操作由工作人员完成","不把配方体验当作食品安全指导"]}),
    scene("A13", "饰品／绘画工作坊", "手作", "工作坊公共长桌", 90, 85, "材料盘和色卡各放在桌面一侧，成品默认归各自。", "你想做饰品还是画小画？可以各做各的。", {project:"unset",help:false,ownership:"own"}, [
      ["start", [["beads","选择串珠饰品","我想用两种颜色，不贪多。",{project:"beads"},5],["paint","选择小幅绘画","好，我先试试这一点蓝色。",{project:"painting"},5]]],
      ["palette", [["own-color","各选自己喜欢的颜色","你的亮一点，我想留得淡一些。",{palette:"individual"},8],["test-paper","先在试纸上比较配色","这个放一起比我想的顺眼。",{palette:"tested"},8]]],
      ["outline", [["simple","选一个能在时间内完成的图案","就这个，先不挑战整幅星空。",{design:"simple"},15],["abstract","保留不规则形状，边做边看","可以，它现在还不用有名字。",{design:"abstract"},15]]],
      ["assist", [["ask-help","先问需不需要递材料","递一下剪刀就好，其他我来。",{help:"materials-only"},10],["no-help","尊重对方想独立完成","行，我也回去弄自己的。",{help:false},10]]],
      ["finish", [["stop-detail","停在满意的位置，不再补细节","再加可能就要开始抢救了。",{product:"finished"},12],["staff-check","请老师检查扣件或颜料是否干透","检查好了再收，别一拿就散。",{product:"checked"},12]]],
      ["ownership", [["keep-own","各自带走自己的成品","好，今天我们做出了两种完全不同的东西。",{ownership:"own"},5],["ask-gift","只提出赠送，等对方明确选择","心意我听到了，先让我想一下要不要收。",{ownership:"offer-only"},5]]]
    ]),
    scene("A14", "双人桌游", "游戏", "桌游店双人桌", 75, 45, "桌上有协作和轻对抗两套游戏，规则卡还没拆开。", "想合作还是各赢各的？不喜欢这套可以换。", {game:"unset",round:0,rules:"unread"}, [
      ["start", [["cooperate","选一款合作游戏","那我们先研究怎么一起不输。",{game:"cooperate"},5],["compete","选一款轻对抗游戏","好，输的人也照常喝自己的饮料。",{game:"compete"},5]]],
      ["rules", [["read","一起读规则卡","我读到这条时没懂，你懂了吗？",{rules:"read"},8],["staff-demo","请店员示范一轮","看一轮比较直观，先不计分。",{rules:"demonstrated"},8]]],
      ["trial", [["practice","试一轮，不急着判输赢","刚才那步算练习，我们再来。",{round:1,score:"practice"},12],["clarify","遇到分歧先翻规则，不猜对方用意","先看文字怎么写，别靠嗓门定。",{round:1,score:"practice-checked"},12]]],
      ["real-round", [["play","按已说好的规则正式玩一轮","好，刚才那条我们都知道了。",{round:2,score:"recorded"},15],["switch-mode","确认双方都想换玩法后重开","可以，这套不合适就换，不必硬玩。",{round:2,game:"changed-by-agreement"},15]]],
      ["debrief", [["laugh-move","说起刚才那步离谱操作","我自己也没想到能走成这样。",{takeaway:"one-move"},6],["different-style","聊各自偏好的玩法","我更喜欢有点合作空间的。",{takeaway:"play-style"},6]]],
      ["pack", [["put-back","照清单把配件收回盒子","牌数对了，这回没藏在桌底。",{components:"returned"},5],["no-more","不再开新局，按原计划散场","好，开一局就又要半小时了。",{components:"returned",game:"closed"},5]]]
    ]),
    scene("A15", "台球", "游戏", "台球馆公共球台旁", 65, 50, "球台边放着公杆，店员提醒别把饮料放台面。", "你想先试几杆，还是按简单规则来一局？", {teaching:"none",rack:"ready"}, [
      ["start", [["practice","先各试几杆，不计分","我先找一下手感。",{game:"practice"},6],["simple-rule","说清简单规则再开球","这条我们先按同一种理解来。",{game:"simple-rule"},6]]],
      ["break", [["you-first","商量由自己先开球","那我先来，没打散也算开过了。",{rack:"opened-by-user"},5],["role-first","请对方先开球","行，你站在这边看比较清楚。",{rack:"opened-by-role"},5]]],
      ["teaching", [["ask-explain","问是否愿意口头讲一下瞄准","我能说说我的办法，不保证每杆都准。",{teaching:"verbal-only"},8],["own-try","选择自己试，不需要手把手教","好，我就看球，不碰你的姿势。",{teaching:"declined"},8]]],
      ["turns", [["alternate","按顺序轮流打一轮","该你了，慢慢想。",{round:1},12],["call-foul","没看清时先确认规则再判罚","这杆我也没看全，重看一下规则。",{round:1,rules:"checked"},12]]],
      ["rest", [["water","把球杆放稳，离台喝水","球杆先放架上，别靠台边。",{rest:"water"},5,0,"球台外休息位"],["watch-table","站到安全位置看看别人打球","我也想看那个人怎么走位。",{rest:"observe"},5,0,"台球馆公共观赛区"]]],
      ["close-table", [["last-rack","打一小段后按约归还球杆","就到这一杆，不临时加一整局。",{rack:"closed"},8],["return-cues","直接归还公杆，核对消费","好，杆都在架上了。",{rack:"closed"},4]]]
    ]),
    scene("A16", "保龄球", "游戏", "保龄球馆公共换鞋区", 65, 65, "鞋柜旁有选球说明，球道前的线标得很清楚。", "先找拿着舒服的球？不拿重量比胆量。", {ball:"unset",round:0}, [
      ["start", [["light-ball","选适合自己重量的轻球","先用舒服的，别硬撑。",{ball:"light"},5],["staff-size","请工作人员确认指孔与重量","这个合手，我就用它了。",{ball:"staff-fitted"},5]]],
      ["shoes", [["check-shoes","换好合脚的鞋再试走","脚趾不挤了，再过去。",{shoes:"checked"},5],["lane-rule","先看球道与等待区域规则","不越线，轮到谁谁上。",{shoes:"ready",rules:"read"},5]]],
      ["first-frame", [["first-try","自己试第一轮","刚才那球一路都很有主见。",{round:1},10],["observe-first","看对方打一轮，再自己试","好，看归看，站在等待区就行。",{round:1},10]]],
      ["score", [["read-score","一起确认计分屏上的轮次","原来刚才那一下算在这里。",{score:"understood"},5],["ignore-score","这次不追分，按轮次玩","行，我们不是来做排行榜的。",{score:"not-compared"},5]]],
      ["second-frame", [["retry","按自己的节奏再试一轮","这次你出手慢一点，看着更稳。",{round:2},12],["celebrate","先问是否想碰拳庆祝","可以碰一下，刚才确实比上一轮好。",{round:2,celebration:"asked-and-accepted"},12]]],
      ["return-shoes", [["close-score","看完这一局，收好自己的东西","结束了，先把手机和水拿上。",{game:"closed"},5],["stop-early","觉得手腕累了就提前停","那就停，不用把每一轮都补齐。",{game:"closed-early"},3]]]
    ]),
    scene("A17", "电玩城", "游戏", "电玩城公共售币机旁", 60, 40, "售币机旁写着套餐价格，里面合作机和对战机都亮着。", "先说好代币预算，用完不自动加。", {tokens:20,mode:"unset"}, [
      ["start", [["coop","选合作闯关机","那我们先商量谁管哪边。",{mode:"cooperate"},4],["versus","选一局轻松对战","好，输一局也不欠下一局。",{mode:"versus"},4]]],
      ["allocate", [["split","把本场20枚代币分开保管","各十枚，想换项目先说。",{allocation:"ten-each"},3],["shared-pool","确认共用代币，每次花前说一声","行，剩多少我们都能看见。",{allocation:"shared-visible"},3]]],
      ["first-machine", [["play-first","投币玩一轮，不立即续关","刚才那关我还没反应过来就没了。",{tokens:16,round:1},10],["learn-controls","先看操作说明，再开始第一轮","这个键才是跳，难怪刚才看不懂。",{tokens:16,round:1},10]]],
      ["change-game", [["rhythm","换到节奏机试一轮","我选简单档，手先跟上再说。",{tokens:10,machine:"rhythm"},10],["racing","换到赛车机，各自选难度","可以，你不用陪我选同一个档。",{tokens:10,machine:"racing"},10]]],
      ["budget-check", [["last-coins","只用剩下的代币，不加购","剩十枚，我们挑最后一个。",{budget:"locked"},8],["keep-rest","不想继续就留着代币停手","行，今天不必把每一枚都花掉。",{budget:"stop"},3]]],
      ["leave-arcade", [["cash-out","按场馆规则处理余币，离开","问清楚了，别为了余币再买一包。",{game:"closed"},5,0,"电玩城公共出口"],["quiet-exit","到安静的公共区域再聊天","这里终于能听清你说话了。",{game:"closed",noise:"quiet"},5,0,"商场公共休息区"]]]
    ])
  );
  scenes.push(
    scene("A18", "羽毛球", "运动", "公共羽毛球馆场边", 70, 45, "场边的预约牌写着结束时间，饮水区在入口旁。", "今天想轻松打，还是计分？先说说平时打多少。", {intensity:"unset",round:0,energy:"fresh"}, [
      ["start", [["casual","选轻松对打，不计分","好，先让球来回几次。",{intensity:"casual"},5],["score","双方确认打一局短局","到点就停，别为了最后一分拖场。",{intensity:"short-game"},5]]],
      ["warm-up", [["own-warmup","按自己的习惯轻松热身","我也活动一下，先不急着打。",{warmup:"done"},8],["staff-ask","不熟悉场地，先问工作人员规则","球场边线和时间都问清楚了。",{warmup:"done",rules:"checked"},8]]],
      ["rally", [["slow-rally","先做慢速往返","这个速度我跟得上。",{round:1,energy:"comfortable"},12],["short-court","缩短落点，先找手感","行，不用每一球都往最后面送。",{round:1,energy:"comfortable"},12]]],
      ["water-break", [["water","主动暂停喝水","我也想歇两分钟。",{energy:"rested"},5,0,"羽毛球场边休息区"],["lower","感觉太快，明确降低强度","收到，我们慢一点，不比体力。",{energy:"rested",intensity:"lower"},5,0,"羽毛球场边休息区"]]],
      ["last-round", [["few-rallies","再打几次轻松往返","好，就到预约结束前。",{round:2},10],["stop-sport","觉得累了就结束运动部分","那就停，今天已经打到球了。",{round:1,energy:"stopped"},2]]],
      ["return-court", [["clear-floor","收好球与瓶子，让出场地","这几只球都捡到了。",{court:"returned"},5],["leave-before-time","提前归还场地，慢慢收拾","好，下一组可以进来了。",{court:"returned-early"},5]]]
    ], {pacing:"轮次之间短聊，运动时不长谈",talkMinutes:2,requirements:["按个人经验选择低强度起步","不适随时停止","不提供专项训练或医疗判断"]}),
    scene("A19", "攀岩体验", "运动", "攀岩馆公共接待区", 95, 100, "接待台旁写着新手须知，装备与安全检查由教练负责。", "先听教练说明。我们各选自己的难度，不互相催。", {briefing:false,route:"unset",energy:"fresh"}, [
      ["start", [["coach-intro","报名教练带领的新手体验","好，安全的事都问教练。",{booking:"coach-session"},5],["rules-first","先看参与要求，确认能否参加","不合适就换活动，不用硬上。",{booking:"requirements-checked"},5]]],
      ["briefing", [["listen-coach","完整听教练讲解场馆规则","等教练说可以了再开始。",{briefing:true,equipment:"coach-checked"},15],["ask-coach","把不懂的操作直接问教练","这个我也不确定，一起听答案。",{briefing:true,equipment:"coach-checked"},15]]],
      ["choose-route", [["easy-route","各自选择最低难度体验线","我先用最简单的，看看自己习不习惯。",{route:"intro"},5],["observe-route","先看教练示范，再决定是否尝试","看明白再选，不急。",{route:"observed-intro"},8]]],
      ["try", [["coach-attempt","只在教练确认后尝试一轮","你按自己的节奏，我在等待区。",{attempt:1,energy:"used"},15],["observe-only","决定本轮只观看，不上墙","可以，今天看一遍也算认识这项活动。",{attempt:0,energy:"fresh"},10]]],
      ["rest", [["rest-water","到公共休息区喝水","手先歇一歇，别马上加难度。",{energy:"rested"},8,0,"攀岩馆公共休息区"],["decline-repeat","明确不再尝试，等教练结束体验","行，我们不需要给今天加一道考试。",{energy:"stopped"},5,0,"攀岩馆公共休息区"]]],
      ["check-out", [["staff-return","由工作人员检查并收回装备","装备交好了，我们把自己的东西拿上。",{equipment:"returned-by-staff"},8],["feedback","向教练说清哪里不适应，再结束","我刚才也想问这个，听教练怎么建议。",{equipment:"returned-by-staff",feedback:"shared-with-coach"},8]]]
    ], {pacing:"安全说明优先，等待区交谈",talkMinutes:2,requirements:["先确认场馆参与要求","教练负责装备、安全与技术指导","身体不适或不愿尝试时立即停止"]}),
    scene("A20", "骑行", "户外", "公共租车点", 85, 35, "租车点地图只标了平坦公共骑行道，归还截止时间写在牌上。", "先选短线？速度按慢的那个人来。", {route:"unset",bike:"uncollected",pace:"slow"}, [
      ["start", [["short-loop","确认公共平坦短环线","好，路口多的地方我们推着走。",{route:"short-loop"},5],["riverside","确认沿河短线和折返点","就到那座公共桥，不临时往远处绕。",{route:"riverside-short"},5]]],
      ["bike-check", [["staff-check","请工作人员检查车辆与头盔","都确认好了再拿走。",{bike:"staff-checked"},10],["adjust-fit","请工作人员调整适合的车辆","脚能稳稳落地了，舒服一些。",{bike:"staff-fitted"},10]]],
      ["start-ride", [["easy-pace","按约定低速骑到第一个公共停靠点","这个速度可以，先不加。",{ride:"first-leg"},15],["push-busy","人多的路段下车推行","行，这段慢一点比较省心。",{ride:"first-leg-pushed"},15]]],
      ["stop", [["water-stop","在允许停靠的公共区域喝水","车放在标线里，我们再歇会儿。",{rest:"water"},8,0,"公共骑行休息点"],["shorten","感觉累了，把路线缩短","收到，按最近的归还路线回。",{rest:"shortened",route:"return-short"},5,0,"公共骑行休息点"]]],
      ["return-ride", [["back-same","按原路慢慢骑回","好，不赶最后一分钟。",{ride:"returned"},15],["walk-return","不想再骑就推车走回近处站点","可以，少骑这一段也没关系。",{ride:"returned-on-foot"},18]]],
      ["return-bike", [["verify-return","确认车辆归还完成再离开","还车提示出来了，我这辆也好了。",{bike:"returned"},5,0,"公共租车归还点"],["staff-help","归还失败时请工作人员协助","先把这一步处理完，不先走掉。",{bike:"returned-with-help"},8,0,"公共租车归还点"]]]
    ], {requirements:["公共平坦路线，不进入机动车危险路段","车辆与防护由工作人员检查","天气不适或体力不足可取消，按时归还"]}),
    scene("A21", "野餐／近郊短徒步", "户外", "近郊公共公园入口", 100, 35, "入口有短步道、公共休息亭和交通时刻表，路线没有进入偏僻区域。", "我们先选一条随时能折返的短线。吃的也先看忌口。", {plan:"unset",food:"packed",weather:"clear"}, [
      ["start", [["picnic","选入口附近的公共野餐区","这边离出口近，也有别人休息。",{plan:"picnic"},5,0,"公共野餐休息区"],["short-trail","选有路标的平坦短步道","走到公共亭就回，不进山路。",{plan:"short-trail"},5,0,"有路标的公共短步道"]]],
      ["food-check", [["own-food","各自吃自己带的食物","好，配料说不准的就别互相分。",{food:"own"},8],["label-share","看清配料后，只分享明确愿意吃的","这个配料你能吃，那就分一点。",{food:"checked-and-shared"},8]]],
      ["public-rest", [["shelter","到公共休息亭坐一会儿","这个位置能看见路口，挺好找。",{rest:"shelter"},15,0,"公共休息亭"],["short-walk","沿清楚路标再走一小段","到下一个牌子我们就回头。",{rest:"short-walk"},15]]],
      ["weather", [["light-rain","下小雨就到近处公共室内备选","不淋着硬撑，走入口游客中心。",{weather:"rain",plan:"indoor-backup"},10,0,"公园公共游客中心"],["clear-return","天气还好，也按原计划折返","别因为太阳出来就又加一条线。",{weather:"clear",plan:"return"},10]]],
      ["pack-up", [["take-rubbish","收好自己的垃圾和用品","这块比我们来时还干净一点。",{food:"packed-away"},8],["check-belongings","互相提醒检查地上的物品","水杯、外套都在，没落东西。",{food:"packed-away",belongings:"checked"},8]]],
      ["transport", [["public-stop","按时回到公共交通站点","这班都来得及，我们慢慢等。",{return:"public-stop"},15,0,"公园公共交通站"],["near-exit","体力不足就从最近的公共出口返程","好，走近路，不需要补足步数。",{return:"short-exit"},10,0,"公园最近公共出口"]]]
    ], {requirements:["仅公共区域平坦短线，不进入偏僻山路","提前看天气、交通和食物配料","任何一方可随时折返"]}),
    scene("A22", "清吧／小酒馆", "夜间", "清吧公共吧台外侧", 65, 70, "酒单的无酒精饮品单独列了一页，轻音乐下能正常说话。", "我先看无酒精那页。你想喝什么按自己的来。", {drink:"unset",refill:"none",volume:"low"}, [
      ["start", [["quiet-seat","选能正常交谈的安静位置","这边刚好，不用往前凑。",{seat:"quiet"},4],["bar-side","选公共吧台外侧的位置","可以，离出口也好找。",{seat:"bar-side"},4]]],
      ["drink", [["zero-alcohol","各选一杯无酒精饮品","我点这个柚子气泡水。",{drink:"zero-alcohol"},5],["own-choice","各自确认饮品与预算，不替人下单","我这杯不含酒精，你按自己的选。",{drink:"individual-confirmed"},5]]],
      ["music", [["song","聊起正在放的一首歌","我知道副歌，但一直没记住名字。",{topic:"current-song"},8],["ordinary-day","聊一件今天发生的小事","我来的路上把店名看成了另一家。",{topic:"ordinary-day"},8]]],
      ["refill", [["no-refill","明确不续杯","好，就这一杯，不劝你。",{refill:"declined"},3],["water","只续一杯水","我也要水，慢慢喝。",{refill:"water-only"},3]]],
      ["bill", [["own-bill","说清各自的消费，分别结账","行，各自看自己的那杯。",{bill:"separate"},5],["check-list","一起核对账单，不默认替人付款","这两项对上了，再按说好的付。",{bill:"checked"},5]]],
      ["leave", [["public-exit","到公共门口各确认回程","我这边叫到车了，你慢慢确认。",{return:"checked"},5,0,"清吧公共门口"],["no-second-bar","不续下一家，按原安排结束","好，今天就这一站。",{return:"no-second-bar"},3,0,"清吧公共门口"]]]
    ], {alcohol:true,time:"20:00",pacing:"可正常交谈，不以喝酒推动关系",requirements:["成年公共营业场所","全程可选无酒精饮品","饮酒者不驾车，各自确认安全回程"]}),
    scene("A23", "热闹酒吧", "夜间", "酒吧公共入口", 65, 90, "门内音乐很响，入口旁能看见安静座位和出口指示。", "先看看能不能听清说话。不舒服我们就出去。", {noise:"loud",drink:"unset",dance:"not-asked"}, [
      ["start", [["quiet-corner","选远离音箱的公共角落","这里稍微能听见了。",{noise:"lower"},5,0,"酒吧公共角落"],["edge-seat","选靠近出口的公共座位","好，想走时不用挤过整个人群。",{noise:"loud",seat:"exit-side"},5,0,"酒吧出口旁公共座位"]]],
      ["order", [["soft-drink","点无酒精饮品，保留自己的杯子","我也先点水，不急着喝别的。",{drink:"zero-alcohol"},5],["check-budget","确认单杯价格与预算后各点各的","价格说清楚了，不替对方加单。",{drink:"individual-confirmed"},5]]],
      ["hear", [["repeat","听不清就请对方重复短句","我没听清最后几个字，你再说一次？",{communication:"short-repeat"},4],["move-public","提议换到更安静的公共位置","可以，这里说话太费嗓子了。",{noise:"lower",communication:"relocated"},5,0,"酒吧公共休息区"]]],
      ["dance", [["ask-dance","先问对方是否想跳舞，不默认接触","我今天不想跳，坐着听就好。",{dance:"declined"},4],["stay-seated","不跳舞，坐着听完这一首","好，我也想把这首听完。",{dance:"not-requested"},5]]],
      ["no-pressure", [["decline-round","拒绝续杯或续摊","收到，今天不加下一轮。",{refill:"declined"},3],["water-break","喝水并确认是否想离开","我想再坐两分钟，然后出去。",{refill:"water",departure:"soon"},3]]],
      ["exit-plan", [["public-pickup","去明亮公共接送点各自返程","就到这里，我确认一下车牌。",{return:"public-pickup"},5,0,"明亮公共接送点"],["staff-direction","向工作人员确认公共出口方向","问清楚了，从这边走。",{return:"staff-confirmed"},5,0,"酒吧公共出口"]]]
    ], {alcohol:true,time:"21:00",pacing:"噪音下短句交流，重要问题换安静处再谈",requirements:["成年公共营业场所","不以饮酒、身体接触或续摊作为必选步骤","各自掌握回程安排，饮酒者不驾车"]}),
    scene("A24", "Livehouse／小型现场", "夜间", "演出场馆公共检票口", 120, 110, "演出单标着时长与散场出口，场内有靠后的观看区。", "你喜欢靠前还是后面？站得舒服比挤到前排重要。", {ticket:"unchecked",show:"not-started",noise:"normal"}, [
      ["start", [["check-ticket","一起核对票面、时长与出口","这场到九点半，我们各自看好回程。",{ticket:"checked"},5],["staff-rules","先向工作人员问清入场规则","好，不确定的先问。",{ticket:"checked",rules:"staff-confirmed"},5]]],
      ["position", [["back","选择靠后不拥挤的观看区","这里也看得到，我不想往前挤。",{position:"back"},5,0,"演出场馆靠后公共观看区"],["side","选择远离音箱的侧后方","好，听得舒服一点。",{position:"side-back"},5,0,"演出场馆侧后方公共观看区"]]],
      ["setlist", [["known-song","入场前聊一首想听的歌","如果唱到那首，我应该能跟上副歌。",{song:"named-before-show"},5],["new-band","坦白不熟悉歌单，先听现场","没关系，我也有很多歌只听过一遍。",{song:"open-listen"},5]]],
      ["performance", [["listen","演出中专心听，不要求长聊","开始了，先听。",{show:"finished",noise:"loud"},75],["back-rest","在允许的后区听，累了自行休息","好，想歇一下就留在后面。",{show:"finished",noise:"loud",rest:"available"},75]]],
      ["encore", [["one-memory","演出结束后说一段记住的声音","刚才鼓停掉那一下，我还在想。",{noise:"normal",discussion:"specific-moment"},8],["different-song","说出与对方不同的最爱曲目","你选那首？我倒更喜欢开头那首。",{noise:"normal",discussion:"different-choice"},8]]],
      ["disperse", [["follow-exit","按工作人员指引从公共出口离场","人散开一点我们再走。",{return:"public-exit"},8,0,"演出场馆公共出口"],["check-transit","在明亮公共区域确认各自交通","我先看地铁还有几班。",{return:"checked"},8,0,"场馆外明亮公共区域"]]]
    ], {pacing:"演出中少说话，间隙与散场后交流",talkMinutes:1,requirements:["双方确认票务与演出时长","遵守场馆站位与出口规则","不强求向前挤、拍照或肢体接触"]})
  );
  const profiles = {};
  const roleRows = [
    ["R16","许棠",26,"woman",2,"喜欢沿河走路，也爱研究桌游规则。","想看看意见不同时还能不能自在相处","去照看朋友寄养的猫","上次桌游我认真算了半天，最后忘记自己轮到哪一步。","我不是迷路，只是在给地图做压力测试。","周六十点，河边公共步道入口","语速轻快，讲具体事，发现自己说错会直接改口。","会主动定折返点，游戏规则不懂就翻卡。","你刚才说的那个选择，后来真做了吗？","河边那家早餐摊有一次把我的豆浆装进了汤碗。"],
    ["R17","程岚",31,"woman",3,"逛市集会先绕一圈，晚上喜欢找能听清说话的位置。","想认识消费习惯能说清楚的人","去接来访的表妹","我买过一盏小灯，回家才发现桌上根本没有空位。","先看看，我的钱包今天比较内向。","周日下午四点，旧物市集服务台","从容，有一点自嘲，不拿价格评价人。","会提前问预算，吵闹时提出换公共位置。","这件你是真喜欢，还是刚好被摊主说动了？","我曾在两家招牌一样的店等了朋友二十分钟。"],
    ["R18","苏晴",28,"woman",5,"爱玩轻合作游戏，对小吃的兴趣比竞技胜负稳定。","想遇到输了也能正常聊天的人","回家取已经预约上门维修的东西","我玩合作游戏时把提示卡当装饰，大家一起卡了十分钟。","这局输了，至少饮料还在我方。","周五七点，商场桌游店公共入口","松弛、直白，玩笑落在具体局面，不拿人开刀。","会提议换玩法，也会说自己已经吃够了。","你先把这步说完，我还真没想到。","有次我排队买小吃，轮到时忘了自己本来想点什么。"],
    ["R19","叶遥",30,"woman",6,"看展喜欢读小字说明，运动时愿意从简单的开始。","想和愿意承认不知道的人慢慢认识","赶上预约好的琴房时段","我看过一个装置，以为没开机，后来发现静止就是作品。","今天的技术水平，主要体现在会挑简单的。","周日两点，市美术馆公共前厅","平静、短句，不把普通沉默解释成尴尬。","会先问教练，不擅长的事不装熟。","这个地方我没看明白，你指给我看看？","我第一次借羽毛球拍，花了很久才分清哪只球是自己的。"],
    ["R20","唐汐",27,"woman",7,"喜欢现场音乐，也常逛手作快闪的小摊。","想了解彼此怎样照顾自己的节奏","去还朋友借给我的唱片","我认错过一支乐队，整场都在等一首根本不会唱的歌。","这首我会，准确说是会最后三个字。","周六六点，小型演出场馆公共检票口","自然、带一点兴奋，听不清就直接重问。","会选靠后站位，也允许彼此不追同一首歌。","你说的是鼓停的那一下，还是前面那段？","有次我买徽章，最后最喜欢的反而是摊主装袋的小纸条。"],
    ["R21","方萤",33,"woman",8,"周末会打羽毛球，吃饭习惯先确认忌口。","想看看一起安排小事是不是省心","回家接视频上课的侄女","我曾在球馆把两只一模一样的水杯认错，直到发现吸管颜色不同。","我可以认真吃饭，认真跑步得预约。","周日上午十点，社区球馆公共接待区","明确、温和，先说自己的需要再问别人。","会主动休息，不把体力差当成需要证明的事。","你刚才说太快了，那我们就慢下来。","我煮面时认真摆盘，拍完发现忘了放盐。"],
    ["R22","纪禾",29,"woman",9,"看电影不爱提前读长评，偶尔去听小型现场。","想认识能保留不同口味的人","去把送修的耳机取回来","我在电影散场后夸错过一个角色，朋友提醒我那人第一幕就退场了。","我对片长很诚实，对预告片不一定。","周五六点半，影院公共大厅","有细节感，反应慢半拍，不强行把意见凑成一致。","会说自己不喜欢哪一段，但不替别人下结论。","你喜欢那段啊，我刚好没那么投入。","我找一首歌找了两天，最后发现记住的是开场音效。"],
    ["R23","周苒",25,"woman",10,"喜欢散步时看树，也愿意慢慢做一件小手工。","想遇到不会替人把选择做完的人","回家给阳台的苗换盆","我养过一盆只长一边的薄荷，后来发现另一边一直贴着窗帘。","这只杯子挺好，至少没有假装自己是圆的。","周日下午一点，工作坊公共接待桌","细声但有主意，话少时不等于同意。","会主动保留自己喜欢的不规则边，也能拒绝帮忙。","你先不用替我改，我想再试一会儿。","我有次走路只顾看树牌，原地绕过同一个饮水点三次。"],
    ["R24","孟寻",32,"woman",11,"逛旧物会问来历，玩游戏喜欢先读清规则。","想知道对方怎样表达不同意见","去帮朋友确认店铺打烊清单","我买过一个旧棋盒，回家发现最完整的是上一任留下的记分纸。","这条规则先不靠气势，靠字。","周六两点，旧物市场公共入口","清楚、略带干笑话，不用反问压人。","会停下来核对规则与价格，不被催促带着走。","我们理解不一样，先看它原来怎么写。","我曾替朋友记过账，最难分类的一项叫临时想吃。"],
    ["R25","宋知夏",28,"woman",13,"喜欢公园的短线，也爱跟朋友玩一小局桌游。","想体验不需要一直表现的相处","去参加小区晚间读书会","我在公园记住了一只猫的路线，比记住自己选的路线还准。","我们可以走短线，给脚留点好印象。","周日下午五点，公园公共东门","亲切但不替人打圆场，普通话题也认真接。","会先给出一个轻松选项，觉得累了直接说。","这个小事我听懂了，后来你怎么处理的？","我玩桌游时曾把一张过期提示留到终局，舍不得用。"],
    ["R26","林霁",34,"woman",14,"运动偏好低强度入门，逛市集只带一个小袋。","想认识尊重各自能力边界的人","回去交接志愿服务物资","第一次打保龄球，我最满意的是鞋选得很合脚。","我今天的目标是完整收回自己的水杯。","周日三点，保龄球馆公共换鞋区","实在，偶尔一两句冷幽默，拒绝时不绕圈。","会请工作人员检查设备，不接受被催着加难度。","不会就先看一轮，没什么丢人的。","我搬活动物资时数了三遍箱子，最后发现少的是清单。"],
    ["R27","邵宁",30,"woman",15,"喜欢安静听歌，也会为了好吃的多等一小会儿。","想认识不用靠喝酒拉近距离的人","去接夜班下班的姐姐","我认真收藏过一家小馆的菜单，后来发现最喜欢的那道只写在黑板上。","无酒精也能碰杯，杯子并不介意。","周五八点，清吧公共门口","稳，偶尔调侃物件，清楚表达愿意与不愿意。","会先点无酒精饮品，听到拒绝就换话题。","你不喝也没关系，想吃点什么？","我找歌名时把整段歌词哼给朋友，最后靠鼓点认出来。"],
    ["R28","周叙",29,"man",1,"喜欢看旧展册，走路时会留意街区招牌。","想看看能不能从同一个地方看见不同东西","去给邻居送回备用钥匙","我按旧地图找过一家店，找到时它已经变成修鞋铺了。","认路我有经验，走错也算经验。","周六三点，街区公共地图牌旁","短句，有时认真接一句玩笑，不滔滔讲知识。","会先说自己想走哪条路，再听对方的。","你注意到的是这个角，我刚才只看见招牌。","我买过一本展册，最常翻的是最后那张场地图。"],
    ["R29","何屿",26,"man",2,"爱走短徒步，也玩不太需要反应速度的桌游。","想和能主动说累了的人自在相处","回家遛邻居托看的狗","我第一次短徒步带了很多零食，最后最需要的是一双干袜子。","我们先走短线，让背包觉得没白来。","周日上午九点半，近郊公园公共入口","直接、轻松，不用逞强式玩笑。","会提前看交通时刻，路线太长就缩短。","那就停一会儿，来都来了也不用走满。","我在桌游里保留过所有道具，结果结束时一件没用。"],
    ["R30","顾衡",33,"man",3,"逛市集看木作，听现场更愿意站在后排。","想了解彼此怎样分配时间和预算","去帮同事确认活动收尾","我做活动时丢过一卷胶带，最后在自己手腕上找到。","我先看一圈，决定权和钱包都还在。","周日下午两点半，周末市集服务台","条理清楚，愿意解释一次，不把选择变成考试。","会确认汇合点，不因各逛各的而猜测关系。","你要再看一会儿就说，我们把时间改清楚。","有次现场唱了我最熟的歌，我却只记得该进副歌前的停顿。"],
    ["R31","江临",28,"man",4,"喜欢把手作做得能用，运动愿意跟教练从零开始。","想认识可以互相求助也能独立完成的人","回去参加社区器材交接","我做过一个杯子，把手很正，杯口却完全不是圆的。","这次至少能看出来，我们是亲手做的。","周六一点，陶艺店公共工作台旁","朴素、具体，不以熟练程度抢话。","会先问需要什么帮助，拒绝后就收手。","你要我递材料，还是先让我别动？","我初学攀岩时记住了路线颜色，忘了看教练指的位置。"],
    ["R32","陈望",31,"man",5,"喜欢一局能结束的游戏，对面食有稳定偏好。","想看看不顺利时还能不能好好说话","去取预订好的生日蛋糕","我玩赛车游戏时看错屏幕，替别人紧张了一整圈。","这不是反应慢，是我给剧情留了余地。","周五七点半，桌游店公共接待台","松弛，有点自嘲，不借玩笑绕过问题。","会承认自己没接住梗，也能明确不再加一局。","我刚才没懂，你愿意再说一次吗？","我点过一家店的招牌面，认真研究菜单后又点了同一碗。"],
    ["R33","赵聿",27,"man",7,"喜欢听鼓的现场，也爱看市集上的旧相机。","想和能保留各自兴趣的人认识","回去把借来的转接线还掉","我为听一首歌买了票，最后最喜欢的却是返场那段鼓。","站后面也挺好，我终于能看见整支乐队。","周六七点，演出场馆公共检票口","有点活泼，句子短，兴奋时也会检查对方是否听清。","会选不拥挤的站位，不要求一起挤前排。","你想往后站？行，那边声音也没那么顶。","我找过半天镜头盖，最后它一直套在另一只杯子底下。"],
    ["R34","贺川",35,"man",10,"周末愿意慢慢做饭，也喜欢沿公共绿道走一段。","想认识能把小安排说明白的人","回家接维修师傅的预约电话","我烤过一盘形状很整齐的饼干，出炉后全连成一块了。","这是家庭装，不是我没分开。","周日两点，烘焙教室公共接待区","温和、务实，会提自己的需要，不总说都可以。","会先核配料和时间，不擅自替人加料。","这个我想少放一点，你那份按你的来。","我走绿道时记下过三个休息点，最后最喜欢入口那张长椅。"],
    ["R35","陆闻",30,"man",11,"买旧物先看能不能用，游戏里爱试小策略。","想了解对方如何做不一样的决定","去给朋友送展台零件","我买旧桌游时少了一枚棋子，用一颗扣子替了很久。","这枚扣子的战绩，目前比原装棋子好。","周六四点，二手市集公共入口","克制的幽默，愿意听完，不靠术语显示懂得多。","会说出预算上限，规则争议时先停一停。","你这个办法我没试过，先听你说完。","我装展台时把螺丝分得很清楚，最后找不到分装盒。"],
    ["R36","秦越",32,"man",12,"喜欢画小幅风景，也会认真看展览的材质说明。","想遇到审美不同也不用互相说服的人","去收回朋友画展的剩余画框","我画过一张傍晚街景，朋友说最像的是路边那只垃圾桶。","画歪一点没关系，它又不用交房租。","周日下午三点半，绘画工作坊公共门口","平静，有一点画面感，不把所有感受写成大道理。","会保留自己的配色，也愿意看对方的做法。","你喜欢这个颜色就留下，不用照着我的改。","有次看展我绕了两圈，最后最记得门口地毯的图案。"],
    ["R37","梁序",25,"man",13,"爱逛公园也玩轻松球类游戏，比分记得没路标牢。","想和可以轻松说不的人一起做点小事","回去给室友庆祝转正","我保龄球第一局全在研究计分，打完才知道自己的球道号。","分数先不着急，至少我们没走错球道。","周日上午十一点，公园公共北门","爽快，话题切换自然，不把沉默当成需要拯救的事。","会先问要不要继续，不用激将法。","不想继续就到这儿，咱换个小话题。","我散步捡过一片很好看的叶子，到家发现拿的是购物小票。"],
    ["R38","徐骁",34,"man",14,"运动喜欢按预约收场，逛街不赶着把店都看完。","想认识按说好的节奏相处的人","赶上社区志愿队的碰面时间","我第一次打台球，记住了所有球色，唯独没记住轮到谁。","我会看时间，这项技能今天先发挥好。","周日四点，羽毛球馆公共休息区","稳、直接，解释安排时给具体时间。","会提前提醒剩余时段，别人休息时不催。","还有十分钟，你想再试一次还是收拾？","我参加市集搬运，最后记得最清楚的是哪条路有坡。"],
    ["R39","许湛",29,"man",15,"小馆和现场都愿意试，更在意能不能正常交谈。","想认识能把关系期待直接说出来的人","去接晚到的大学同学","我在清吧点过一杯名字很长的饮料，最后记住的只有不含酒精。","喝水也行，我们又不跟酒单谈恋爱。","周五八点半，小酒馆公共入口","自然、清楚，不用含糊话维持气氛。","会说明自己期待，也接受对方不想继续。","你的意思我听到了，我也说一下我现在想要什么。","我等过一锅很香的汤，上桌时却先把碗放反了。"]
  ];
  const addedRoles = roleRows.map(([id,name,age,presentation,pair,bio,goal,obligation,story,joke,next,voice,initiative,listen,secondStory], index) => {
    profiles[id] = {voice,initiative,avoidStyle:"明确拒绝后停止推进；不把没接话当作同意，也不编造共同经历。"};
    return {id,name,age,presentation,pronoun:presentation === "woman" ? "她" : "他",players:["woman","man","nonbinary","unspecified"],affinityPair:pair,traits:[["direct","space","steady"],["curious","humor","warm"],["steady","warm","space"]][index%3],interests:[],scenes:[],bio,reason:initiative,goal,limit:72+index*3,obligation,greeting:"先找个舒服的节奏吧。你有特别想做的事可以直接说。",story,stories:[story,secondStory],listen,quiet:`可以先安静一会儿。${index%3===0?"我也想看看眼前这个。":index%3===1?"有想说的再接着说。":"我们不用一直找话题。"}`,joke,next,proposal:`下次我有一个想法：${next}，你愿意吗？`,bye:`我得${obligation}了，今天就先到这里。`,turnDown:`今天不再延长了，我还得${obligation}。`,stayStyle:index%3===0?"leave":index%3===1?"offer-walk":"leave",nextStyle:index%4===0?"clarify":undefined};
  });
  const examples = [];
  const exampleRows = [
    ["A03","口味","我吃不了你那个辣度","分锅吧，又不是非得一起冒汗。","双方尚未选锅底；不把分锅当关系分歧","直接务实"],
    ["A04","排队","我不想再排了","那就走，我也没跟这家摊签约。","仍可更换摊位；没人已替对方购买","轻松接梗"],
    ["A05","不同感受","我没太看进去后半段","我倒喜欢那一段。你是从哪里开始走神的？","影片已结束；允许口味不同","温和好奇"],
    ["A06","解读","这个看着有点像坏掉的门","你一说我也开始找门把手了。","双方正在看同一件作品；只回应眼前比喻","干笑话"],
    ["A07","推荐","你给我挑一本？","可以，先说说你真会读什么，别让我给你买一件摆设。","对方明确愿意接受推荐；未自动购买","有主意"],
    ["A08","疲劳","我今天不太想走那么远","那到前面长椅就折返。","路线仍在公共公园；前方确有休息点","清楚照顾节奏"],
    ["A09","改路","这边施工，绕一下？","看下地图，别为了躲十米走出两公里。","已发现施工路段；必须走公共安全路线","务实幽默"],
    ["A10","分开逛","我们想看的摊不一样","那各看十分钟，服务台见？","需等待对方确认汇合时间与地点","独立直接"],
    ["A12","小失误","我好像把它搅成了一整块","先问老师，别急着加别的。","正在烘焙；老师负责技术判断","冷静务实"],
    ["A13","审美","你不觉得这个颜色太亮了吗","是亮，但我挺喜欢，先留着。","角色确实喜欢该配色；不强迫对方认同","边界清楚"],
    ["A14","规则","这步到底算不算？","翻一下规则卡吧，我刚也没看明白。","规则卡可用；不编造权威裁决","坦诚"],
    ["A15","教学","你直接帮我摆姿势吧","我先口头说，你试试。不确定的问工作人员。","没有已确认的身体接触；不实施手把手指导","尊重边界"],
    ["A16","失手","又进沟了，挺有节目效果","节目还没结束，我再试一轮。","角色愿意继续且时间允许；不评价技能之外的人格","自嘲"],
    ["A17","预算","再买一袋币吧","我今天就这些预算，用完想停。","角色预算已固定；不因用户坚持而自动加购","坚定平静"],
    ["A18","强度","你能不能慢一点","可以，我刚才打快了。","正在运动且对方要求降强度；立即调整","直接修复"],
    ["A19","退缩","我看着有点怕，不想上去了","那就不上，今天看看也行。","用户明确不愿尝试；不使用激将法","不催促"],
    ["A20","速度","我有点跟不上","到前面允许停车的地方停一下，后面按你的速度来。","公共路线上存在允许停车处；不在行进中长聊","具体行动"],
    ["A21","天气","下雨了，还要走吗","不走远了，回入口那个公共休息区。","公共休息区确实存在；不转入偏僻地点","可靠"],
    ["A22","拒酒","我不喝酒","好，看看无酒精那页。","有无酒精饮品；不追问拒酒原因","普通回应"],
    ["A23","听不清","你刚才说什么？","我说这里太吵了，换那边公共休息区？","先提出换位，等对方选择；不默认身体接近","短句"],
    ["A24","歌单","这首你是不是等了一整晚","嗯，前面都不会，这首终于能唱副歌了。","角色先前确实说过期待这首；只在间隙交谈","轻松兴奋"],
    ["S02","平常","你今天点什么","我想喝茶，咖啡刚才已经喝过一杯。","角色当前确实已有一杯咖啡；否则不能引用","朴素"],
    ["S05","清楚忌口","香菜可以吗","我不吃，给我那份先不放。","仍未下单；忌口来自当前角色表达","明确"],
    ["S07","独立完成","要不要我帮你弄","先不用，我想自己把这边救回来。","角色想独立完成且安全；拒绝不等于不喜欢用户","慢热有主意"],
    ["A03","修复","我不是嫌你点得多","我知道了，我也确实不想剩太多。","此前发生点菜误解；不额外编造争执","直接修复"],
    ["A05","安静","现在聊一下剧情？","先看吧，出去以后我想听你的说法。","影片仍在放映；不能在安静观影期长聊","有分寸"],
    ["A06","留白","我想自己看一会儿","好，十分钟后回刚才的长椅？","只是提出汇合安排，需另一方确认","给空间"],
    ["A08","普通回应","这风挺舒服","嗯，比刚才路口凉快。","确有来自路口的前情；不把普通陈述强行升级成调情","安静自然"],
    ["A10","预算差异","这个有点超我预算","那就不买，逛到这儿也挺值。","用户明确预算上限；不替用户付款推进关系","尊重选择"],
    ["A12","分工","你怎么老盯着我的秤","我怕把两份弄混。要不各自核自己的？","称量阶段确有两份配料；提出分工不替用户同意","轻微分歧"],
    ["A13","赠送","做好这个就送你？","先让我看看成品，也让我自己决定收不收。","尚未同意收礼；不自动改变成品归属","独立"],
    ["A14","竞争","你是不是故意让我","没有，我刚才那步真没算明白。","角色确实失误；不把输赢包装成好感证据","坦白"],
    ["A16","接梗失败","这一球是来探亲的吧","这句我没懂，你说它又回沟里了？","角色没有听懂玩笑；允许澄清而非硬接","朴素好奇"],
    ["A18","休息","我想先坐会儿","好，球拍放好，我也喝点水。","立即停止相关运动，不要求解释体力","务实"],
    ["A22","关系期待","你只想随便认识一下吗","我想认真了解，但今天还没法答应排他。","角色固定目标支持认真了解；没有已确认排他协议","清楚而不讨好"],
    ["A24","不同选择","你怎么不往前挤","我想听得舒服一点。你想靠前可以自己选，我们先说好散场在哪见。","不把位置差异解释成拒绝；汇合需双方确认","有主见"]
  ];
  examples.push(...exampleRows.map(([scene,tag,user,reply,requires,style]) => ({scene,tag,user,reply,requires,style,source:"原创虚构互动，仅学习表达方式，不是本场事实"})));

  function enrichLegacy(content) {
    const extra = (id,label,reply,to,patch,location) => ({id,label,reply,to,patch,minutes:2,cost:0,...(location?{location}:{})});
    const coffee = content.scenes.find(item => item.id === "S02");
    Object.assign(coffee, metadata("A01","吃喝",24,30,false,false,"短句闲聊与挑饮料交替",["先确认饮品与座位偏好","价格为本场模拟预算"]), {name:"咖啡／茶饮",description:"从座位、饮品和眼前的菜单开始，不绑定关系阶段。",opening:"我想找个能听清说话的位置。你想坐里面，还是先看看菜单？",initialState:{drink:"unset",seat:"unset"}});
    coffee.nodes.start.push(extra("coffee-menu","先看饮品菜单","我想选不太甜的，你看你的。","drink-menu",{drink:"choosing"}),extra("coffee-sold-out","问想喝的饮品是否还有","那款刚卖完，我们看看别的。","drink-rechoose",{drink:"sold-out"}));
    coffee.nodes["drink-menu"] = [extra("coffee-own","各点自己喜欢的饮品","好，不用为了碰杯点成一样的。","drink-table",{drink:"own-choice"}),extra("coffee-ingredients","先问配料，再选适合的饮品","配料确认了，我们再下单。","drink-rechoose",{drink:"ingredients-checked"})];
    coffee.nodes["drink-rechoose"] = [extra("coffee-tea","改点一杯茶","茶也行，我想要热的。","drink-table",{drink:"tea"}),extra("coffee-simple","选菜单上能确认配料的一款","就这款，不用凑刚才那个名字。","drink-table",{drink:"simple-choice"})];
    coffee.nodes["drink-table"] = [extra("coffee-quiet-seat","端着各自的饮品去安静座位","这里说话不用提高声音。","decision",{seat:"quiet"},"咖啡店公共安静座位"),extra("coffee-window-seat","选窗边空出来的位置","坐这儿可以，太阳晒到就再调整。","decision",{seat:"window"},"咖啡店公共窗边座位")];
    const meal = content.scenes.find(item => item.id === "S05");
    Object.assign(meal.nodes.start.find(item=>item.id==="order"),{label:"先点一碗自己想吃的面",reply:"好，我也选好了。各自确认一下再下单。"});
    Object.assign(meal.nodes.meal.find(item=>item.id==="meal"),{label:"聊聊眼前这顿饭的口味",reply:"这碗汤比我想的清淡。你那份吃着怎么样？"});
    Object.assign(meal,metadata("A02","吃喝",28,60,false,false,"点菜、上菜与交谈交替",["下单前确认忌口","加菜和付款不替双方决定"]),{name:"餐厅约饭",description:"双人桌上放着两份菜单，服务员留下水后让你们慢慢选。",intro:"双人桌上放着两份菜单，服务员留下水后让你们慢慢选。",opening:"先看吃的吧。你有什么不吃的，直接告诉我。",hint:"先说忌口和预算，想聊什么可以慢慢接。",initialState:{diet:"unchecked",order:"unset",bill:"unsettled"}});
    meal.nodes.start.push(extra("meal-dietary","先说清自己的忌口","我记住了，下单前再核一下。","dietary",{diet:"shared"}),extra("meal-own-order","提出各点一份，不替对方决定","行，我们各选各的。","menu-check",{order:"separate-proposed"}));
    meal.nodes.dietary=[extra("meal-ingredient-check","向服务员确认配料","这份配料合适，就保留它。","menu-check",{diet:"checked"}),extra("meal-change-dish","有忌口就换一道能确认的菜","换这一份，不硬吃不合适的。","menu-check",{diet:"alternative"})];
    meal.nodes["menu-check"]=[extra("meal-confirm-order","各自确认菜品后再下单","都确认了，再叫服务员。","taste",{order:"confirmed"}),extra("meal-small-order","先点够吃的小份，不自动加菜","不够再问，现在先这样。","taste",{order:"small-confirmed"})];
    meal.nodes.taste=[extra("meal-say-taste","说说实际吃到的口味","这个比我想的淡一点。","bill",{food:"tasted"}),extra("meal-eat-quiet","先吃几口，给话题留空","嗯，先吃，凉了就不好吃了。","bill",{food:"tasted-quietly"})];
    meal.nodes.bill=[extra("meal-check-bill","一起核对账单和各自消费","这几项对上了，再按说好的付。","decision",{bill:"checked"}),extra("meal-split-bill","提出各付各的，等对方确认","可以，各看自己的那份。","decision",{bill:"separate-confirmed"})];
    const clay=content.scenes.find(item=>item.id==="S07");
    Object.assign(clay,metadata("A11","手作",28,80,false,false,"手上做事，短句接话",["成品按店内流程晾干与烧制","上釉需等店员确认阶段完成"]),{name:"陶艺",description:"工作台上各有一团泥，店员把工具放在两人都够得到的位置。",intro:"工作台上各有一团泥，店员把工具放在两人都够得到的位置。",opening:"想做能用的杯子，还是先看看这团泥会变成什么？",initialState:{cup:"unshaped",storage:"table"}});
    clay.nodes.start.push(extra("clay-brief","先请店员示范最基础的做法","看一遍再动手，省得先把桌子弄满。","clay-briefing",{cup:"instruction-requested"}),extra("clay-own-shape","各自选一种简单形状","你做你的，我先试一个小碗。","clay-shape",{cup:"shape-selected"}));
    clay.nodes["clay-briefing"]=[extra("clay-watch","认真看完店员示范","先照这个试，不急着加花样。","clay-shape",{cup:"instructed"}),extra("clay-ask-tool","问清工具用途，不擅自试危险做法","这个工具我刚也没认出来。","clay-shape",{cup:"tools-checked"})];
    clay.nodes["clay-shape"]=[extra("clay-simple-cup","独立做出一个简单杯坯","能站住了，先别跟它较劲。","clay-store",{cup:"shaped"}),extra("clay-keep-edge","保留自己喜欢的不规则边","那就留着，这个边只有这一只会有。","clay-store",{cup:"irregular-finished"})];
    clay.nodes["clay-store"]=[extra("clay-label","各自写便笺，请店员收进晾干架","名字写好了，下次不会认错。","decision",{storage:"drying-labelled"},"陶艺店公共晾干架旁"),extra("clay-staff-store","请店员确认能否收好，不立即上釉","得等干透，那就按店里的流程。","decision",{storage:"staff-confirmed"},"陶艺店公共晾干架旁")];
  }

  function extend(content) {
    if (content.catalogVersion === 2) return content;
    enrichLegacy(content);
    content.scenes.push(...scenes);
    content.scenes.sort((a,b)=>a.activityId.localeCompare(b.activityId));
    const schedules={
      S02:[true,8,22],S05:[true,10,23],A03:[true,11,23],A04:[true,17,24],
      A05:[false,10,24],A06:[false,10,18],A07:[true,10,22],A08:[true,7,21],
      A09:[true,8,21],A10:[true,10,19],S07:[false,10,20],A12:[false,10,20],
      A13:[false,10,20],A14:[false,10,23],A15:[false,10,24],A16:[false,10,23],
      A17:[false,10,23],A18:[false,8,22],A19:[false,10,22],A20:[false,8,20],
      A21:[false,8,19],A22:[true,18,24],A23:[true,20,24],A24:[false,18,24]
    };
    for(const item of content.scenes) {
      item.greeting=item.opening;
      const [allowed,start,end]=schedules[item.id];
      item.secondStationAllowed=allowed;
      item.openingHours=[start,end];
      item.scheduleNote="本场虚构营业时段，不代表真实场馆营业时间或可预约场次。";
      if(item.id==="A04") item.time="18:00";
      if(item.id==="A24") item.time="19:30";
      for(const choices of Object.values(item.nodes)) for(const action of choices) {
        action.minutes=action.minutes??4;
        action.cost=action.cost??0;
        if((action.tags||[]).some(tag=>["photos","intimacy","relationship"].includes(tag))) action.requiresConsent=true;
      }
    }
    Object.assign(content.interests,{cinema:"电影",art:"展览",games:"游戏",sport:"运动",music:"现场音乐",cooking:"烘焙"});
    const oldPairs={R01:1,R03:4,R04:6,R06:12,R07:9,R08:0,R11:0,R15:8};
    content.roles.push(...addedRoles);
    const interestMap={吃喝:["food","cooking"],文娱:["books","shows","cinema","art"],户外:["walking"],逛街:["shows"],手作:["craft","cooking"],游戏:["games"],运动:["sport"],夜间:["music"]};
    for(const role of content.roles){
      if(role.id==="R03"){role.presentation="woman";role.pronoun="她";}
      if(role.id==="R07"){role.presentation="man";role.pronoun="他";}
      const pair=role.affinityPair??oldPairs[role.id];
      const likes=pairs[pair].map(index=>groups[index]);
      role.scenes=[...new Set([...role.scenes,...content.scenes.filter(item=>likes.includes(item.category)).map(item=>item.id)])];
      role.interests=[...new Set([...role.interests,...likes.flatMap(category=>interestMap[category])])];
      role.modes=pair%3===0?["mellow","spark","tension"]:pair%3===1?["spark","tension","hard"]:["mellow","spark","tension","hard"];
      role.stories=role.stories||[role.story];
      role.source="原创虚构成年人，无真人原型";
    }
    content.catalogVersion=2;
    return content;
  }
  const api = {extend, profiles, examples};
  if (typeof module !== "undefined") module.exports = api;
  else window.DatingExpanded = api;
})();
