/* KALICI ANAHTAR BEKÇİSİ — anahtar güncellemelerde asla değişmemeli */
const fs=require('fs');
const puppeteer=require('puppeteer');
const DOSYA='/home/user/ne-yapsam.html';
const BEKLENEN='neyapsam_v1';
let hata=0; const ok=[],bad=[];
function k(ad,sonuc,ek){ (sonuc? ok.push(ad+(ek?' — '+ek:'')) : bad.push(ad+(ek?' — '+ek:''))); if(!sonuc) hata++; }
(async()=>{
  const s=fs.readFileSync(DOSYA,'utf8');
  k('LS_KEY tanımı tek', (s.match(/const LS_KEY=/g)||[]).length===1);
  k('LS_KEY değeri '+BEKLENEN, new RegExp("const LS_KEY='"+BEKLENEN+"'").test(s));
  k('korumalı kopya (P20_LS_KEY_SABIT)', s.includes("const P20_LS_KEY_SABIT = '"+BEKLENEN+"'"));
  k('koruma uyarısı metni', s.includes('KALICI ANAHTAR: '+BEKLENEN+' — SÜRÜM GÜNCELLEMELERİNDE ASLA DEĞİŞTİRİLMEZ'));
  k('dışa açık pencere değişkeni', s.includes('window.NEYAPSAM_LS_KEY'));
  k('sabit anahtar rozeti (ayarlar)', s.includes('Kayıt anahtarı 🔒') && s.includes('${LS_KEY} · sabit'));
  const anahtarlar=[...s.matchAll(/localStorage\.setItem\('([^']+)'/g)].map(m=>m[1]);
  const yardimci=anahtarlar.filter(a=>a!==BEKLENEN);
  k('yardımcı anahtarlar çakışmıyor', yardimci.every(a=>/^neyapsam_(fx|cs_stores)$/.test(a)), yardimci.join(', ')||'yok');
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage(); await p.setViewport({width:1440,height:1000});
  await p.goto('file://'+DOSYA,{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  await new Promise(r=>setTimeout(r,1200));
  await p.evaluate(()=>{ S.points=4242; S.user.name='Ali'; S.notes=[{t:'deneme',d:Date.now(),x:'kalıcılık'}]; save(true); });
  await new Promise(r=>setTimeout(r,900));   // kayıt yazımı tamamlansın
  const A=await p.evaluate(()=>({beklenen:window.NEYAPSAM_LS_KEY, ks:Object.keys(localStorage), anaVeri:!!localStorage.getItem('neyapsam_v1'), pts:JSON.parse(localStorage.getItem('neyapsam_v1')||'{}').points, canli:S.points}));
  k('window.NEYAPSAM_LS_KEY', A.beklenen===BEKLENEN, A.beklenen);
  k('ana veri anahtarı kullanımda', A.anaVeri && A.pts===4242, 'puan kayıtta: '+A.pts);
  k('başka uygulama anahtarı yok', A.ks.every(x=>[BEKLENEN,'neyapsam_fx','neyapsam_cs_stores','neyapsam_kasa'].includes(x)), A.ks.join(', '));
  await p.reload({waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  await new Promise(r=>setTimeout(r,1200));
  const B=await p.evaluate(()=>({pts:S.points, ad:S.user.name, not:(S.notes||[]).length}));
  k('yeniden açılışta puan korundu', B.pts===4242, 'puan '+B.pts);
  k('yeniden açılışta ad korundu', B.ad==='Ali', B.ad);
  k('yeniden açılışta not korundu', B.not===1, B.not+' not');
  await b.close();
  console.log('=== KALICI ANAHTAR BEKÇİSİ ('+BEKLENEN+') ===');
  ok.forEach(x=>console.log('  ✅',x));
  bad.forEach(x=>console.log('  ❌',x));
  console.log(hata? ('\nSONUÇ: '+hata+' SORUN ❌') : '\nSONUÇ: HEPSİ GEÇTİ ✅ (anahtar sabit, veri kalıcı)');
  process.exit(hata?1:0);
})();
