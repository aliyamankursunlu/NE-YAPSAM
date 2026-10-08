const puppeteer=require('puppeteer');
const OUT='/home/user/ekran/';
(async()=>{
  const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage','--window-size=1440,1000']});
  const page=await browser.newPage();
  await page.setViewport({width:1440,height:1000});
  await page.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await page.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  await page.waitForFunction("!!document.querySelector('#overlay.open')",{timeout:20000});
  await page.evaluate(()=>{ const o=document.querySelector('#overlay.open'); const b=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent)); if(b) b.click(); });
  await page.waitForFunction("!document.querySelector('#overlay.open')",{timeout:10000});
  await sleep(500);
  // AVATAR: büyücü kombini + el sallama + animasyon
  await page.evaluate(()=>{
    S.points=3000; S.user.eye='#22c55e'; save();
    App.go('avatar');
  });
  await sleep(500);
  await page.evaluate(()=>{ Shop.applyLook('buyucu'); Shop.setPose('sallama'); });
  await sleep(900);
  await page.screenshot({path:OUT+'11-avatar-yeni.png'}); console.log('• 11-avatar-yeni.png');
  await page.evaluate(()=>window.scrollTo(0,980)); await sleep(500);
  await page.screenshot({path:OUT+'14-poz-kombin.png'}); console.log('• 14-poz-kombin.png');
  // FİYAT: canlı + TL + TR mağazaları
  await page.evaluate(()=>{
    try{ document.querySelector('#overlay').classList.remove('open'); document.querySelector('#modal').innerHTML=''; }catch(e){}
    const g=GAMES.filter(x=>!x.gen && x.n==="Baldur's Gate 3")[0];
    Media.filters.games.p='all'; Media.last.games=g; showModal(Media.modalHtml('games',g));
  });
  await sleep(8000);
  await page.evaluate(()=>{ Price19.toggle(); window.scrollTo(0,300); });
  await sleep(600);
  await page.screenshot({path:OUT+'13-tl-fiyat.png'}); console.log('• 13-tl-fiyat.png');
  const st=await page.evaluate(()=>{ const b=document.getElementById('price19'); const prim=document.getElementById('storeBtn19');
    return {tl:(b.querySelector('.p19c-tl')||{}).innerText, prim:prim?prim.href:null, tr:[...document.querySelectorAll('#store19 .lr')].filter(r=>/🇹🇷/.test(r.textContent)).length}; });
  console.log('  TL:', (st.tl||'').slice(0,60), '| düğme:', (st.prim||'').slice(0,60), '| TL mağaza:', st.tr);
  await browser.close(); console.log('bitti');
})();
