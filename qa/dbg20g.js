const puppeteer=require('puppeteer');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage(); await p.setViewport({width:1440,height:1000});
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  await new Promise(r=>setTimeout(r,1500));
  await p.evaluate(()=>{const o=document.querySelector('#overlay.open');if(o){const t=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent));if(t)t.click();}});
  await new Promise(r=>setTimeout(r,600));
  const r=await p.evaluate(async()=>{
    // eylem düğmeli bir bildirim: su içme hatırlatıcısı varsa ona bak, yoksa elle üret
    toast('🧪','Eylemli test',"yetersiz puan",'warn',9000,'<button class="btn sm" onclick="window.__actionTik=1">Tamam</button>');
    const t=document.querySelector('#toasts .toast');
    const out={sinif:t.className, pe:getComputedStyle(t).pointerEvents};
    const btn=t.querySelector('button'); const b2=getComputedStyle(btn).pointerEvents;
    out.dugmePE=b2;
    await new Promise(r=>setTimeout(r,120));
    btn.click();
    out.eylemCalisti=window.__actionTik===1;
    // düz bildirim: tıklama geçirmeli mi?
    toast('🧪','Sade bildirim','sadece yazı','',6000);
    const t2=[...document.querySelectorAll('#toasts .toast')].pop();
    out.sadePE=getComputedStyle(t2).pointerEvents;
    out.sadeSinif=t2.className;
    return out;
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})();
