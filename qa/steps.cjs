const {Given,When,Then,Before,After}=require('@cucumber/cucumber');
const {chromium}=require('@playwright/test');const assert=require('node:assert/strict');const {startServer}=require('../dating-god/scripts/live-server.cjs');
Before(async function(){this.server=await startServer({port:0,provider:{apiKey:'',model:''}});this.browser=await chromium.launch();this.page=await this.browser.newPage();});
After(async function(){await this.browser?.close();await this.server?.close();});
Given('a fresh practice page',async function(){await this.page.goto(this.server.url);});
When('I request a practice without confirming adulthood',async function(){await this.page.locator('[data-go=new-practice]').click();await this.page.locator('[data-task-goal]').first().click();await this.page.locator('[data-go=task-start]').click();});
Then('no conversation is started',async function(){assert.match(await this.page.locator('#task-error').innerText(),/18/);assert.equal(await this.page.locator('.composer').count(),0);});
When('I prepare a custom partner offline',async function(){await this.page.locator('[data-go=new-rehearsal]').click();await this.page.locator('[name=adult]').check();await this.page.locator('[data-go=task-custom]').click();});
Then('the partner editor is visible',async function(){assert.equal(await this.page.locator('[name="prep.name"]').isVisible(),true);});
When('I choose the park and select a character hidden by a filter',async function(){
  const click=selector=>this.page.locator(selector).click();
  await click('.page-nav [data-go=all-scenes]');await click('[data-scene-choice=A08]');await click('[data-go=use-scene]');
  await click('[data-go=edit-role]');await click('[data-role=R01]');await this.page.locator('[name=role-search]').fill('当前没有这样的人');
  assert.equal(await this.page.getByText('当前筛选未显示',{exact:false}).isVisible(),true);
  await click('[data-go=choose-role]');
});
Then('both choices are shown in the same preparation',async function(){
  assert.match(await this.page.locator('#task-role-note').innerText(),/林澈/);
  assert.match(await this.page.locator('#task-scene-note').innerText(),/公园散步/);
});
When('I open the closing example and return to my draft',async function(){
  await this.page.locator('[data-go=new-practice]').click();await this.page.locator('[name=task-context]').fill('结束时我想自己回家');
  await this.page.locator('[name=adult]').check();await this.page.locator('[data-go=offline-practice]').click();
  await this.page.locator('[data-offline-choice]').first().click();await this.page.locator('[data-go=offline-confirm]').click();
  await this.page.locator('[data-go=offline-return]').first().click();
});
Then('my original draft and connection help are still shown',async function(){
  assert.equal(await this.page.locator('[name=task-context]').inputValue(),'结束时我想自己回家');
  assert.equal(await this.page.locator('[data-go=connection-help]').isVisible(),true);
});
