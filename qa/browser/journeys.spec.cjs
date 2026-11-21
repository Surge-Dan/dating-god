const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
test.beforeEach(async({page})=>{await page.coverage.startJSCoverage({resetOnNavigation:false});});
test.afterEach(async({page},info)=>{fs.mkdirSync('.private/qa/browser-coverage',{recursive:true});const entries=await page.coverage.stopJSCoverage();fs.writeFileSync('.private/qa/browser-coverage/'+info.testId+'.json',JSON.stringify(entries));});
const {default:AxeBuilder}=require('@axe-core/playwright');
for(const width of [320,375,414,768,1024,1440])test(`practice controls remain readable at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/');await page.getByRole('button',{name:'挑一个想练的时刻'}).click();
 const radio=page.locator('input[type=radio]').first();await expect(radio).toBeVisible();
 const size=await radio.boundingBox();expect(size.width).toBeLessThanOrEqual(20);expect(size.height).toBeLessThanOrEqual(20);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await expect(page.getByText('完整练一场',{exact:false})).toBeVisible();
 if(width===768)await page.screenshot({path:'.private/qa/practice-768.png',fullPage:true});
 const scan=await new AxeBuilder({page}).analyze();expect(scan.violations.filter(v=>['critical','serious'].includes(v.impact))).toEqual([]);
});
test('offline fallback preserves draft and requires explicit confirmation',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'挑一个想练的时刻'}).click();await page.locator('[name=task-goal]').fill('我想自己回家');await page.locator('[name=adult]').check();await page.getByRole('button',{name:'开始练习',exact:true}).click();
 await page.getByRole('button',{name:'先练一段收尾',exact:true}).click();await expect(page.locator('.messages')).not.toContainText('TA · TA');await page.locator('[data-offline-choice]').first().click();await expect(page.locator('.messages .is-user')).toHaveCount(0);await page.getByRole('button',{name:'确认这句'}).click();await expect(page.locator('.messages')).not.toBeEmpty();await page.getByRole('button',{name:'回到原来的设置',exact:true}).first().click();await expect(page.locator('[name=task-goal]')).toHaveValue('我想自己回家');
});
const http=require('node:http');const {startServer}=require('../../dating-god/scripts/live-server.cjs');
test('model-backed rehearsal reaches review, save and private-by-default export',async({page})=>{
 const model=http.createServer(async(req,res)=>{let raw='';for await(const chunk of req)raw+=chunk;const p=JSON.parse(raw).response_format.json_schema.schema.properties;const result=p.findings?{findings:[]}:p.line?{line:'我想慢慢聊。'}:{reply:'我也喜欢散步，你想先聊哪一本书？',detail:'',actionId:null,suggestions:['我最近读了一本小说。']};res.setHeader('Content-Type','application/json');res.end(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify(result)}}],usage:{prompt_tokens:10,completion_tokens:5,total_tokens:15}}));});
 await new Promise(resolve=>model.listen(0,'127.0.0.1',resolve));const app=await startServer({port:0,provider:{apiKey:'fake-only',model:'fake-only',endpoint:`http://127.0.0.1:${model.address().port}/v1/chat/completions`}});
 try {await page.goto(app.url);await page.locator('[data-go=new-practice]').click();await page.locator('[name=task-goal]').fill('自然接话');await page.locator('[name=adult]').check();await page.locator('[data-go=task-start]').click();
 for(let i=0;i<3;i++){await page.locator('[name=utterance]').fill('我喜欢那本小说的细节'+i);await page.getByRole('button',{name:'发送',exact:true}).click();await expect(page.locator('[name=utterance]')).toBeEnabled();}
 await page.locator('[data-go=request-end]').click();await page.locator('[data-go=finish-session]').click();await expect(page.getByRole('heading',{name:'本场复盘',exact:true})).toBeVisible();await page.locator('[data-go=save-evidence]').click();await expect(page.locator('#status')).toContainText('已保存');await page.locator('[data-go=open-export]').click();await expect(page.locator('[name=includeFull]')).not.toBeChecked();const downloaded=page.waitForEvent('download');await page.locator('[data-go=download-evidence]').click();expect((await downloaded).suggestedFilename()).toBe('本场复盘.html');
 }finally{await app.close();model.closeAllConnections();await new Promise(resolve=>model.close(resolve));}
});
