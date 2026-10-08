const puppeteer=require('puppeteer'), fs=require('fs');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage','--window-size=1200,1100']});
  const p=await b.newPage(); await p.setViewport({width:1200,height:1100});
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  await p.waitForFunction("!!document.querySelector('#overlay.open')",{timeout:20000});
  await sleep(250);
  const bb=await p.evaluate(()=>{const o=document.querySelector('#overlay.open');const t=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent));const r=t.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};});
  await p.mouse.click(bb.x,bb.y);
  await p.waitForFunction("!document.querySelector('#overlay.open')",{timeout:10000});
  await sleep(600);
  // temiz bir görünüm için örnek veri
  await p.evaluate(()=>{ S.user.name='Ali'; S.points=3280; save(true); App.go('ayarlar'); });
  await sleep(900);
  // 1) Verilerim + hesap satırları
  const e1=await p.$('#main .card');
  const c1=await p.evaluateHandle(()=>[...document.querySelectorAll('#main .card')].find(c=>/Verilerim/.test(c.textContent)));
  await c1.asElement().screenshot({path:'/home/user/ekran/19-hesap-bilgisi.png'});
  console.log('19-hesap-bilgisi.png ✓');
  // 2) Tehlikeli Ayarlar kartı
  const c2=await p.$('#main .p21-tehlike');
  await c2.screenshot({path:'/home/user/ekran/20-tehlikeli-ayarlar.png'});
  console.log('20-tehlikeli-ayarlar.png ✓');
  // 3) hesap silme onay ekranı
  await p.evaluate(()=>Hsp.silOnay()); await sleep(700);
  const c3=await p.$('#modal');
  await c3.screenshot({path:'/home/user/ekran/21-hesap-silme-onay.png'});
  console.log('21-hesap-silme-onay.png ✓');
  await b.close();
})();
