/* TUR 9 — Geliştirici ekranı, okul logosu, alt marka, sabit anahtar rozeti */
const puppeteer=require('puppeteer');
let hata=0; const ok=[],bad=[];
function k(ad,sonuc,ek){ (sonuc? ok.push(ad+(ek?' — '+ek:'')) : bad.push(ad+(ek?' — '+ek:''))); if(!sonuc) hata++; }
const normal=s=>String(s||'').replace(/\s+/g,' ').trim();
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage','--window-size=1440,1000']});
  const p=await b.newPage(); await p.setViewport({width:1440,height:1000});
  const ERR=[]; p.on('pageerror',e=>ERR.push(e.message.slice(0,120)));
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  await p.waitForFunction("!!document.querySelector('#overlay.open')",{timeout:20000});
  await sleep(250);
  const bb=await p.evaluate(()=>{const o=document.querySelector('#overlay.open');const t=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent));const r=t.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};});
  await p.mouse.click(bb.x,bb.y);
  await p.waitForFunction("!document.querySelector('#overlay.open')",{timeout:10000});
  await sleep(500);

  // 1) sekme çubuğunda geliştirici düğmesi
  const nav=await p.evaluate(()=>{ const el=document.querySelector('#navbar .p20-devtab'); if(!el) return null;
    el.scrollIntoView({block:'nearest'}); const r=el.getBoundingClientRect(); return {txt:el.textContent.trim(),x:r.left+r.width/2,y:r.top+r.height/2}; });
  k('sekmelerde "Geliştiriciler" düğmesi var', !!nav, nav&&nav.txt);
  if(nav) await p.mouse.click(nav.x,nav.y);
  await sleep(500);
  const modal=await p.evaluate(()=>{
    if(!document.querySelector('#overlay.open')) return null;
    const m=document.querySelector('#modal');
    const kart=[...m.querySelectorAll('.p20-dev .ad')].map(x=>x.textContent.trim());
    const img=m.querySelector('.p20-okul img');
    return {kart,yazi:m.textContent.replace(/\s+/g,' '),
      logo: img? {src:img.getAttribute('src').slice(0,30), nat:img.naturalWidth, boyut:img.getAttribute('src').length} : null,
      kapali:false};
  });
  k('tıklayınca pop-up açıldı', !!modal);
  if(modal){
    k('ALİ YAMAN KURŞUNLU - BAŞ GELİŞTİRİCİ', modal.kart.some(x=>normal(x)==='ALİ YAMAN KURŞUNLU - BAŞ GELİŞTİRİCİ'), modal.kart[0]);
    k('ONUR HARMAN - YARDIMCI GELİŞTİRİCİ', modal.kart.some(x=>normal(x)==='ONUR HARMAN - YARDIMCI GELİŞTİRİCİ'));
    k('EGE ÇAKAL - YARDIMCI GELİŞTİRİCİ', modal.kart.some(x=>normal(x)==='EGE ÇAKAL - YARDIMCI GELİŞTİRİCİ'));
    k('tam 4 geliştirici satırı', modal.kart.length===4, modal.kart.length+' satır');
    k('GÖRKEM CENGİZ - BAŞ GELİŞTİRİCİ', modal.kart.some(x=>normal(x)==='GÖRKEM CENGİZ - BAŞ GELİŞTİRİCİ'), modal.kart[1]);
    k('2 baş geliştirici var', modal.kart.filter(x=>/BAŞ GELİŞTİRİCİ$/.test(normal(x))).length===2);
    k('pop-up içinde BİL KOLEJİ® 2026', /BİL KOLEJİ ?® ?2026/.test(modal.yazi));
    k('logo pop-up içinde göründü', !!modal.logo && modal.logo.src.startsWith('data:image/png') && modal.logo.nat===256, modal.logo? (modal.logo.nat+'px · '+Math.round(modal.logo.boyut/1024)+' KB'):'yok');
    await p.evaluate(()=>closeModal()); await sleep(250);
    k('pop-up kapanıyor', await p.evaluate(()=>!document.querySelector('#overlay.open')));
  }

  // 2) alt marka bilgisi: her sekmenin en altında
  const sekmeler=['home','oyun_yok','dinle','test','bahce','notlar','avatar','ayarlar','ozet'];
  let markaOk=0, sonSiraOk=0, logoOk=0, ornek='';
  for(const t of sekmeler){
    await p.evaluate(x=>App.go(x),t); await sleep(320);
    const r=await p.evaluate(()=>{
      const main=document.querySelector('#main'); const el=document.getElementById('bilMarka');
      if(!el||!main.contains(el)) return null;
      const img=el.querySelector('img');
      const son=main.lastElementChild===el;
      return {yazi:el.textContent.replace(/\s+/g,' '), son, logo:!!(img&&img.naturalWidth>0), src:img?img.getAttribute('src').slice(0,22):''};
    });
    if(r&&/BİL KOLEJİ ?® ?2026/.test(r.yazi)) markaOk++;
    if(r&&r.son) sonSiraOk++;
    if(r&&r.logo) logoOk++;
    if(!ornek&&r) ornek=r.yazi;
  }
  k('marka bilgisi '+sekmeler.length+' sekmede var', markaOk===sekmeler.length, markaOk+'/'+sekmeler.length);
  k('marka bilgisi en altta (son öğe)', sonSiraOk===sekmeler.length, sonSiraOk+'/'+sekmeler.length);
  k('logo alt bilgide göründü', logoOk===sekmeler.length, logoOk+'/'+sekmeler.length);
  k('metin tam: BİL KOLEJİ® 2026', /BİL KOLEJİ ?® ?2026/.test(ornek), ornek);

  // 3) Ayarlar: düğme + sabit anahtar rozeti
  await p.evaluate(()=>App.go('ayarlar')); await sleep(400);
  const ayar=await p.evaluate(()=>{
    const main=document.querySelector('#main');
    const btn=[...main.querySelectorAll('button')].find(x=>/Geliştiriciler/.test(x.textContent));
    const kv=[...main.querySelectorAll('.kv')].map(x=>x.textContent.replace(/\s+/g,' ')).find(x=>/Kayıt anahtarı/.test(x));
    return {btn:!!btn, btnTxt:btn&&btn.textContent.trim(), kv};
  });
  k('Ayarlar → Geliştiriciler düğmesi', ayar.btn, ayar.btnTxt);
  k('sabit anahtar rozeti', /neyapsam_v1 · sabit/.test(ayar.kv||''), ayar.kv);

  // 4) görsel geri yükleme yolu (ImgBil)
  const g=await p.evaluate(async()=>{
    const red=ImgBil.canHandle('application/pdf',1000);
    const kabul=ImgBil.canHandle('image/png',1000);
    const buyuk=ImgBil.canHandle('image/png',9*1024*1024);
    // küçük bir SVG->PNG yerine doğrudan data uri ile uygula
    const d='data:image/png;base64,'+document.querySelector('#bilMarka img').getAttribute('src').split(',')[1].slice(0,200);
    const eski=S.brandLogo;
    ImgBil.uygula(d);
    const sonra=document.querySelector('#bilMarka img').getAttribute('src');
    ImgBil.sifirla();
    const dondu=document.querySelector('#bilMarka img').getAttribute('src');
    return {red,kabul,buyuk,degisti:sonra===d,geriDondu:dondu!==d, eski:eski||null};
  });
  k('PDF reddediliyor', g.red===false);
  k('PNG kabul ediliyor', g.kabul===true);
  k('3 MB üstü reddediliyor', g.buyuk===false);
  k('görsel logo olarak uygulanıyor', g.degisti===true);
  k('varsayılan logoya dönüş', g.geriDondu===true);

  console.log('=== TUR 9: GELİŞTİRİCİ EKRANI + MARKA ===');
  ok.forEach(x=>console.log('  ✅',x));
  bad.forEach(x=>console.log('  ❌',x));
  k('sayfa JS hatası yok', ERR.length===0, ERR.slice(0,3).join(' | '));
  console.log(hata? ('\nSONUÇ: '+hata+' SORUN ❌') : '\nSONUÇ: HEPSİ GEÇTİ ✅');
  await b.close();
  process.exit(hata?1:0);
})();
