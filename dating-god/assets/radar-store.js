(function(root){
 'use strict';
 const initial=()=>({enabled:false,epoch:0,revision:0,tombstones:{},events:[]});
 class MemoryBackend { constructor(){this.data=initial();this.tail=Promise.resolve();} transaction(fn){const p=this.tail.then(()=>fn(this.data));this.tail=p.catch(()=>{});return p;} }
 class IndexedBackend {
  constructor(idb){this.db=new Promise((resolve,reject)=>{const r=idb.open('dating-radar-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
  async transaction(fn){const db=await this.db;return new Promise((resolve,reject)=>{const tx=db.transaction('state','readwrite'),s=tx.objectStore('state'),r=s.get('current');let result;r.onsuccess=()=>{try{const data=r.result||initial();result=fn(data);s.put(data,'current');}catch(e){reject(e);tx.abort();}};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('记录事务中止'));});}
 }
 function createStore({backend,now=Date.now}={}){
  backend=backend||(root.indexedDB?new IndexedBackend(root.indexedDB):new MemoryBackend());
  const prune=d=>{d.events=d.events.filter(e=>e.at>=now()-90*86400000).sort((a,b)=>a.at-b.at).slice(-200);};
  return {
   persistent:backend instanceof IndexedBackend,
   capture:()=>backend.transaction(d=>({enabled:d.enabled,epoch:d.epoch,revision:d.revision})),
   setEnabled:enabled=>backend.transaction(d=>{d.enabled=!!enabled;d.epoch++;return {enabled:d.enabled,epoch:d.epoch,revision:d.revision};}),
   put:(event,permit)=>backend.transaction(d=>{if(!permit?.enabled||!d.enabled||d.epoch!==permit.epoch||d.revision!==permit.revision||d.tombstones['event:'+event.id]||d.tombstones['family:'+event.familyId])return false;prune(d);const item=JSON.parse(JSON.stringify({...event,at:event.at||now(),schemaVersion:1}));d.events=d.events.filter(e=>e.id!==item.id);d.events.push(item);prune(d);return true;}),
   list:()=>backend.transaction(d=>{prune(d);return JSON.parse(JSON.stringify(d.events)).reverse();}),
   remove:(kind,id)=>backend.transaction(d=>{d.revision++;const deleted=new Set(d.events.filter(e=>kind==='all'||(kind==='event'?e.id===id:e.familyId===id)).map(e=>e.id));if(kind!=='all')d.tombstones[kind+':'+id]=d.revision;d.events=d.events.filter(e=>!deleted.has(e.id));for(const e of d.events)if(deleted.has(e.originEventId)){delete e.originEventId;delete e.originExcerpt;}return d.events.length;}),
   update:(id,patch)=>backend.transaction(d=>{const e=d.events.find(e=>e.id===id);if(e){for(const k of ['disputed','disputeReason','progress'])if(Object.hasOwn(patch,k))e[k]=patch[k];}return !!e;})
  };
 }
 const api={createStore,MemoryBackend,IndexedBackend};if(typeof module!=='undefined')module.exports=api;root.RadarStore=api;
})(typeof window!=='undefined'?window:globalThis);
