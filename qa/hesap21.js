/* TUR 10 — Kalıcı hesap: 100 güncellemede de aynı hesap + tehlikeli ayarlar */
const puppeteer=require('puppeteer'), fs=require('fs'), path=require('path');
let hata=0; const ok=[],bad=[];
function k(ad,s,e){ (s? ok.push(ad+(e?' — '+e:'')) : bad.push(ad+(e?' — '+e:''))); if(!s) hata++; }
const URL='file:///home/user/ne-yapsam.html';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function yeniSayfa(b){
  const p=await b.newPage(); await p.setViewport({width:1400,height:1000});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message.slice(0,140)));
  await p.goto(URL,{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  await p.waitForFunction("typeof S!=='undefined' && S && S.user && !!S.user.uid",{timeout:20000});
  await sleep(500);
  return {p,errs};
}
async function hosgeldinGec(p){
  await p.waitForFunction("!!document.querySelector('#overlay.open')",{timeout:20000});
  await sleep(250);
  const b=await p.evaluate(()=>{const o=document.querySelector('#overlay.open');const t=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent));if(!t)return null;const r=t.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};});
  if(b) await p.mouse.click(b.x,b.y);
  await p.waitForFunction("!document.querySelector('#overlay.open')",{timeout:10000});
  await sleep(400);
}
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  let {p,errs}=await yeniSayfa(b);
  await hosgeldinGec(p);

  /* --- 1) hesap kimliği oluştu mu --- */
  const k0=await p.evaluate(()=>({uid:S.user.uid, no:S.user.hesapNo, giris:S.user.giris, olus:S.user.olusturma,
    kanca:String(window.load).includes('p21_uidGaranti'), kancaSave:String(window.save).includes('kasaTaze'),
    ls:!!localStorage.getItem('neyapsam_kasa'), ck:document.cookie.indexOf('neyapsam_kasa=')>=0,
    anahtar:window.NEYAPSAM_LS_KEY}));
  k('hesap kimliği (uid) üretildi', /^NY-[0-9A-Z]+-[0-9A-Z]{4}$/.test(k0.uid||''), k0.uid);
  k('4 haneli hesap numarası', k0.no>=1000 && k0.no<=9999, '#'+k0.no);
  k('giriş sayacı çalıştı', (k0.giris||0)>=1, k0.giris+'. giriş');
  k('load() kancası aktif', k0.kanca);
  k('save() kancası aktif', k0.kancaSave);
  k('kasa (localStorage) yazıldı', k0.ls);
  console.log('   · bilgi: çerez kasası', k0.ck?'yazıldı':'yazılamadı (file:// kısıtı, zararsız)');
  k('kayıt anahtarı hâlâ sabit', k0.anahtar==='neyapsam_v1', k0.anahtar);

  /* --- 2) 100 güncelleme simülasyonu: aynı dosya 6 kez yeniden açılsın --- */
  let ayni=true, nolar=new Set([k0.no]);
  for(let i=0;i<6;i++){
    await p.reload({waitUntil:'load'});
    await p.waitForFunction("typeof S!=='undefined' && S && S.user && !!S.user.uid",{timeout:20000});
    await sleep(250);
    const r=await p.evaluate(()=>({uid:S.user.uid,no:S.user.hesapNo,g:S.user.giris}));
    if(r.uid!==k0.uid) ayni=false;
    nolar.add(r.no);
  }
  k('6 yeniden açılışta AYNI hesap', ayni, Array.from(nolar).map(x=>'#'+x).join(','));

  /* --- 3) "yeni sürüm dosyası" simülasyonu: ayrı bir dosya aç, aynı hesap --- */
  const v2='/tmp/neyapsam-v2.html';
  fs.copyFileSync('/home/user/ne-yapsam.html', v2);
  const p2=await b.newPage(); await p2.setViewport({width:1200,height:900});
  await p2.goto('file://'+v2,{waitUntil:'load'});
  await p2.waitForFunction("typeof S!=='undefined' && S && S.user && !!S.user.uid",{timeout:30000});
  await sleep(400);
  const k2=await p2.evaluate(()=>({uid:S.user.uid,no:S.user.hesapNo,ad:S.user.name}));
  k('FARKLI dosya (yeni sürüm) açılınca aynı hesap', k2.uid===k0.uid, k0.uid+' → '+k2.uid);
  await p2.close();

  /* --- 4) ana kayıt silinse bile kasa hesabı geri getiriyor mu --- */
  await p.evaluate(()=>{ localStorage.removeItem('neyapsam_v1'); });
  await p.reload({waitUntil:'load'});
  await p.waitForFunction("typeof S!=='undefined' && S && S.user && !!S.user.uid",{timeout:20000});
  await sleep(600);
  const k3=await p.evaluate(()=>({uid:S.user.uid,no:S.user.hesapNo,kurt:S.user.kurtarildi||0}));
  k('ana kayıt silinince kasa hesabı geri yükledi', k3.uid===k0.uid, k3.uid+' · kurtarma #'+k3.kurt);

  /* --- 4b) localStorage TAMAMEN silinse bile IndexedDB kasası hesabı geri getirsin --- */
  const k4a=await p.evaluate(()=>S.user.uid);
  await p.evaluate(()=>{ localStorage.removeItem('neyapsam_v1'); localStorage.removeItem('neyapsam_kasa'); });
  await p.reload({waitUntil:'load'});
  await p.waitForFunction("typeof S!=='undefined' && S && S.user && !!S.user.uid",{timeout:20000});
  await sleep(1800);
  const k4=await p.evaluate(()=>({uid:S.user.uid,no:S.user.hesapNo,kurt:S.user.kurtarildi||0,
    idb:!!localStorage.getItem('neyapsam_kasa')}));
  k('localStorage tamamen silinince IndexedDB kasası hesabı kurtardı', k4.uid===k4a, k4a+' → '+k4.uid+' · kurtarma #'+k4.kurt);
  k('kurtarma sonrası kasa yeniden yazıldı', k4.idb);
  // eski hesabı geri yükle (sonraki testler için)
  await p.evaluate(()=>{ localStorage.setItem('neyapsam_v1', JSON.stringify({user:{uid:S.user.uid,hesapNo:S.user.hesapNo,olusturma:S.user.olusturma},points:0})); });

  /* --- 5) Ayarlar: hesap satırları + tehlikeli ayarlar kartı --- */
  await p.evaluate(()=>App.go('ayarlar')); await sleep(600);
  const ay=await p.evaluate(()=>{
    const main=document.querySelector('#main'); const t=main.textContent.replace(/\s+/g,' ');
    const kart=main.querySelector('.p21-tehlike');
    const btns=kart? [...kart.querySelectorAll('button')].map(x=>x.textContent.trim()) : [];
    const kv=[...main.querySelectorAll('.kv')].map(x=>x.textContent.replace(/\s+/g,' '));
    return {tehlike:!!kart, btns, hesapNo:(kv.find(x=>/Hesap No/.test(x))||''), uyekik:(kv.find(x=>/Üyelik/.test(x))||''),
      kimlik:(kv.find(x=>/Hesap kimliği/.test(x))||''), t};
  });
  k('Ayarlar’da “Tehlikeli Ayarlar” kartı', ay.tehlike);
  k('kartta 3 tehlikeli işlem var', ay.btns.length===3, ay.btns.join(' | '));
  k('  ↳ önbellek temizle', ay.btns.some(x=>/Önbellek/.test(x)));
  k('  ↳ uygulamayı sıfırla', ay.btns.some(x=>/sıfırla/i.test(x)));
  k('  ↳ hesabı sil', ay.btns.some(x=>/Hesabı sil/.test(x)));
  k('hesap numarası Ayarlar’da görünüyor', new RegExp('#'+k0.no).test(ay.hesapNo), ay.hesapNo);
  k('hesap kimliği görünüyor', (ay.kimlik||'').includes(k0.uid), ay.kimlik);
  k('üyelik tarihi görünüyor', /\d{2}\.\d{2}\.\d{4}/.test(ay.uyekik||''), ay.uyekik);

  /* --- 6) SIFIRLA: hesap korunur, ilerleme gider --- */
  await p.evaluate(()=>{ S.points=555; S.notes=[{t:'sıfırlanacak not',b:'x',at:Date.now()}]; save(true); });
  await sleep(500);
  await p.evaluate(()=>Hsp.sifirlaOnay()); await sleep(400);
  const onay=await p.evaluate(()=>{const m=document.querySelector('#modal');return {acik:!!document.querySelector('#overlay.open'), yazi:m.textContent.replace(/\s+/g,' ')};});
  k('sıfırlama için onay ekranı çıkıyor', onay.acik && /korunacak/i.test(onay.yazi));
  await p.evaluate(()=>Hsp.sifirlaUygula());
  await p.waitForNavigation({waitUntil:'load',timeout:20000});
  await p.waitForFunction("typeof S!=='undefined' && S && S.user && !!S.user.uid",{timeout:20000});
  await sleep(500);
  const kr=await p.evaluate(()=>({uid:S.user.uid,no:S.user.hesapNo,pts:S.points,not:(S.notes||[]).length,ad:S.user.name}));
  k('sıfırlamadan sonra AYNI hesap', kr.uid===k0.uid, kr.uid);
  k('sıfırlamada ilerleme silindi', kr.pts===0 && kr.not===0, 'puan '+kr.pts+' · not '+kr.not);
  k('sıfırlamada hesap no korundu', kr.no===k0.no, '#'+kr.no);

  /* --- 7) HESABI SİL: doğrulama şartı + yeni hesap --- */
  await p.evaluate(()=>App.go('ayarlar')); await sleep(500);
  await p.evaluate(()=>Hsp.silOnay()); await sleep(400);
  const sm=await p.evaluate(()=>{const m=document.querySelector('#modal');return {acik:!!document.querySelector('#overlay.open'), yazi:m.textContent.replace(/\s+/g,' '), input:!!document.getElementById('p21SilDog')};});
  k('hesap silme onay ekranı + doğrulama kutusu', sm.acik && sm.input);
  // yanlış numara → silmez
  await p.evaluate(()=>{ document.getElementById('p21SilDog').value='0000'; Hsp.silUygula(); });
  await sleep(600);
  const yanlis=await p.evaluate(()=>({acik:!!document.querySelector('#overlay.open'), err:(document.getElementById('p21SilErr')||{}).textContent||'', uid:S.user.uid}));
  k('yanlış numarada silmiyor', yanlis.acik && yanlis.uid===k0.uid, (yanlis.err||'').slice(0,50));
  // doğru numara → siler
  const dogruNo=await p.evaluate(()=>String(Hsp.no()));
  await p.evaluate(n=>{ document.getElementById('p21SilDog').value=n; Hsp.silUygula(); }, dogruNo);
  await p.waitForNavigation({waitUntil:'load',timeout:25000});
  await p.waitForFunction("typeof S!=='undefined' && S && S.user && !!S.user.uid",{timeout:25000});
  await sleep(800);
  const ks=await p.evaluate(()=>({uid:S.user.uid,no:S.user.hesapNo,pts:S.points,
    kasa:JSON.parse(localStorage.getItem('neyapsam_kasa')||'null'), ck:(document.cookie.match(/neyapsam_kasa=([^;]*)/)||[])[1]||''}));
  k('hesap silinince YENİ hesap açıldı', ks.uid!==k0.uid, k0.uid+' → '+ks.uid);
  k('yeni hesap numarası da 4 haneli', ks.no>=1000 && ks.no<=9999, '#'+ks.no);
  k('eski kimlik kasalarda kalmadı', (!ks.kasa||ks.kasa.uid!==k0.uid) && ks.ck.indexOf(k0.uid)<0, 'kasa: '+((ks.kasa||{}).uid||'boş'));
  k('silme sonrası ilerleme sıfır', (ks.pts||0)===0, 'puan '+ks.pts);

  /* --- 8) otomatik giriş: giriş ekranı yok --- */
  const girisEkrani=await p.evaluate(()=>!!document.querySelector('#login,#giris,.login-screen'));
  k('giriş/şifre ekranı yok (otomatik giriş)', !girisEkrani);

  errs=errs.concat(await p.evaluate(()=>[]));
  console.log('\n=== TUR 10: KALICI HESAP + TEHLİKELİ AYARLAR ===');
  ok.forEach(x=>console.log('  ✅',x));
  bad.forEach(x=>console.log('  ❌',x));
  k('sayfa JS hatası yok', errs.length===0, errs.slice(0,3).join(' | '));
  console.log(hata? ('\nSONUÇ: '+hata+' SORUN ❌') : '\nSONUÇ: HEPSİ GEÇTİ ✅');
  await b.close();
  process.exit(hata?1:0);
})();
