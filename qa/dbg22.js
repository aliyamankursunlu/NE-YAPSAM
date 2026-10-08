const puppeteer=require('puppeteer'),fs=require('fs');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage','--window-size=1200,1000']});
  const p=await b.newPage(); await p.setViewport({width:1200,height:1000});
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  await new Promise(r=>setTimeout(r,1300));
  await p.evaluate(()=>{const o=document.querySelector('#overlay.open');if(o){const t=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent));if(t)t.click();}});
  await new Promise(r=>setTimeout(r,800));
  await p.evaluate(()=>{ document.getElementById('bilMarka').scrollIntoView({block:'center'}); });
  await new Promise(r=>setTimeout(r,400));
  const denemeler=[
    ['viewport-kırpma (v) ', {captureBeyondViewport:false, clip:{x:0,y:694,width:1200,height:175}}],
    ['tam sayfa (v)      ', {captureBeyondViewport:false}],
    ['sayfa-kırpma       ', {clip:{x:0,y:2349,width:1200,height:175}}],
  ];
  for(const [ad,opt] of denemeler){
    try{ const s=await p.screenshot(opt); fs.writeFileSync('/tmp/t.png',s); console.log(ad,'OK →',s.length,'bayt'); }
    catch(e){ console.log(ad,'HATA →',e.message.slice(0,90)); }
  }
  await b.close();
})();
