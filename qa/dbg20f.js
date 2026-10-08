const puppeteer=require('puppeteer');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage(); await p.setViewport({width:1440,height:1000});
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  await new Promise(r=>setTimeout(r,1200));
  await p.evaluate(()=>{const o=document.querySelector('#overlay.open');if(o){const t=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent));if(t)t.click();}});
  await new Promise(r=>setTimeout(r,700));
  // yakalama kaydı
  await p.evaluate(()=>{ window.__clicks=[]; document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[onclick]'); window.__clicks.push(t?(t.getAttribute('onclick')||'').slice(0,40):'(yok)');},true); });
  await p.evaluate(()=>{ S.points=5000; App.go('test'); });
  await new Promise(r=>setTimeout(r,600));
  // testi başlat
  const bas=await p.evaluate(()=>{ const el=[...document.querySelectorAll('#main [onclick]')].find(e=>/Quiz\.(start|begin|newQ|pick)/.test(e.getAttribute('onclick')||'')); if(!el) return null; const r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,txt:(el.textContent||'').trim().slice(0,30),oc:el.getAttribute('onclick')}; });
  console.log('başlat tuşu:',bas? bas.txt+' ('+bas.oc+')' : 'BULUNAMADI');
  if(bas){ await p.mouse.click(bas.x,bas.y); await new Promise(r=>setTimeout(r,1200)); }
  const on=await p.evaluate(()=>{
    const opts=[...document.querySelectorAll('#main [onclick]')].filter(el=>/Quiz\.answer/.test(el.getAttribute('onclick')||''));
    return {sayi:opts.length, ilk:opts.slice(0,4).map(el=>({txt:(el.textContent||'').trim().slice(0,30), oc:el.getAttribute('onclick'), cls:(el.className||'').toString().slice(0,20)})),
            soru:(document.querySelector('#main h3, #main .q, #main b')||{}).textContent?.slice(0,70), htmlBas:document.querySelector('#main').innerHTML.length};
  });
  console.log('cevap şıkkı sayısı:',on.sayi);
  console.log('şıklar:',JSON.stringify(on.ilk,null,1));
  console.log('soru metni:',on.soru,'| #main uzunluk:',on.htmlBas);
  // ilk şıkkın gerçek kutusuna tam koordinatla tıkla
  const hedef=await p.evaluate(()=>{
    const el=[...document.querySelectorAll('#main [onclick]')].find(e=>/Quiz\.answer/.test(e.getAttribute('onclick')||''));
    el.scrollIntoView({block:'center'});
    const r=el.getBoundingClientRect();
    return {x:r.left+r.width/2,y:r.top+r.height/2,w:Math.round(r.width),h:Math.round(r.height),txt:(el.textContent||'').trim().slice(0,40)};
  });
  await p.mouse.click(hedef.x,hedef.y);
  await new Promise(r=>setTimeout(r,700));
  const son=await p.evaluate(()=>({clicks:window.__clicks.slice(-3), htmlSon:document.querySelector('#main').innerHTML.length,
     toast:(document.querySelector('#toasts .toast')||{}).textContent?.slice(0,60), puan:S.points, dogru:S.q&&S.q.dogru, yanlis:S.q&&S.q.yanlis, cevaplandi:S.q&&(S.q.answered||S.q.lock)}));
  console.log('hedef şık:',hedef.txt,'| kutu:',hedef.w+'x'+hedef.h);
  console.log('SONUÇ:',JSON.stringify(son,null,1));
  await b.close();
})();
