const puppeteer=require('puppeteer');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage();
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  await p.evaluate(()=>{ const o=document.querySelector('#overlay.open'); if(o){ const btn=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent)); if(btn) btn.click(); } });
  await new Promise(r=>setTimeout(r,800));
  const r=await p.evaluate(async()=>{
    App.go('avatar'); await new Promise(r=>setTimeout(r,300));
    const out={};
    out.baslangic={anim:S.user.anim, lid:document.querySelector('#avatarSvg svg').outerHTML.indexOf('av-lid')>=0};
    Shop.toggleAnim(); await new Promise(r=>setTimeout(r,250));
    out.kapali={anim:S.user.anim, lid:document.querySelector('#avatarSvg svg').outerHTML.indexOf('av-lid')>=0, svgVar:!!document.querySelector('#avatarSvg svg')};
    Shop.toggleAnim(); await new Promise(r=>setTimeout(r,250));
    out.acik={anim:S.user.anim, lid:document.querySelector('#avatarSvg svg').outerHTML.indexOf('av-lid')>=0};
    out.extOrnek=(typeof ext==='function')? ext('https://a.b','deneme','primary') : 'ext yok';
    return out;
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})();
