const puppeteer=require('puppeteer');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage(); await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,1500));
  const r=await p.evaluate(async()=>{
    const o={secure:isSecureContext, proto:location.protocol};
    // IndexedDB
    o.idb=await new Promise(res=>{const t=setTimeout(()=>res('zaman-aşımı'),2500);
      try{const rq=indexedDB.open('dbtest2',1);
        rq.onupgradeneeded=()=>{try{rq.result.createObjectStore('s')}catch(e){}};
        rq.onsuccess=()=>{clearTimeout(t);res('çalışıyor')};rq.onerror=()=>{clearTimeout(t);res('hata:'+(rq.error&&rq.error.name))};
      }catch(e){clearTimeout(t);res('hata:'+e.message)}});
    // Cache API
    try{ const c=await caches.open('neyapsam-test'); await c.put('/t',new Response('x')); const m=await c.match('/t'); o.cache=m?'çalışıyor':'yazıldı ama okunamadı'; await caches.delete('neyapsam-test'); }
    catch(e){ o.cache='hata:'+e.message.slice(0,60); }
    // çerez
    try{ document.cookie='a=1;path=/;max-age=100'; o.cerez=document.cookie.includes('a=1')?'çalışıyor':'yazılamıyor'; }catch(e){ o.cerez='hata'; }
    // gerçek uygulama kasası
    o.kasaLS=!!localStorage.getItem('neyapsam_kasa');
    o.idbKasa=await new Promise(res=>{setTimeout(()=>res(null),100);
      try{const rq=indexedDB.open('neyapsam_kasa',1); rq.onsuccess=()=>{try{const tx=rq.result.transaction('kimlik','readonly');const g=tx.objectStore('kimlik').get('kimlik');g.onsuccess=()=>res(g.result?('kayıtlı: '+(g.result.uid||'?')):'boş');g.onerror=()=>res('hata')}catch(e){res('hata:'+e.message)}};rq.onerror=()=>res('açılamadı');}catch(e){res('hata')}});
    return o;
  });
  console.log(JSON.stringify(r,null,1)); await b.close();
})();
