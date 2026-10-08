const puppeteer=require('puppeteer'),fs=require('fs');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage','--window-size=1200,1000']});
  const p=await b.newPage(); await p.setViewport({width:1200,height:1000});
  const SS=o=>p.screenshot(o);   // kırpma kutuları SAYFA koordinatında
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  await p.waitForFunction("!!document.querySelector('#overlay.open')",{timeout:20000});
  await sleep(250);
  const bb=await p.evaluate(()=>{const o=document.querySelector('#overlay.open');const t=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent));const r=t.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};});
  await p.mouse.click(bb.x,bb.y);
  await p.waitForFunction("!document.querySelector('#overlay.open')",{timeout:10000});
  await sleep(600);
  // 1) geliştirici ekranı
  await p.evaluate(()=>Dev.acikla());
  await sleep(700);
  const m=await p.evaluate(()=>{const el=document.querySelector('#modal'); const r=el.getBoundingClientRect();
    return {x:Math.max(0,Math.round(r.left-12)),y:Math.max(0,Math.round(r.top+scrollY-12)),width:Math.round(r.width+24),height:Math.round(r.height+24) };});
  const shot=await SS({clip:m});
  fs.writeFileSync('/home/user/ekran/16-gelistirici-ekrani.png',shot);
  console.log('16-gelistirici-ekrani.png', shot.length,'bayt | alan',JSON.stringify(m));
  // 2) alt marka bilgisi (ana sayfanın en altı)
  await p.evaluate(()=>{ closeModal(); App.go('home'); });
  await sleep(600);
  await p.evaluate(()=>{ document.getElementById('bilMarka').scrollIntoView({block:'center'}); });
  await sleep(400);
  const f=await p.evaluate(()=>{ const el=document.getElementById('bilMarka');
    const r=el.getBoundingClientRect(); const pad=60;
    return {x:Math.max(0,Math.round(r.left-pad)), y:Math.max(0,Math.round(r.top+scrollY-pad)),
            width:Math.round(r.width+pad*2), height:Math.round(r.height+pad*2), scrollY:Math.round(scrollY)}; });
  console.log('alt marka ölçümü:', JSON.stringify(f));
  const shot2=await SS({clip:f});
  fs.writeFileSync('/home/user/ekran/17-alt-marka.png',shot2);
  console.log('17-alt-marka.png', shot2.length,'bayt | alan',JSON.stringify(f));
  // 3) sekmeler + geliştirici çipi görünen üst bar
  await p.evaluate(()=>window.scrollTo(0,0)); await sleep(300);
  const hdr=await p.evaluate(()=>{ const el=document.querySelector('.app-header'); const r=el.getBoundingClientRect();
    return {x:0,y:0,width:1200,height:Math.round(r.height+6)}; });
  const shot3=await SS({clip:hdr});
  fs.writeFileSync('/home/user/ekran/18-sekmeler.png',shot3);
  console.log('18-sekmeler.png', shot3.length,'bayt');
  await b.close();
})();
