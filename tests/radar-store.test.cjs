const test=require('node:test'); const assert=require('node:assert/strict');
const {createStore,MemoryBackend}=require('../dating-god/assets/radar-store.js');
test('saving requires matching consent epoch; deletion blocks late writes across tabs',async()=>{
 const backend=new MemoryBackend(); const a=createStore({backend}),b=createStore({backend});
 assert.equal((await a.capture()).enabled,false); await a.setEnabled(true); const permit=await a.capture();
 assert.equal(await a.put({id:'e',familyId:'f',at:Date.now()},permit),true);
 await b.setEnabled(false); await b.setEnabled(true); assert.equal(await a.put({id:'late',familyId:'f'},permit),false);
 const fresh=await a.capture(); await b.remove('family','f'); assert.equal(await a.put({id:'late2',familyId:'f'},fresh),false);
 assert.deepEqual(await a.list(),[]);
});
test('retention caps events and removes practice links when original is deleted',async()=>{
 let now=100000000000; const s=createStore({backend:new MemoryBackend(),now:()=>now}); await s.setEnabled(true); const p=await s.capture();
 for(let i=0;i<205;i++) await s.put({id:'e'+i,familyId:'f',at:now+i},p);
 assert.equal((await s.list()).length,200);
 await s.put({id:'practice',familyId:'p',source:'practice',originEventId:'e204',at:now+300},p);
 await s.remove('event','e204'); assert.equal((await s.list()).find(x=>x.id==='practice').originEventId,undefined);
 now+=91*86400000; assert.deepEqual(await s.list(),[]);
});
