const fs=require('fs'); const {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync('/home/user/ne-yapsam.html','utf8');
const warns=[], jsErrs=[];
const vc=new VirtualConsole();
vc.on('jsdomError',e=>{ const m=e.message||''; if(!/Not implemented/.test(m)) jsErrs.push(m); });
vc.on('error',(...a)=>jsErrs.push('console.error: '+a.join(' ')));
vc.on('warn',(...a)=>{ const m=a.join(' '); if(!/Not implemented|Could not parse CSS/.test(m)) warns.push(m); });
const t0=Date.now();
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/',virtualConsole:vc});
const w=dom.window;

const PROGRAM = String.raw`(function(){
  var rep={}, err=[];
  function T(fn,label){ try{ return fn(); }catch(e){ err.push(label+': '+(e&&e.message)); return null; } }
  /* 1) havuzlar */
  rep.stats=T(function(){ return POOL_STATS(); },'POOL_STATS');
  rep.total=T(function(){ return POOL_TOTAL(); },'POOL_TOTAL');
  rep.genMs=T(function(){ var t=performance.now(); POOL_TOTAL(); return Math.round(performance.now()-t); },'genMs');
  rep.geziRoutes=T(function(){ return (window.GEZI_ROUTES||[]).length; },'GEZI_ROUTES');
  /* 2) sekmeler */
  rep.tabs=T(function(){ return (TABS||[]).map(function(t){ App.go(t.id); return {id:t.id, len:document.getElementById('main').innerHTML.length}; }); },'tabs');
  /* 3) filtre süpürmesi */
  rep.sweep=T(function(){
    var out=[], F=Media.filters, kinds={games:['g','s','p'],film:['t','g'],music:['g'],food:['k']};
    Object.keys(kinds).forEach(function(kind){
      var arr = kind==='games'?GAMES:kind==='film'?MOVIES:kind==='music'?MUSIC:FOODS;
      kinds[kind].forEach(function(key){
        var vals={}; arr.forEach(function(x){ var v=x[key]; (Array.isArray(v)?v:[v]).forEach(function(q){ if(q) vals[q]=1; }); });
        Object.keys(vals).forEach(function(v){ F[kind][key]=v; var n=Media.candidates(kind).length; out.push({k:kind+'.'+key+'='+v,n:n}); });
      });
    });
    ['random','own','region','city','rota'].forEach(function(md){ F.city.mode=md; out.push({k:'city.mode='+md,n:Media.candidates('city').length}); });
    Object.keys(REGIONS).forEach(function(r){ F.city.mode='region'; F.city.region=r; out.push({k:'city.region='+r,n:Media.candidates('city').length}); });
    F.games.g='all';F.games.s='all';F.games.p='all';F.film.t='all';F.film.g='all';F.music.g='all';F.food.k='all';F.city.mode='random';F.city.region='all';
    return out;
  },'sweep');
  /* 4) öneri seçimi + modal */
  rep.picks=T(function(){
    var out={}; ['games','film','music','food','city'].forEach(function(k){
      var ok=0, gen=0, link=0, errs=0;
      for(var i=0;i<12;i++){ try{ var it=Media.pick(k); var body=(document.getElementById('modal')||{}).innerHTML||'';
        if(body.length>80) ok++; var last=Media.last[k]; if(last&&last.gen) gen++;
        if(/Haritada|Steam|Spotify|JustWatch|tarif|Tarifi|Gezi rotası|YouTube/.test(body)) link++;
        if(typeof closeModal==='function') closeModal(); }catch(e){ errs++; err.push(k+'.pick: '+e.message); } }
      out[k]={ok:ok,gen:gen,link:link,err:errs};
    });
    return out;
  },'picks');
  /* 5) test havuzu */
  rep.quiz=T(function(){
    var qbad=0, dup=0, seen={}, subs={}, lv={}, ks={};
    QUIZ.forEach(function(q){ if(!q.q||!Array.isArray(q.o)||q.o.length<4||q.o.length>5||q.c==null||q.c<0||q.c>=q.o.length) qbad++;
      if(seen[q.q]) dup++; seen[q.q]=1; subs[q.d]=1; ks[q.k]=(ks[q.k]||0)+1; if(!q.e) lv.e=1; });
    var pools={}; [1,5,8,9,12].forEach(function(g){ S.user.grade=g; pools[g]=Quiz.pool().length; }); S.user.grade=5;
    return {bozuk:qbad, tekrar:dup, dersler:Object.keys(subs).length, sinifDagilimi:ks, havuz:pools, dersListesi:Object.keys(subs).slice(0,10)};
  },'quiz');
  /* 5b) test akışı: soru çöz, puan al */
  rep.quizFlow=T(function(){
    App.go('test'); var btn=document.querySelector("#main button"); if(btn) btn.click();
    var opts=document.querySelectorAll('#main .opt'); var before=S.points;
    if(opts.length){ var ans=Quiz.s.q&&Quiz.s.q.c; if(ans!=null&&opts[ans]) opts[ans].click(); }
    return {optSayisi:opts.length, puanOnce:before, puanSonra:S.points, yeniSoru:!!(Quiz.s.q)};
  },'quizFlow');
  /* 6) gezi rota modu */
  rep.rota=T(function(){
    Media.filters.city.mode='rota'; App.go('gezi');
    var html=document.getElementById('main').innerHTML;
    var it=Media.rand('city'); Media.last.city=it; Media.planAdd(it.n);
    var pl=(S.plans||[]).some(function(p){ return p.city===it.n; });
    var modalIt=Media.modalHtml('city',it)||'';
    Media.filters.city.mode='random';
    return {arayuz:html.indexOf('rota listelendi')>=0||html.indexOf('Hazır rota')>=0, secilenRota:it&&it.route===1, planEklendi:pl, modalLink:modalIt.length>300};
  },'rota');
  /* 7) kalıcılık */
  rep.persist=T(function(){
    S.points=S.points+1; save(true);
    var raw=localStorage.getItem('neyapsam_v1')||'';
    return {kayitBayt:raw.length, icindePuan:raw.indexOf('"points"')>=0};
  },'persist');
  /* 8) ölü kontrol taraması */
  rep.dead=T(function(){
    var dead=[], tot=0;
    (TABS||[]).forEach(function(t){ App.go(t.id); var h=document.getElementById('main').innerHTML;
      var m=h.match(/<button[^>]*>/g)||[]; tot+=m.length;
      m.forEach(function(x){ if(x.indexOf('onclick=')<0) dead.push(t.id+' → '+x.slice(0,70)); }); });
    return {toplamButon:tot, onclickSiz:dead};
  },'dead');
  /* 9) ana sayfa kartı */
  rep.home=T(function(){ App.go('home'); var h=document.getElementById('main').innerHTML; return {havuzKarti:h.indexOf('Öneri havuzu')>=0, uzunluk:h.length}; },'home');
  rep.errors=err;
  return JSON.stringify(rep);
})()`;
setTimeout(()=>{
  const loadMs=Date.now()-t0;
  let rep=null, evalErr=null;
  try{ rep=JSON.parse(w.eval(PROGRAM)); }catch(e){ evalErr=e.message; }
  if(!rep){ console.log('❌ test programı çalışmadı:', evalErr); console.log('js hataları:', jsErrs); process.exit(1); }
  const bad=[];
  const ok=(c,label,extra='')=>{ console.log((c?'✅':'❌')+' '+label+(extra?' — '+extra:'')); if(!c) bad.push(label); };

  console.log('=== 1) HAVUZ BOYUTLARI (sayfa yüklenme '+loadMs+' ms) ===');
  (rep.stats||[]).forEach(x=>console.log('   '+x.e+' '+x.k+': '+x.n.toLocaleString('tr-TR')));
  console.log('   TOPLAM: '+String(rep.total).toLocaleString('tr-TR')+'  |  hazır rota: '+rep.geziRoutes);
  const need={'🎮 Oyun önerisi':11000,'🎬 Film / dizi':11000,'🎵 Müzik önerisi':11000,'🍽️ Yemek tarifi fikri':11000,'🧭 Gezi rotası':12905,'🧠 Test sorusu':11000};
  (rep.stats||[]).forEach(x=>ok(x.n>=need[x.k], x.k+' ≥ '+need[x.k].toLocaleString('tr-TR'), String(x.n)));
  ok(rep.total>=60000,'TOPLAM ≥ 60.000', String(rep.total));

  console.log('\n=== 2) SEKMELER ===');
  (rep.tabs||[]).forEach(t=>ok(t.len>800,'sekme '+t.id,t.len+' karakter'));

  console.log('\n=== 3) FİLTRE SÜPÜRMESİ (her filtre değeri sonuç vermeli) ===');
  const empty=(rep.sweep||[]).filter(x=>x.n===0);
  ok((rep.sweep||[]).length>0,'süpürme çalıştı',(rep.sweep||[]).length+' değer');
  ok(empty.length===0,'boş sonuç veren filtre yok', empty.length?empty.map(x=>x.k).join(', '):'hepsi dolu');
  console.log('   örnek: '+ (rep.sweep||[]).slice(0,4).map(x=>x.k+' → '+x.n).join(' | ')+' …');

  console.log('\n=== 4) ÖNERİ SEÇİMİ (12 kez × 5 tür) ===');
  Object.keys(rep.picks||{}).forEach(k=>{ const p=rep.picks[k]; ok(p.ok===12&&p.err===0, k+'.pick', 'başarılı '+p.ok+'/12, üretilmiş '+p.gen+', linkli modal '+p.link); });

  console.log('\n=== 5) TEST SORULARI ===');
  const q=rep.quiz||{};
  ok(q.bozuk===0,'soru bütünlüğü (metin + 4-5 seçenek + geçerli doğru indeks)','bozuk: '+q.bozuk);
  ok(q.tekrar===0,'soru metinleri tekrarsız','tekrar: '+q.tekrar);
  ok(q.dersler>=15,'ders çeşitliliği', q.dersler+' ders — '+ (q.dersListesi||[]).join(', ')+'…');
  ok(JSON.stringify(q.sinifDagilimi),'sınıf dağılımı', JSON.stringify(q.sinifDagilimi));
  [1,5,8,9,12].forEach(g=>ok(q.havuz&&q.havuz[g]>0,'sınıf '+g+' havuzu', q.havuz&&q.havuz[g]));
  const qf=rep.quizFlow||{};
  ok(qf.optSayisi>=4,'test akışı: soru yüklendi', qf.optSayisi+' seçenek');
  ok(qf.puanSonra>=qf.puanOnce,'test akışı: puan işledi', qf.puanOnce+' → '+qf.puanSonra);

  console.log('\n=== 6) GEZİ ROTA MODU ===');
  const r=rep.rota||{};
  ok(r.arayuz,'rota modu arayüzde görünüyor');
  ok(r.secilenRota,'seçilen öğe hazır rota kaydı');
  ok(r.planEklendi,'rota plana eklendi');
  ok(r.modalLink,'rota modalı harita/vlog linkleriyle doldu');

  console.log('\n=== 7) KALICILIK ===');
  ok(rep.persist&&rep.persist.kayitBayt>200,'localStorage kaydı yazıldı', rep.persist&&rep.persist.kayitBayt+' bayt');

  console.log('\n=== 8) ÖLÜ KONTROL TARAMASI ===');
  ok(rep.dead&&rep.dead.onclickSiz.length===0,'onclick\'siz buton yok', rep.dead?rep.dead.toplamButon+' buton tarandı; '+rep.dead.onclickSiz.length+' şüpheli':'?');
  if(rep.dead&&rep.dead.onclickSiz.length) console.log('   '+rep.dead.onclickSiz.join('\n   '));

  console.log('\n=== 9) ANA SAYFA HAVUZ KARTI ===');
  ok(rep.home&&rep.home.havuzKarti,'ana sayfada havuz istatistik kartı', rep.home&&rep.home.uzunluk+' karakter');

  console.log('\n=== İÇ HATA KAYDI ===');
  console.log((rep.errors&&rep.errors.length)?rep.errors.join('\n'):'yok ✅');
  console.log('\n=== JS HATALARI ===');
  console.log(jsErrs.length?jsErrs.slice(0,8).join('\n'):'0 hata ✅');
  console.log('\n=== UYARILAR ===');
  console.log(warns.length?warns.slice(0,8).join('\n'):'yok');
  console.log('\n=== SONUÇ: '+(bad.length? bad.length+' SORUN → '+bad.join(' | ') : 'HEPSİ GEÇTİ ✅')+' ===');
  process.exit(bad.length?1:0);
},2000);
