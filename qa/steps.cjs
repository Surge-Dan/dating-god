const {Given,When,Then,Before,After}=require('@cucumber/cucumber');
const {chromium}=require('@playwright/test');const assert=require('node:assert/strict');const {startServer}=require('../dating-god/scripts/live-server.cjs');
Before(async function(){this.server=await startServer({port:0,provider:{apiKey:'',model:''}});this.browser=await chromium.launch();this.page=await this.browser.newPage();});
After(async function(){await this.browser?.close();await this.server?.close();});
Given('a fresh practice page',async function(){await this.page.goto(this.server.url);});
When('I request a practice without confirming adulthood',async function(){await this.page.locator('[data-go=new-practice]').click();await this.page.locator('[name=task-goal]').fill('开场');await this.page.locator('[data-go=task-start]').click();});
Then('no conversation is started',async function(){assert.match(await this.page.locator('#task-error').innerText(),/18/);assert.equal(await this.page.locator('.composer').count(),0);});
When('I prepare a custom partner offline',async function(){await this.page.locator('[data-go=new-rehearsal]').click();await this.page.locator('[name=adult]').check();await this.page.locator('[data-go=task-custom]').click();});
Then('the partner editor is visible',async function(){assert.equal(await this.page.locator('[name="prep.name"]').isVisible(),true);});
