const puppeteer=require('puppeteer');
(async()=>{
  const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request',r=>{ if(r.url().startsWith('file://')||r.url().startsWith('data:')) r.continue(); else r.abort(); });
  await page.evaluateOnNewDocument(()=>{
    window.__log=[];
    document.addEventListener('DOMContentLoaded',()=>window.__log.push(['DOMContentLoaded',Math.round(performance.now())]));
    requestAnimationFrame(()=>window.__log.push(['ilkKare',Math.round(performance.now())]));
  });
  const t=Date.now();
  await page.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  const load=Date.now()-t;
  await page.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  const r=await page.evaluate(()=>({log:window.__log, poolMs:window.POOL_MS, tot:window.POOL_TOTAL()}));
  console.log('goto→load:',load,'ms | POOL_MS:',r.poolMs,'ms | toplam:',r.tot);
  console.log('iç ölçümler:',JSON.stringify(r.log));
  process.exit(0);
})();
