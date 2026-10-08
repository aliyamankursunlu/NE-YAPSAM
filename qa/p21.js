/* =========================================================================
   Bölüm 21 — KALICI HESAP (otomatik giriş) + TEHLİKELİ AYARLAR
   -------------------------------------------------------------------------
   · Hesap kimliği (uid) BİR KEZ üretilir; cihaz sıfırlanmadığı (tarayıcı
     verileri silinmediği) sürece aynı kalır. 100 güncelleme gelse de aynı
     hesaba otomatik giriş yapılır.
   · Kayıt anahtarı neyapsam_v1 SABİTTİR (Bölüm 20 sözleşmesi) — değişmez.
   · Kimlik 3 ayrı kasada yedekli tutulur: localStorage + çerez + IndexedDB.
     Ana kayıt silinse bile kimlik kasalardan geri yüklenir.
   ========================================================================= */
const HSP_KASA='neyapsam_kasa';      /* yardımcı anahtar: sadece hesap kimliği yedeği */
const HSP_SURUM=1;
const P21_UID_KALICI=true;           /* uid asla güncellemeyle değişmez */
let p21_OLUM=false;                  /* hesap silinirken: otomatik kayıt hesabı geri yazmasın */

/* ---------------- 1) KASALAR (kimlik yedekleri) ---------------- */
function p21_lsOku(){ try{ const r=localStorage.getItem(HSP_KASA); return r?JSON.parse(r):null; }catch(e){ return null; } }
function p21_lsYaz(o){ try{ localStorage.setItem(HSP_KASA,JSON.stringify(o)); return true; }catch(e){ return false; } }
function p21_lsSil(){ try{ localStorage.removeItem(HSP_KASA); }catch(e){} }
function p21_ckOku(){ try{ const m=document.cookie.match(/(?:^|;\s*)neyapsam_kasa=([^;]*)/); return m?JSON.parse(decodeURIComponent(m[1])):null; }catch(e){ return null; } }
function p21_ckYaz(o){ try{ document.cookie='neyapsam_kasa='+encodeURIComponent(JSON.stringify(o))+'; path=/; max-age=315360000; SameSite=Lax'; return document.cookie.indexOf('neyapsam_kasa=')>=0; }catch(e){ return false; } }
function p21_ckSil(){ try{ document.cookie='neyapsam_kasa=; path=/; max-age=0; SameSite=Lax'; }catch(e){} }
function p21_idb(){ return new Promise(function(res){ let bitti=false; const bit=v=>{ if(!bitti){ bitti=true; res(v); } };
  try{ const t=setTimeout(()=>bit(null),3000);
    const rq=indexedDB.open(HSP_KASA,1);
    rq.onupgradeneeded=()=>{ try{ if(!rq.result.objectStoreNames.contains('kimlik')) rq.result.createObjectStore('kimlik'); }catch(e){} };
    rq.onsuccess=()=>{ clearTimeout(t); bit(rq.result); };
    rq.onerror=()=>{ clearTimeout(t); bit(null); };
    rq.onblocked=()=>{ clearTimeout(t); bit(null); };
  }catch(e){ bit(null); } }); }
function p21_idbOku(){ return p21_idb().then(db=>{ if(!db) return null; return new Promise(function(res){
  try{ const tx=db.transaction('kimlik','readonly'), rq=tx.objectStore('kimlik').get('kimlik');
    rq.onsuccess=()=>res(rq.result||null); rq.onerror=()=>res(null);
  }catch(e){ res(null); } }); }); }
function p21_idbYaz(o){ return p21_idb().then(db=>{ if(!db) return false; return new Promise(function(res){
  try{ const tx=db.transaction('kimlik','readwrite'); tx.objectStore('kimlik').put(o,'kimlik');
    tx.oncomplete=()=>res(true); tx.onerror=()=>res(false);
  }catch(e){ res(false); } }); }); }
function p21_idbSil(){ return p21_idb().then(db=>{ if(!db) return false; return new Promise(function(res){
  try{ const tx=db.transaction('kimlik','readwrite'); tx.objectStore('kimlik').delete('kimlik');
    tx.oncomplete=()=>res(true); tx.onerror=()=>res(false);
  }catch(e){ res(false); } }); }); }

/* ---------------- 2) HESAP MODÜLÜ ---------------- */
const Hsp={
  /* --- kimlik üretimi --- */
  uidUret(){
    const t=Date.now().toString(36).toUpperCase();
    let r=''; for(let i=0;i<4;i++) r+='0123456789ABCDEFGHJKMNPQRSTUVWXYZ'[Math.floor(Math.random()*33)];
    return 'NY-'+t+'-'+r;
  },
  /* uid'den sabit, kısa ve okunabilir hesap numarası (örn. 1232) */
  hesapNo(uid){
    let h=2166136261; const s=String(uid||'');
    for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); }
    return 1000+(Math.abs(h)%9000);
  },
  hazir(){ try{ return (typeof S!=='undefined') && !!S && !!S.user; }catch(e){ return false; } },
  no(){ try{ return S.user.hesapNo || Hsp.hesapNo(S.user.uid); }catch(e){ return 0; } },
  kisa(){ try{ return String(S.user.uid||'—'); }catch(e){ return '—'; } },
  uyelik(){ try{ const t=S.user.olusturma||Date.now(); return new Date(t).toLocaleDateString('tr-TR'); }catch(e){ return '—'; } },
  girisSayisi(){ try{ return S.user.giris||1; }catch(e){ return 1; } },
  sonGiris(){ try{ if(!S.user.sonGiris) return '—'; return new Date(S.user.sonGiris).toLocaleString('tr-TR'); }catch(e){ return '—'; } },
  kimlikOku(){
    if(!Hsp.hazir()) return null;
    try{ return { uid:S.user.uid||'', hesapNo:S.user.hesapNo||Hsp.hesapNo(S.user.uid), ad:S.user.name||'',
      olusturma:S.user.olusturma||0, giris:S.user.giris||0, surum:HSP_SURUM, kasa:Date.now() }; }catch(e){ return null; }
  },
  /* --- kasaları tazele (sık yazmayı önlemek için kısıtlı) --- */
  kasaTaze(zorla){
    try{
      if(p21_OLUM) return;            /* hesap siliniyor: kasa yazılmasın */
      if(!Hsp.hazir()) return;
      const k=Hsp.kimlikOku(); if(!k||!k.uid) return;
      const simdi=Date.now();
      const degisti = !Hsp._sonKasa || Hsp._sonKasa.uid!==k.uid || Hsp._sonKasa.ad!==k.ad || Hsp._sonKasa.giris!==k.giris;
      if(!zorla && !degisti && (simdi-(Hsp._sonZaman||0))<60000) return;
      Hsp._sonKasa=k; Hsp._sonZaman=simdi;
      p21_lsYaz(k); p21_ckYaz(k);
      if(degisti) p21_idbYaz(k);
    }catch(e){}
  },
  kopyala(){
    const txt='NE YAPSAM? Hesap No #'+Hsp.no()+'\nKimlik: '+Hsp.kisa();
    try{ if(typeof copyText==='function'){ copyText(txt,'Hesap bilgisi','ne-yapsam-hesap.txt'); return; } }catch(e){}
    try{ navigator.clipboard.writeText(txt); toast('📋','Kopyalandı','Hesap No #'+Hsp.no(),'good',2400); }catch(e){}
  },
  /* ---------------- TEHLİKELİ AYARLAR ---------------- */
  /* a) önbellekler (zararsız) */
  onbellegiTemizle(){
    let n=0;
    try{ ['neyapsam_fx','neyapsam_cs_stores'].forEach(k=>{ if(localStorage.getItem(k)!==null){ localStorage.removeItem(k); n++; } }); }catch(e){}
    toast('🧹','Önbellek temizlendi', n? (n+' önbellek silindi (döviz kuru · mağaza listesi)') : 'Silinecek önbellek yoktu','good',2600);
    try{ App.repaintCurrent(); }catch(e){}
  },
  /* b) uygulamayı sıfırla — HESAP KORUNUR */
  sifirlaOnay(){
    showModal('<h2>🔄 Uygulamayı sıfırla</h2>'
      +'<p class="muted">Tüm ilerleme silinecek: <b>puanlar, seviye, rozetler, notlar, bahçe, ağaç, istatistikler ve ayarlar</b> fabrika ayarlarına döner.</p>'
      +'<p class="muted tiny"><b>Korunacak:</b> hesabın (<b>#'+esc(Hsp.no())+'</b>), adın ve otomatik girişin. Yani sıfırlamadan sonra yine <b>aynı hesapta</b> olacaksın.</p>'
      +'<div class="btnrow end mt">'
      +'<button class="btn ghost" onclick="closeModal()">Vazgeç</button>'
      +'<button class="btn sm" onclick="Ayar.export()">⬇️ Önce yedek al</button>'
      +'<button class="btn warn" onclick="Hsp.sifirlaUygula()">🔄 Evet, sıfırla</button>'
      +'</div>',{lock:true});
  },
  sifirlaUygula(){
    const k=Hsp.kimlikOku()||{};
    closeModal();
    try{
      Store.del(LS_KEY);
      S=defaultState();
      S.user=S.user||{};
      S.user.uid=k.uid||Hsp.uidUret();
      S.user.hesapNo=k.hesapNo||Hsp.hesapNo(S.user.uid);
      S.user.olusturma=k.olusturma||Date.now();
      S.user.name=k.ad||'';
      S.user.giris=(k.giris||0)+1;
      S.user.sonGiris=Date.now();
      S.user.sifirlama=(k.sifirlama||0)+1;
      Store.set(LS_KEY,JSON.stringify(S));
      Hsp.kasaTaze(true); p21_idbYaz(Hsp.kimlikOku());
    }catch(e){ console.warn('sıfırlama',e); }
    toast('🔄','Sıfırlandı','Hesap #'+Hsp.no()+' korundu. Uygulama yeniden başlatılıyor…','warn',2200);
    setTimeout(()=>{ try{ location.reload(); }catch(e){} },900);
  },
  /* c) hesabı sil — HER ŞEY gider, yeni hesap açılır */
  silOnay(){
    const no=String(Hsp.no());
    showModal('<h2>🗑️ Hesabı sil</h2>'
      +'<p class="muted"><b>#'+esc(no)+'</b> numaralı hesap bu cihazdan <b>tamamen silinecek</b>: puanlar, seviye, satın alınan eşyalar, notlar, bahçe, ağaç, istatistikler — hepsi gider ve <b>geri getirilemez</b>. Uygulamayı bir daha açtığında <b>sıfırdan yeni bir hesap</b> oluşturulur.</p>'
      +'<p class="muted tiny">Emin olduğunu doğrulamak için hesap numaranı yaz: <b>'+esc(no)+'</b></p>'
      +'<input id="p21SilDog" type="text" inputmode="numeric" autocomplete="off" placeholder="'+esc(no)+'" style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid rgba(127,127,127,.4);background:rgba(127,127,127,.08);color:inherit;font-size:14px">'
      +'<div id="p21SilErr" style="color:#ff8a8a;font-size:12px;min-height:16px;margin-top:6px"></div>'
      +'<div class="btnrow end mt">'
      +'<button class="btn ghost" onclick="closeModal()">Vazgeç</button>'
      +'<button class="btn sm" onclick="Ayar.export()">⬇️ Önce yedek al</button>'
      +'<button class="btn red" onclick="Hsp.silUygula()">🗑️ Hesabı kalıcı sil</button>'
      +'</div>',{lock:true});
    setTimeout(()=>{ const el=document.getElementById('p21SilDog'); if(el) try{ el.focus(); }catch(e){} },60);
  },
  silUygula(){
    const el=document.getElementById('p21SilDog');
    const v=String((el&&el.value)||'').trim();
    const no=String(Hsp.no());
    if(v!==no){
      const e=document.getElementById('p21SilErr');
      if(e) e.textContent='Hesap numarası eşleşmedi — '+no+' yazmalısın.';
      if(el){ try{ el.focus(); el.select(); }catch(e2){} }
      return;
    }
    closeModal();
    p21_OLUM=true;                                     /* otomatik kayıt hesabı geri yazmasın */
    try{ clearTimeout(saveTimer); }catch(e){}          /* bekleyen gecikmeli kayıt iptal */
    toast('🗑️','Hesap siliniyor','#'+no+' kalıcı olarak kaldırılıyor…','warn',2000);
    try{ Store.del(LS_KEY); }catch(e){}
    p21_lsSil(); p21_ckSil();
    try{ localStorage.removeItem('neyapsam_fx'); localStorage.removeItem('neyapsam_cs_stores'); }catch(e){}
    let bitti=false; const git=()=>{ if(bitti) return; bitti=true; try{ location.reload(); }catch(e){} };
    p21_idbSil().then(git); setTimeout(git,1500);
  }
};

/* ---------------- 3) AÇILIŞTA KİMLİK GARANTİSİ + OTOMATİK GİRİŞ ---------------- */
/* S hazır mı? (let S; dosyanın sonunda tanımlı — TDZ'ye düşmemek için try/catch) */
function p21_S(){ try{ return (typeof S!=='undefined') && !!S; }catch(e){ return false; } }

/* Yüklenen kayıtta uid yoksa kasalardan geri yükle, yoksa üret */
function p21_uidGaranti(st){
  try{
    st = st || (typeof defaultState==='function' ? defaultState() : {});
    st.user = st.user || {};
    if(!st.user.uid){
      const mir = p21_lsOku() || p21_ckOku() || null;
      if(mir && mir.uid){
        st.user.uid=mir.uid;
        st.user.hesapNo=mir.hesapNo||Hsp.hesapNo(mir.uid);
        st.user.olusturma=mir.olusturma||Date.now();
        if(!st.user.name && mir.ad) st.user.name=mir.ad;
        st.user.kurtarildi=(st.user.kurtarildi||0)+1;
      }else{
        const u=Hsp.uidUret();
        st.user.uid=u; st.user.hesapNo=Hsp.hesapNo(u); st.user.olusturma=Date.now(); st.user.kurtarildi=0;
      }
    }
    if(!st.user.hesapNo) st.user.hesapNo=Hsp.hesapNo(st.user.uid);
    if(!st.user.olusturma) st.user.olusturma=Date.now();
    return st;
  }catch(e){ return st; }
}

/* IndexedDB kasasında eski bir kimlik varsa ve bu hesap bomboşsa geri al */
function p21_idbGeriAl(){
  p21_idbOku().then(function(m){
    try{
      if(!m || !m.uid || !p21_S()) return;
      if(S.user.uid===m.uid) return;
      const bos = (S.points||0)===0 && !(S.notes&&S.notes.length) && (S.user.giris||0)<=1 && !(S.farm&&S.farm.planted);
      if(bos){
        S.user.uid=m.uid;
        S.user.hesapNo=m.hesapNo||Hsp.hesapNo(m.uid);
        S.user.olusturma=m.olusturma||Date.now();
        if(!S.user.name && m.ad) S.user.name=m.ad;
        S.user.giris=(m.giris||0)+1;
        S.user.kurtarildi=(S.user.kurtarildi||0)+1;
        Hsp.kasaTaze(true);
        try{ save(true); }catch(e){}
        toast('🔑','Hesap geri yüklendi','Hesap No #'+S.user.hesapNo+' · yedek kasadan bulundu.','good',4200);
      }else{
        p21_idbYaz(Hsp.kimlikOku());   /* ana kayıt kazanır, kasayı ona göre güncelle */
      }
    }catch(e){}
  });
}

/* Açılış: otomatik giriş (şifre/ekran yok) */
function p21_boot(){
  if(!p21_S() || !S.user) return false;
  try{
    S.user=S.user||{};
    if(!S.user.uid){
      const u=Hsp.uidUret();
      S.user.uid=u; S.user.hesapNo=Hsp.hesapNo(u); S.user.olusturma=Date.now();
    }
    if(!S.user.hesapNo) S.user.hesapNo=Hsp.hesapNo(S.user.uid);
    if(!S.user.olusturma) S.user.olusturma=Date.now();
    S.user.giris=(S.user.giris||0)+1;
    S.user.sonGiris=Date.now();
    Hsp.kasaTaze(true);
    p21_idbGeriAl();
    try{ save(true); }catch(e){}
    if(!S.user.kaliciBilgi){
      S.user.kaliciBilgi=true;
      try{ save(true); }catch(e){}
      toast('🔑','Otomatik giriş yapıldı','Hesap No #'+S.user.hesapNo+' · bu cihazda kalıcı olarak senin hesabın.','good',5000);
    }
    return true;
  }catch(e){ console.warn('p21 boot',e); return false; }
}

/* --- kanca 1: load() — kayıt okunur okunmaz uid garanti edilsin --- */
try{
  if(typeof load==='function'){
    const __p21_load=load;
    window.load=function(){ let st=null; try{ st=__p21_load.apply(this,arguments); }catch(e){ st=null; } return p21_uidGaranti(st); };
  }
}catch(e){}

/* --- kanca 1b: sekmeler kapanırken yapılan otomatik kayıt ölüm bayrağında çalışmasın --- */
try{ addEventListener('beforeunload',function(){ if(p21_OLUM){ try{ Store.del(LS_KEY); }catch(e){} p21_lsSil(); } }); }catch(e){}

/* --- kanca 2: save() — kimlik kasaları güncel kalsın --- */
try{
  if(typeof save==='function'){
    const __p21_save=save;
    window.save=function(){
      if(p21_OLUM) return;            /* hesap silindi: hiçbir şey yazılmasın */
      const r=__p21_save.apply(this,arguments);
      try{ Hsp.kasaTaze(false); }catch(e){}
      return r;
    };
  }
}catch(e){}

/* --- kanca 3: yedekten geri yükleme cihaz hesabını ezmesin --- */
try{
  if(typeof Ayar!=='undefined' && Ayar && typeof Ayar.applyImport==='function'){
    const __p21_imp=Ayar.applyImport.bind(Ayar);
    Ayar.applyImport=function(){
      const yerel=(p21_S()&&S.user)? {uid:S.user.uid, hesapNo:S.user.hesapNo, olusturma:S.user.olusturma} : null;
      const r=__p21_imp.apply(null,arguments);
      try{ if(yerel && yerel.uid && p21_S()){
        S.user=S.user||{};
        S.user.uid=yerel.uid; S.user.hesapNo=yerel.hesapNo; S.user.olusturma=yerel.olusturma;
        Hsp.kasaTaze(true); save(true);
      } }catch(e){}
      return r;
    };
  }
}catch(e){}

/* --- kanca 4: eski sıfırlama düğmesi de hesabı korusun --- */
try{
  if(typeof Ayar!=='undefined' && Ayar && typeof Ayar.resetAll==='function'){
    Ayar.resetAll=function(){ Hsp.sifirlaOnay(); };
  }
}catch(e){}

/* ---------------- 4) GÖRÜNÜM ---------------- */
function p21_css(){
  if(document.getElementById('p21css')) return;
  const st=document.createElement('style'); st.id='p21css';
  st.textContent=
    '.p21-tehlike{border:1px solid rgba(255,86,86,.35)!important;background:linear-gradient(180deg,rgba(255,86,86,.08),transparent)!important}'
   +'.p21-tehlike h3{color:#ff9a9a}'
   +'.btn.warn{background:linear-gradient(180deg,#f7b955,#d97706)!important;border-color:#b45309!important;color:#1b1204!important;font-weight:700}'
   +'.p21-kod{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;opacity:.85;background:rgba(127,127,127,.16);padding:1px 6px;border-radius:6px}'
   +'#p21SilDog:focus{outline:2px solid #ff9a9a;outline-offset:1px}';
  document.head.appendChild(st);
}

/* Ayarlar → Tehlikeli Ayarlar kartı */
function p21_tehlikeKart(){
  const no=Hsp.no(), kisa=Hsp.kisa();
  return '<div class="card p21-tehlike"><h3>🔺 Tehlikeli Ayarlar</h3>'
    +'<p class="muted tiny">Bu bölümdeki işlemler <b>geri alınamaz</b>. <b>Sıfırla</b> ilerlemeni siler ama hesabın korunur; <b>Hesabı sil</b> bu cihazdaki hesabı tamamen kaldırır ve bir sonraki açılışta <b>yeni bir hesap</b> açar.</p>'
    +'<div class="btnrow mt">'
    +'<button class="btn sm" onclick="Hsp.onbellegiTemizle()">🧹 Önbellekleri temizle</button>'
    +'<button class="btn warn sm" onclick="Hsp.sifirlaOnay()">🔄 Uygulamayı sıfırla</button>'
    +'<button class="btn red sm" onclick="Hsp.silOnay()">🗑️ Hesabı sil</button>'
    +'</div>'
    +'<div class="hint mt">Hesap No <b>#'+esc(no)+'</b> <span class="p21-kod">'+esc(kisa)+'</span> · Bu kimlik cihaz sıfırlanmadığı sürece aynı kalır; uygulama güncellemelerinden etkilenmez.</div>'
    +'</div>';
}

function p21_baslat(){
  try{ p21_css(); }catch(e){}
  let deneme=0;
  const dene=function(){
    deneme++;
    if(p21_boot()){
      try{ if(App && App.tab==='ayarlar') App.repaintCurrent(); }catch(e){}
      return;
    }
    if(deneme<40) setTimeout(dene,150);
  };
  dene();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',p21_baslat);
setTimeout(p21_baslat,0);
