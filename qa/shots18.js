const puppeteer=require('puppeteer');
const OUT='/home/user/ekran/';
(async()=>{
  const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage','--window-size=1440,950']});
  const page=await browser.newPage();
  await page.setViewport({width:1440,height:950,deviceScaleFactor:1});
  await page.setRequestInterception(true);
  page.on('request',r=>{ if(r.url().startsWith('file://')||r.url().startsWith('data:')) r.continue(); else r.abort(); });
  await page.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await page.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const diag=()=>page.evaluate(()=>{
    const out=[];
    document.querySelectorAll('*').forEach(e=>{
      const cs=getComputedStyle(e);
      if((cs.backdropFilter&&cs.backdropFilter!=='none')&&cs.display!=='none'&&cs.position==='fixed'){
        const b=e.getBoundingClientRect();
        if(b.width>500&&b.height>400) out.push({sel:e.id||e.className,display:cs.display,z:cs.zIndex,open:e.classList.contains('open')});
      }
    });
    out.push({overlayOpen:!!document.querySelector('#overlay.open'), modalHTML:(document.querySelector('#modal')||{}).innerHTML?.length||0});
    return out;
  });
  console.log('teşhis (başlangıç):',JSON.stringify(await diag()));
  // karşılama ekranı: önce görünmesini bekle, sonra gerçek fareyle kapat
  await page.waitForFunction("!!document.querySelector('#overlay.open')",{timeout:20000});
  await page.evaluate(()=>{ const o=document.querySelector('#overlay.open'); const b=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent)); if(b) b.setAttribute('data-qa','ob'); });
  const click=async(sel)=>{ const r=await page.evaluate(s=>{ const e=document.querySelector(s); if(!e) return null; const b=e.getBoundingClientRect(); if(!b.width||!b.height) return null; return {x:b.left+b.width/2,y:b.top+b.height/2}; },sel); if(r){ await page.mouse.click(r.x,r.y); await sleep(350); return true;} return false; };
  await click('[data-qa="ob"]');
  await page.waitForFunction("!document.querySelector('#overlay.open')",{timeout:10000});
  await sleep(900);
  console.log('kapatma sonrası:',JSON.stringify(await diag()));
  const tab=async(n)=>{ await click('.tab[data-tab="'+n+'"]'); await sleep(400); };
  const shot=async(f)=>{ await page.screenshot({path:OUT+f}); console.log('•',f); const d=await diag(); if(d.some(x=>x.overlayOpen)) console.log('  UYARI: overlay açık!'); };
  await tab('home');
  await page.evaluate(()=>{ const h=[...document.querySelectorAll('h3')].find(x=>/Öneri havuzu/.test(x.textContent)); if(h) h.scrollIntoView({block:'center'}); });
  await sleep(500); await shot('1-ana-sayfa-havuz.png');
  await tab('oyun_yok'); await shot('5-oyun-ekrani.png');
  await tab('izle'); await shot('6-izle-ekrani.png');
  await tab('test'); await shot('4-test-ekrani.png');
  await tab('gezi');
  await page.evaluate(()=>{ const c=[...document.querySelectorAll('.chip,.btn,.seg,.segbtn,button')].find(x=>/Hazır rota/.test(x.textContent)); if(c) c.setAttribute('data-qa','rota'); });
  await click('[data-qa="rota"]');
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/Öneri ver|Öner|🎲/.test(x.textContent)); if(b) b.setAttribute('data-qa','oneri'); });
  await click('[data-qa="oneri"]'); await sleep(500);
  await shot('2-gezi-rota-modal.png');
  await browser.close(); console.log('bitti');
})();
