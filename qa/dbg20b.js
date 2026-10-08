const puppeteer=require('puppeteer');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage','--window-size=1440,1000']});
  const p=await b.newPage();
  await p.setViewport({width:1440,height:1000});
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  await p.evaluate(()=>{ const o=document.querySelector('#overlay.open'); if(o){ const btn=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent)); if(btn) btn.click(); } });
  await new Promise(r=>setTimeout(r,900));
  const r=await p.evaluate(()=>{
    S.points=5000; App.go('avatar');
    return new Promise(res=>setTimeout(()=>{
      const out=[];
      [...document.querySelectorAll('#main .chip')].forEach(el=>{
        const t=(el.textContent||'').trim();
        if(!/Evcil|Arka Plan|Kıyafet|Gözlük/.test(t)) return;
        el.scrollIntoView({block:'center'});
        const b=el.getBoundingClientRect();
        const cx=b.left+b.width/2, cy=b.top+b.height/2;
        const top=document.elementFromPoint(cx,cy);
        const par=el.parentElement;
        out.push({txt:t, rect:[Math.round(b.left),Math.round(b.top),Math.round(b.width),Math.round(b.height)],
          parentCls:(par.className||'').toString().slice(0,30), parentOv:getComputedStyle(par).overflowX+'/'+getComputedStyle(par).overflowY,
          parentW:Math.round(par.getBoundingClientRect().width), scrollW:par.scrollWidth,
          ustte: top? (top.tagName+'.'+(top.className||'').toString().slice(0,26)+' | '+(top.textContent||'').trim().slice(0,20)) : 'yok'});
      });
      res(out);
    },400));
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})();
