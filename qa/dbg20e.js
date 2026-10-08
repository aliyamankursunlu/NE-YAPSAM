const puppeteer=require('puppeteer');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage(); await p.setViewport({width:1440,height:1000});
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  await new Promise(r=>setTimeout(r,1200));
  await p.evaluate(()=>{const o=document.querySelector('#overlay.open');if(o){const t=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent));if(t)t.click();}});
  await new Promise(r=>setTimeout(r,700));
  const r=await p.evaluate(()=>{
    S.points=5000; App.go('test');
    return new Promise(res=>setTimeout(()=>{
      const items=[...document.querySelectorAll('#main [onclick]')].map((el,i)=>({
        i, txt:(el.textContent||'').trim().slice(0,30), oc:(el.getAttribute('onclick')||'').slice(0,50),
        cls:(el.className||'').toString().slice(0,26), tag:el.tagName,
        pe:getComputedStyle(el).pointerEvents, dis:el.disabled===true, box:[Math.round(el.getBoundingClientRect().width),Math.round(el.getBoundingClientRect().height)]
      }));
      // B78 içeren öğe?
      const b78=items.filter(x=>/B78/.test(x.txt));
      // aynı soru kartındaki cevap şıkları
      const kart=document.querySelector('#main .qcard, #main .card');
      res({toplam:items.length, b78:b78, ornek:items.slice(0,14), kartVar:!!kart});
    },600));
  });
  console.log('toplam:',r.toplam,'| B78 bulundu:',r.b78.length);
  r.b78.forEach(x=>console.log('  B78:',JSON.stringify(x)));
  console.log('ilk 6 öğe:'); r.ornek.slice(0,6).forEach(x=>console.log('   ',x.i,x.txt,'|',x.oc,'|',x.cls,'| pe:',x.pe));
  const cevap=r.ornek.filter(x=>/Quiz\.answer/.test(x.oc));
  console.log('cevap şıkkı sayısı (ilk 14 içinde):',cevap.length); cevap.forEach(x=>console.log('    şık:',x.txt,'|',x.oc,'| dis:',x.dis,'| pe:',x.pe));
  await b.close();
})();
