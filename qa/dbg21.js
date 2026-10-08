const puppeteer=require('puppeteer');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage','--window-size=1200,1000']});
  const p=await b.newPage(); await p.setViewport({width:1200,height:1000});
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  await new Promise(r=>setTimeout(r,1300));
  await p.evaluate(()=>{const o=document.querySelector('#overlay.open');if(o){const t=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent));if(t)t.click();}});
  await new Promise(r=>setTimeout(r,800));
  const r=await p.evaluate(()=>{
    const el=document.getElementById('bilMarka');
    const cikti={};
    cikti.varMi=!!el; cikti.sonMu=document.querySelector('#main').lastElementChild===el;
    cikti.ekranYuksek=innerHeight; cikti.sayfaYuksek=document.documentElement.scrollHeight;
    el.scrollIntoView({block:'center'});
    const rc=el.getBoundingClientRect();
    cikti.scrollY1=Math.round(scrollY); cikti.rect1=[Math.round(rc.top),Math.round(rc.height)];
    cikti.gorunurMu = rc.top>=0 && rc.bottom<=innerHeight;
    // 500 ms sonra tekrar (yeniden çizim var mı?)
    return new Promise(res=>setTimeout(()=>{
      const rc2=el.getBoundingClientRect();
      cikti.scrollY2=Math.round(scrollY); cikti.rect2=[Math.round(rc2.top),Math.round(rc2.height)];
      cikti.halaGorunur= rc2.top>=0 && rc2.bottom<=innerHeight;
      cikti.mainUzunluk=document.querySelector('#main').innerHTML.length;
      res(cikti);
    },500));
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})();
