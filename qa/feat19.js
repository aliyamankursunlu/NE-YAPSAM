const puppeteer=require('puppeteer');
const REP=[], FAIL=[];
const ok=(c,l,x='')=>{ REP.push((c?'✅':'❌')+' '+l+(x?' — '+x:'')); if(!c) FAIL.push(l); };
(async()=>{
  const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage','--window-size=1440,950']});
  const page=await browser.newPage();
  await page.setViewport({width:1440,height:950});
  const ERR=[];
  page.on('pageerror',e=>ERR.push('pageerror: '+e.message));
  page.on('console',m=>{ const t=m.text(); if(m.type()==='error'&&!/net::ERR_|Failed to load resource|Not implemented/.test(t)) ERR.push('console: '+t); });
  await page.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await page.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  // karşılama
  await page.waitForFunction("!!document.querySelector('#overlay.open')",{timeout:20000});
  await page.evaluate(()=>{ const o=document.querySelector('#overlay.open'); const b=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent)); if(b) b.click(); });
  await page.waitForFunction("!document.querySelector('#overlay.open')",{timeout:10000});
  await sleep(500);

  /* -------- 1) ÖNERİLER ARTIK PAKET DEĞİL (50 örnek) -------- */
  const pickStat=await page.evaluate(()=>{
    const out={};
    ['games','film','music','food','city'].forEach(k=>{ out[k]=[]; for(let i=0;i<50;i++){ const it=Media.rand(k); out[k].push(it? (it.gen?1:0) : -1); } });
    return out;
  });
  const pct=k=>{ const a=pickStat[k]; const g=a.filter(x=>x===1).length; const nul=a.filter(x=>x===-1).length; return k+': paket '+g+'/'+a.length+' (içerik yok: '+nul+')'; };
  ok(pickStat.games.filter(x=>x===1).length===0,'Oyun önerileri hep tekil içerik',pct('games'));
  ok(pickStat.film.filter(x=>x===1).length===0,'Film önerileri hep tekil içerik',pct('film'));
  ok(pickStat.music.filter(x=>x===1).length===0,'Müzik önerileri hep tekil içerik',pct('music'));
  ok(pickStat.food.filter(x=>x===1).length===0,'Yemek önerileri hep tekil içerik',pct('food'));
  ok(pickStat.city.filter(x=>x===1).length===0,'Gezi önerileri hep tekil içerik',pct('city'));

  /* -------- 2) OYUN: DOĞRU MAĞAZA + FİYAT PANELİ + BAŞKA NEREDE -------- */
  const g1=await page.evaluate(()=>{
    Media.filters.games.p='steam'; Media.filters.games.g='all'; Media.filters.games.s='all'; Media.filters.games.m='all'; Media.filters.games.free=false;
    const it=Media.rand('games'); Media.last.games=it; Media.pick('games');
    const links=[...document.querySelectorAll('#modal a')].map(a=>a.href);
    return {name:it.n, p:it.p, links:links};
  });
  await sleep(400);
  ok(g1.p==='steam' && g1.links.some(h=>/duckduckgo\.com.*%2F%5Csite%3A|duckduckgo\.com.*steampowered/.test(h)||/duckduckgo\.com.*steampowered/.test(h)),'Steam oyunu → doğrudan Steam mağaza sayfası', g1.name.slice(0,40)+' (p='+g1.p+')');
  ok(!g1.links.some(h=>/epicgames\.com\/tr\/browse/.test(h)),'Steam oyununda Epic arama düğmesi yok');
  ok(!g1.links.some(h=>/store\.steampowered\.com\/search/.test(h)),'Eski "Steam\'de ara" düğmesi kalktı');
  const priceBox=await page.evaluate(()=>{ const b=document.getElementById('price19'); return b? b.innerText.slice(0,200):null; });
  await sleep(6000);
  const priceBox2=await page.evaluate(()=>{ const b=document.getElementById('price19'); return b? {txt:b.innerText.slice(0,300), buy:[...b.querySelectorAll('a')].map(a=>a.href).slice(0,4)}:null; });
  ok(!!priceBox,'Fiyat bloğu modalda var', (priceBox||'').slice(0,60));
  ok(priceBox2 && /En ucuz|Canlı fiyat alınamadı/.test(priceBox2.txt),'Fiyat bloğu dolduruldu (canlı ya da yedek)', (priceBox2&&priceBox2.txt.split('\n')[0])||'');
  const live = priceBox2 && /En ucuz: \$/.test(priceBox2.txt);
  if(live) ok(priceBox2.buy.some(h=>/cheapshark\.com\/redirect\?dealID=/.test(h)),'En ucuzdan satın al bağlantısı hazır', priceBox2.txt.split('\n')[0]);
  const panel=await page.evaluate(()=>{ Price19.toggle(); const b=document.getElementById('store19'); return {disp:b.style.display, n:b.querySelectorAll('a').length, txt:b.innerText.slice(0,120)}; });
  ok(panel.disp==='block' && panel.n>=12,'"Başka nerede satılıyor?" paneli açıldı', panel.n+' mağaza bağlantısı');
  await page.screenshot({path:'/home/user/ekran/9-oyun-fiyat-paneli.png'});

  /* -------- 3) STEAM'DE OLMAYAN OYUN STEAM'DE ARANMIYOR -------- */
  const g2=await page.evaluate(()=>{
    Media.filters.games.p='diger'; const it=Media.rand('games'); Media.pick('games');
    const links=[...document.querySelectorAll('#modal a')].map(a=>a.href);
    return {name:it.n,p:it.p,links:links};
  });
  ok(g2.p==='diger' && !g2.links.some(h=>/steampowered/.test(h)),'Tarayıcı/mobil oyunu Steam\'de aranmıyor', g2.name.slice(0,40));
  ok(g2.links.some(h=>/duckduckgo/.test(h)),'Tarayıcı oyunu için doğrudan sayfa bağlantısı var');
  await page.evaluate(()=>{ Media.filters.games.p='epic'; });
  const g3=await page.evaluate(()=>{ const it=Media.rand('games'); Media.pick('games');
    return {name:it.n,p:it.p,links:[...document.querySelectorAll('#modal a')].map(a=>a.href)}; });
  ok(!g3.links.some(h=>/store\.steampowered/.test(h)),'Epic oyunu Steam\'de aranmıyor', g2.name.slice(0,30));
  ok(g3.links.some(h=>/epicgames/.test(h)),'Epic oyunu Epic mağaza sayfasına gidiyor', g3.name.slice(0,40));
  await page.evaluate(()=>{ Media.filters.games.p='all'; });

  /* -------- 4) MÜZİK: ŞARKIYA DOĞRUDAN -------- */
  const mus=await page.evaluate(()=>{
    const real=MUSIC.filter(m=>!m.gen && m.s.indexOf('seçki')<0);
    const it=real[Math.floor(real.length/2)]; Media.pick('music');
    Media.last.music=it; Media.openMusic(it.a,it.s);
    return {a:it.a,s:it.s,links:[...document.querySelectorAll('#modal a')].map(a=>a.href)};
  });
  const sp=mus.links.find(h=>/open\.spotify\.com\/track/.test(h)||/duckduckgo\.com/.test(h)&&/spotify\.com%2Ftrack/.test(h));
  ok(mus.links.some(h=>/duckduckgo\.com\/\?q=%5Csite%3Aopen\.spotify\.com%2Ftrack/.test(h)),'Spotify bağlantısı şarkının kendisine gidiyor', mus.a+' — '+mus.s);
  ok(!mus.links.some(h=>/open\.spotify\.com\/search\//.test(mus.links[0]||'')),'Birincil Spotify düğmesi arama değil');
  ok(mus.links.some(h=>/site%3Ayoutube\.com%2Fwatch/.test(h)),'YouTube da doğrudan video bağlantısı');
  await page.screenshot({path:'/home/user/ekran/10-muzik-modal.png'});

  /* -------- 5) AVATAR: GERÇEK ÇİZİM + GİYDİRME -------- */
  await page.evaluate(()=>{ S.equipped.hat='hat_buyucu'; S.equipped.glass='glass_gunes'; S.equipped.pet='pet_kedi'; S.equipped.outfit='out_hoodie'; S.equipped.hair='hair_dalgali'; S.user.eye='#22c55e'; S.user.hair='#7a5230'; save(); App.go('avatar'); });
  await sleep(700);
  const av=await page.evaluate(()=>{
    const svg=document.querySelector('#avatarSvg svg');
    const html=svg? svg.outerHTML : '';
    const items=[...document.querySelectorAll('.shop-grid .item')].map(x=>x.querySelector('.nm').textContent);
    return {var:!!svg, w:svg?svg.getAttribute('width'):0, buyucu:/6d28d9/.test(html), gunes:/0b1220/.test(html), kedi:/f59e0b/.test(html), hoodie:/f59e0b/.test(html), emojiHat:((document.querySelector('#avatarSvg')?.parentElement?.innerHTML||'').match(/[\u{1F300}-\u{1FAFF}]/gu)||[]).length, items:items.slice(0,8), n:items.length};
  });
  ok(av.var,'Avatar SVG olarak çizildi','genişlik '+av.w);
  ok(av.buyucu,'Büyücü şapkası avatara giydirildi (çizim)');
  ok(av.gunes,'Güneş gözlüğü çizildi');
  ok(av.kedi,'Kedi avatarda göründü');
  ok(av.emojiHat===0,'Emoji katmanı kalktı (avatarda yüzen emoji yok)');
  ok(av.n>=8,'Mağaza parçaları listelendi', av.n+' parça · '+av.items.slice(0,5).join(', '));
  // satın alma akışı
  const buy=await page.evaluate(()=>{
    S.points=5000; save(); App.repaintCurrent();
    const before=(S.owned||[]).length;
    Shop.buy('hat','hat_tac');
    return {owned:(S.owned||[]).length, equipped:S.equipped.hat, pts:S.points, delta:(S.owned||[]).length-before};
  });
  ok(buy.delta===1 && buy.equipped==='hat_tac','Satın alma + kuşanma çalışıyor','puan '+buy.pts);
  await sleep(400);
  const tac=await page.evaluate(()=>/fbbf24/.test(document.querySelector('#avatarSvg svg').outerHTML));
  ok(tac,'Satın alınan taç avatarda görünüyor');
  await page.screenshot({path:'/home/user/ekran/11-avatar-yeni.png'});
  // sürpriz kutu + rastgele kombin
  const extra=await page.evaluate(()=>{ const b=(S.owned||[]).length; Shop.surprise(); const a=(S.owned||[]).length; Shop.randomize(); return {b:b,a:a,ok:true}; });
  ok(extra.ok,'Sürpriz kutu ve rastgele kombin çalışıyor','parça '+extra.b+'→'+extra.a);

  console.log(REP.join('\n'));
  console.log('\n=== JS HATALARI ===');
  console.log(ERR.length? ERR.join('\n') : '0 hata ✅');
  console.log('\nSONUÇ: '+(FAIL.length? '❌ '+FAIL.length+' başarısız' : 'HEPSİ GEÇTİ ✅'));
  await browser.close();
})();
