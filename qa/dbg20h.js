const puppeteer=require('puppeteer');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage(); await p.setViewport({width:1440,height:1000});
  const E=[]; p.on('pageerror',e=>E.push(e.message.slice(0,120)));
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  await new Promise(r=>setTimeout(r,1500));
  const r=await p.evaluate(()=>{
    const out={};
    out.toastVar=typeof window.toast;
    out.kutu=!!document.querySelector('#toasts');
    try{ window.toast('🧪','Eylemli','yetersiz puan','warn',9000,'<button class="btn sm" onclick="window.__tik=1">Tamam</button>'); }catch(e){ out.hata1=e.message; }
    out.cocuk=document.querySelectorAll('#toasts .toast').length;
    const t=document.querySelector('#toasts .toast');
    if(t){ out.sinif=t.className; out.pe=getComputedStyle(t).pointerEvents;
      const btn=t.querySelector('button'); out.dugmeVar=!!btn;
      if(btn){ out.dugmePE=getComputedStyle(btn).pointerEvents; btn.click(); out.eylem=window.__tik===1; }
    } else out.toastYok=true;
    out.html=(document.querySelector('#toasts')&&document.querySelector('#toasts').innerHTML.slice(0,160))||'';
    return out;
  });
  console.log(JSON.stringify(r,null,1)); console.log('sayfa hatası:',E.slice(0,3).join(' | ')||'yok');
  await b.close();
})();
