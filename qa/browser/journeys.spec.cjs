const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
test.beforeEach(async({page})=>{await page.coverage.startJSCoverage({resetOnNavigation:false});});
test.afterEach(async({page},info)=>{fs.mkdirSync('.private/qa/browser-coverage',{recursive:true});const entries=await page.coverage.stopJSCoverage();fs.writeFileSync('.private/qa/browser-coverage/'+info.testId+'.json',JSON.stringify(entries));});
const {default:AxeBuilder}=require('@axe-core/playwright');
for(const width of [320,375,414,768,1024,1440])test(`practice controls remain readable at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/');await page.getByRole('button',{name:'挑一个想练的时刻'}).click();
 await page.locator('.setup-details summary').click();
 const radio=page.locator('input[type=radio]').first();await expect(radio).toBeVisible();
 const size=await radio.boundingBox();expect(size.width).toBeLessThanOrEqual(20);expect(size.height).toBeLessThanOrEqual(20);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await expect(page.getByText('完整练一场',{exact:false})).toBeVisible();
 if(width===768)await page.screenshot({path:'.private/qa/practice-768.png',fullPage:true});
 const scan=await new AxeBuilder({page}).analyze();expect(scan.violations.filter(v=>['critical','serious'].includes(v.impact))).toEqual([]);
});
test('offline example preserves the draft and requires explicit submission',async({page})=>{
 await page.goto('/');await page.locator('[data-go=new-practice]').click();await page.locator('[name=task-context]').fill('我想自己回家');await page.locator('[name=adult]').check();
 await page.locator('[data-go=offline-practice]').click();await expect(page.locator('.messages')).not.toContainText('TA · TA');
 await page.locator('[data-offline-choice]').first().click();await expect(page.locator('.messages .is-user')).toHaveCount(0);
 await page.locator('[data-go=offline-confirm]').click();await expect(page.locator('.messages .is-user')).toHaveCount(1);
 await page.locator('[data-go=offline-return]').first().click();await expect(page.locator('[name=task-context]')).toHaveValue('我想自己回家');
});
test('catalog selection stays local until explicitly applied and icon failures keep labels',async({page})=>{
 await page.goto('/');await page.locator('[data-home-scene]').first().click();await expect(page.getByRole('heading',{name:'约会预演'})).toBeVisible();
 await page.locator('[data-go=use-home-scene]').click();await expect(page.getByRole('heading',{name:'本场准备'})).toBeVisible();
 await page.locator('[name=task-context]').fill('我想商量下次的地点');await page.locator('[data-go=edit-scene]').click();
 await expect(page.locator('.category-icon svg path').first()).toBeVisible();await page.locator('[data-scene-choice=A08]').click();
 await page.locator('[data-scene-category=吃喝]').click();await expect(page.locator('#catalog-bar')).toContainText('在当前分类外');
 await page.locator('[data-go=use-scene]').click();await expect(page.locator('#task-scene-note')).toContainText('公园散步');
 await page.locator('[data-go=edit-role]').click();await page.locator('[data-role=R01]').click();await page.locator('[name=role-search]').fill('没有这个名字');
 await expect(page.getByText('当前筛选未显示',{exact:false})).toBeVisible();await page.locator('[data-go=choose-role]').click();
 await expect(page.locator('#task-role-note')).toContainText('林澈');await expect(page.locator('[name=task-context]')).toHaveValue('我想商量下次的地点');
 await page.route('**/icons.js',route=>route.abort());await page.goto('/');
 await page.locator('.page-nav [data-go=all-scenes]').click();await expect(page.getByText('吃喝',{exact:true}).first()).toBeVisible();
 await expect(page.locator('.category-icon').first()).toBeHidden();
});
const http=require('node:http');const {startServer}=require('../../dating-god/scripts/live-server.cjs');
test('one confirmed free-text turn supports replay, recovery and private export',async({page})=>{
 let failNextTurn=true;
 const model=http.createServer(async(req,res)=>{let raw='';for await(const chunk of req)raw+=chunk;const p=JSON.parse(raw).response_format.json_schema.schema.properties;
   if(p.reply&&failNextTurn){failNextTurn=false;res.writeHead(429);res.end('private provider response');return;}
   const result=p.findings?{findings:[]}:p.line?{line:'我想慢慢聊。'}:{reply:'好，回去路上慢一点。',detail:'',actionId:null,suggestions:['谢谢，回头见。']};res.setHeader('Content-Type','application/json');res.end(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify(result)}}],usage:{prompt_tokens:10,completion_tokens:5,total_tokens:15}}));});
 await new Promise(resolve=>model.listen(0,'127.0.0.1',resolve));const app=await startServer({port:0,provider:{apiKey:'fake-only',model:'fake-only',endpoint:`http://127.0.0.1:${model.address().port}/v1/chat/completions`}});
 const go=name=>page.locator(`[data-go=${name}]`);
 const text=page.locator('[name=utterance]');
 const end=async()=>{await go('request-end').click();await go('finish-session').click();await expect(page.getByRole('heading',{name:'本场复盘',exact:true})).toBeVisible();};
 const original='谢谢你，我今天想自己坐地铁回家。';
 const branch='我想一个人走到地铁站，谢谢！';
 try {await page.goto(app.url);await go('new-practice').click();await page.locator('[data-task-goal="不知道怎么结束"]').click();await page.locator('[name=task-context]').fill('这个私密背景不该进报告');await page.locator('[name=adult]').check();await go('task-start').click();
 await expect(page.locator('.messages')).toContainText('要不要我送你？');await expect(text).toHaveValue('');
 await go('hint').click();await page.locator('[data-draft-index]').click();await expect(page.locator('.messages .is-user')).toHaveCount(0);
 await text.fill(original);await go('send').click();await expect(page.locator('.live-feedback')).toContainText('请求受限');await expect(text).toHaveValue(original);await expect(page.locator('.messages')).not.toContainText('private provider response');
 await go('send').click();await expect(page.locator('.messages .is-user')).toHaveCount(1);await expect(text).toHaveValue('');
 await end();await expect(page.locator('.evidence-summary').first()).toContainText(original);
 await page.locator('[data-evidence-replay]').first().click();await go('confirm-replay').click();await expect(page.locator('.messages')).toContainText('要不要我送你？');await expect(text).toHaveValue('');
 let responseReady, releaseResponse;
 const committed=new Promise(resolve=>responseReady=resolve), release=new Promise(resolve=>releaseResponse=resolve);
 await page.route('**/api/turn',async route=>{const response=await route.fetch();responseReady(response.ok());await release;await route.fulfill({response});},{times:1});
 await text.fill(branch);await text.press('Control+Enter');
 try {expect(await committed).toBe(true);await go('cancel').click();await expect(text).toHaveValue('');await expect(page.locator('.messages .is-user')).toHaveCount(1);}
 finally{releaseResponse();}
 await end();
 await expect(page.locator('.evidence-summary').first()).toContainText(original);await expect(page.locator('.evidence-summary').first()).toContainText(branch);
 await go('save-evidence').click();await expect(page.locator('#status')).toContainText('已保存');
 await go('open-share-card').click();await page.locator('[name=accepted]').fill('我可以温和地说出自己的安排');
 await expect(page.locator('#card-art')).toBeVisible();await page.locator('[name=confirmed]').check();const card=page.waitForEvent('download');await go('download-card').click();expect((await card).suggestedFilename()).toContain('.svg');await page.keyboard.press('Escape');
 await go('open-export').click();await expect(page.locator('[name=includeFull]')).not.toBeChecked();await page.locator('[name=note]').fill('只给自己看的便笺');await page.locator('#export-options summary').click();
 await expect(page.locator('#export-preview')).not.toContainText(original);await expect(page.locator('#export-preview')).not.toContainText(branch);
 const downloaded=page.waitForEvent('download');await go('download-evidence').click();const file=await downloaded;
 expect(file.suggestedFilename()).toBe('本场复盘.html');const html=fs.readFileSync(await file.path(),'utf8');
 for(const sensitive of [original,branch,'只给自己看的便笺','这个私密背景不该进报告'])expect(html).not.toContain(sensitive);
 await page.locator('[name=includeFull]').check();await expect(page.locator('#export-preview')).toContainText(original);await expect(page.locator('#export-preview')).toContainText(branch);
 }finally{await app.close();model.closeAllConnections();await new Promise(resolve=>model.close(resolve));}
});
