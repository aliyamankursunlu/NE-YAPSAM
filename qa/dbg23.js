const puppeteer=require('puppeteer');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage();
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  const r=await p.evaluate(async()=>{
    const out={};
    // cookie
    try{ document.cookie='testck=1; path=/; max-age=100'; out.cookie=document.cookie.includes('testck'); }catch(e){ out.cookie='hata:'+e.message; }
    // indexedDB
    try{
      out.idb= await new Promise(res=>{ const t=setTimeout(()=>res('zaman-aşımı'),2500);
        const rq=indexedDB.open('dbtest',1);
        rq.onupgradeneeded=()=>{ try{ rq.result.createObjectStore('s'); }catch(e){} };
        rq.onsuccess=()=>{ clearTimeout(t); res('açıldı'); };
        rq.onerror=()=>{ clearTimeout(t); res('hata:'+(rq.error&&rq.error.name)); };
        rq.onblocked=()=>{ clearTimeout(t); res('bloklu'); };
      });
    }catch(e){ out.idb='hata:'+e.message; }
    out.ls=!!localStorage.getItem('neyapsam_v1');
    out.origin=location.origin+' | proto:'+location.protocol;
    return out;
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})();
