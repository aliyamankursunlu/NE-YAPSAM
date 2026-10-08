const puppeteer=require('puppeteer');
const REP=[], FAIL=[];
const ok=(c,l,x='')=>{ REP.push((c?'✅':'❌')+' '+l+(x?' — '+x:'')); if(!c) FAIL.push(l); };
(async()=>{
  const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage','--window-size=1440,1000']});
  const page=await browser.newPage();
  await page.setViewport({width:1440,height:1000});
  const ERR=[];
  page.on('pageerror',e=>ERR.push('pageerror: '+e.message));
  page.on('console',m=>{ const t=m.text(); if(m.type()==='error'&&!/net::ERR_|Failed to load resource|Not implemented/.test(t)) ERR.push('console: '+t); });
  await page.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await page.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  await page.waitForFunction("!!document.querySelector('#overlay.open')",{timeout:20000});
  await page.evaluate(()=>{ const o=document.querySelector('#overlay.open'); const b=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent)); if(b) b.click(); });
  await page.waitForFunction("!document.querySelector('#overlay.open')",{timeout:10000});
  await sleep(600);

  /* ---- KUR (TL) ---- */
  const fx=await page.evaluate(async()=>{ await p19c_loadFx(true); return {rate:P19C_FX.rate, src:P19C_FX.src, ornek:p19c_tl(41.99)}; });
  ok(fx.rate>1,'USD→TL kuru çekildi','1 USD = '+fx.rate.toFixed(2)+' ₺ · örnek $41.99 ≈ '+fx.ornek);

  /* ---- AVATAR: poz, animasyon, kombin ---- */
  const av=await page.evaluate(()=>{
    S.points=2000; save(); App.go('avatar');
    const svg=()=>document.querySelector('#avatarSvg svg');
    const out={};
    out.chips=[...document.querySelectorAll('.chip')].filter(c=>/Ayakta|El sallama|Zafer|Rahat/.test(c.textContent)).length;
    out.kombin=[...document.querySelectorAll('.chip')].filter(c=>/Büyücü|Kraliyet|Oyuncu|Öğrenci|Kış|Yaz|Uzay|Parti/.test(c.textContent)).length;
    out.lid=svg().outerHTML.indexOf('av-lid')>=0;
    out.breathe=svg().outerHTML.indexOf('av-breathe')>=0;
    return out;
  });
  ok(av.chips===4,'4 poz seçeneği var', av.chips+' çip');
  ok(av.kombin===8,'8 hazır kombin var', av.kombin+' kombin');
  ok(av.lid && av.breathe,'Animasyon katmanları avatarda (göz kırpma + nefes)');

  const pose=await page.evaluate(()=>{ Shop.setPose('sallama'); return document.querySelector('#avatarSvg svg').outerHTML.indexOf('av-wave')>=0; });
  ok(pose,'"El sallama" pozu uygulandı (av-wave)');

  const look=await page.evaluate(()=>{
    const p0=S.points; Shop.applyLook('buyucu'); App.repaintCurrent();
    return {hat:S.equipped.hat, glass:S.equipped.glass, outfit:S.equipped.outfit, bg:S.equipped.bg, pet:S.equipped.pet, harcanan:p0-S.points, owned:S.owned.length};
  });
  ok(look.hat==='hat_buyucu' && look.outfit==='out_uzay' && look.bg==='bg_uzay' && look.pet==='pet_dino','Büyücü kombini giydirildi','hat='+look.hat+' · bg='+look.bg+' · pet='+look.pet);
  await sleep(300);
  const drawn=await page.evaluate(()=>{ const h=document.querySelector('#avatarSvg svg').outerHTML;
    return {buyucu:/6d28d9/.test(h), dino:/34d399/.test(h), uzay:/07071c|1d1040|3b1a6b|120b2e/.test(h)}; });
  ok(drawn.buyucu && drawn.dino,'Kombin parçaları avatarda çizildi');
  const anim=await page.evaluate(async()=>{ Shop.toggleAnim(); await new Promise(r=>setTimeout(r,120));
    const off=document.querySelector('#avatarSvg svg').outerHTML.indexOf('av-lid')<0;
    Shop.toggleAnim(); await new Promise(r=>setTimeout(r,120));
    const on=document.querySelector('#avatarSvg svg').outerHTML.indexOf('av-lid')>=0; return {off:off,on:on}; });
  ok(anim.off && anim.on,'Animasyon aç/kapa çalışıyor');

  /* ---- FİYAT: Steam ürün sayfası + TL satırı + TR mağazaları ---- */
  await page.evaluate(()=>{
    try{ document.querySelector('#overlay').classList.remove('open'); document.querySelector('#modal').innerHTML=''; }catch(e){}
    const g=GAMES.filter(x=>!x.gen && x.n==="Baldur's Gate 3")[0]; Media.filters.games.p='all'; Media.last.games=g; showModal(Media.modalHtml('games',g));
  });
  await sleep(8000);
  const price=await page.evaluate(()=>{
    const box=document.getElementById('price19');
    const tl=box.querySelector('.p19c-tl');
    const prim=document.getElementById('storeBtn19');
    Price19.toggle();
    const panel=document.getElementById('store19');
    const trRows=[...panel.querySelectorAll('.lr')].filter(r=>/🇹🇷/.test(r.textContent));
    return {tl: tl? tl.innerText.replace(/\s+/g,' ').slice(0,90):null,
            prim: prim? prim.href : null, primTxt: prim? prim.textContent:null,
            trSayi: trRows.length, appid: window.P19C_APPID[Price19.norm("Baldur's Gate 3")]||null,
            trIlk: trRows.length? trRows[0].innerText.replace(/\s+/g,' ').slice(0,60):null};
  });
  ok(!!price.appid,'Steam ürün kimliği bulundu','appid '+price.appid);
  ok(/store\.steampowered\.com\/app\/\d+/.test(price.prim||''),'Birincil düğme tam Steam ürün sayfasına gidiyor',price.primTxt||'');
  ok(!!price.tl && /₺/.test(price.tl),'Modalda yaklaşık TL karşılığı görünüyor', price.tl||'yok');
  ok(price.trSayi>=12,'TL mağaza bölümü panelde','🇹🇷 '+price.trSayi+' satır · ilk: '+(price.trIlk||''));
  await page.screenshot({path:'/home/user/ekran/13-tl-fiyat.png'});
  await page.evaluate(()=>{ document.querySelector('#overlay').classList.remove('open'); App.go('avatar'); });
  await sleep(600);
  await page.evaluate(()=>window.scrollTo(0,900)); await sleep(400);
  await page.screenshot({path:'/home/user/ekran/14-poz-kombin.png'});

  console.log(REP.join('\n'));
  console.log('\n=== JS HATALARI ===\n'+(ERR.length?ERR.join('\n'):'0 hata ✅'));
  console.log('\nSONUÇ: '+(FAIL.length?('❌ '+FAIL.length+' başarısız'):'HEPSİ GEÇTİ ✅'));
  await browser.close();
})();
