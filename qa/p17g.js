
  /* =====================================================================
     8) UYGULAMAYA ENTEGRASYON
     ===================================================================== */
  window.GEZI_ROUTES=RU;
  window.GEZI_RMAP={}; RU.forEach(function(r){ window.GEZI_RMAP[r.n]=r.r; });
  window.POOL_STATS=function(){ return [
    {k:'🎮 Oyun önerisi', e:'🎮', n:GAMES.length},
    {k:'🎬 Film / dizi', e:'🎬', n:MOVIES.length},
    {k:'🎵 Müzik önerisi', e:'🎵', n:MUSIC.length},
    {k:'🍽️ Yemek tarifi fikri', e:'🍽️', n:FOODS.length},
    {k:'🧭 Gezi rotası', e:'🧭', n:RU.length+CITIES.length},
    {k:'🧠 Test sorusu', e:'🧠', n:QUIZ.length}
  ]; };
  window.POOL_TOTAL=function(){ return GAMES.length+MOVIES.length+MUSIC.length+FOODS.length+RU.length+CITIES.length+QUIZ.length; };

  /* rota adlarını bölgeye bağla */
  var _regionOf=regionOf;
  regionOf=function(x){ if(window.GEZI_RMAP&&window.GEZI_RMAP[x]) return window.GEZI_RMAP[x]; return _regionOf(x); };

  /* aday listesi: 'rota' modu */
  var _cand=Media.candidates.bind(Media);
  function candOf(kind){
    if(kind==='city'){
      var f=Media.filters.city;
      if(f&&f.mode==='rota'){
        var a=RU;
        if(f.region&&f.region!=='all') a=a.filter(function(r){ return r.r===f.region; });
        return a;
      }
    }
    return _cand(kind);
  }
  Media.candidates=candOf;

  /* rota modalı */
  var _modalHtml=Media.modalHtml.bind(Media);
  Media.modalHtml=function(kind,it){
    if(kind==='city'&&it&&it.route){
      var c=it.city||'Türkiye', lq=it.lq||it.n;
      return '<h2>🧭 Gezi rotası önerisi</h2>'
      +'<div class="pick"><div class="title">'+esc(it.n)+' <span class="tag">'+esc(it.r||'Türkiye')+'</span></div>'
      +'<div class="meta">'+esc(it.d)+'</div>'
      +'<div class="list mt">'+it.s.map(function(sp){ return '<div class="lr"><span>📍</span><div class="grow"><div class="t">'+esc(sp)+'</div>'
        +'<div class="a">'+ext('https://www.google.com/maps/search/'+q(sp+' '+c),'Harita','ghost')+'</div></div></div>'; }).join('')+'</div></div>'
      +'<div class="btnrow mt">'+ext('https://www.google.com/maps/search/'+q(lq),'🗺️ Haritada aç','primary')
        +ext('https://www.youtube.com/results?search_query='+q(lq+' gezi rehberi'),'Vlog & rehber','red')
        +ext('https://www.google.com/search?q='+q(lq+' gezi rehberi'),'Blog & yazı','ghost')+'</div>'
      +'<div class="btnrow mt"><button class="btn primary sm" onclick="Media.pick(\'city\')">🎲 Başka öner</button>'
        +'<button class="btn sm" onclick="Media.planAdd(\''+jsa(it.n)+'\')">📋 Planıma ekle</button></div>';
    }
    return _modalHtml(kind,it);
  };

  /* linklerde üretilmiş kayıtlar için arama metni (lq) kullan */
  var _gameLinks=Media.gameLinks.bind(Media);
  Media.gameLinks=function(g){
    if(g&&g.lq){ var s=_gameLinks(Object.assign({},g,{n:g.lq})); if(g.freeOnly) s=s.replace('search/?term=','search/?maxprice=free&term='); return s; }
    return _gameLinks(g);
  };
  var _filmLinks=Media.filmLinks.bind(Media);
  Media.filmLinks=function(f){ if(f&&f.lq) return _filmLinks(Object.assign({},f,{n:f.lq})); return _filmLinks(f); };
  var _foodLinks=Media.foodLinks.bind(Media);
  Media.foodLinks=function(y){ if(y&&y.lq) return _foodLinks(Object.assign({},y,{n:y.lq})); return _foodLinks(y); };

  /* öneri seçimi: önce gerçek içerik, karışık havuzdan da destekle */
  Media.rand=function(kind){
    var list=candOf(kind);
    if(!list.length) return null;
    var real=list.filter(function(x){ return !x.gen; });
    var base=(real.length&&Math.random()<0.6)?real:list;
    var seen=S.prefs.mediaP[kind]||[];
    var fresh=base.filter(function(x){ return seen.indexOf(x.n||(x.a+' - '+x.s))<0; });
    var pool=fresh.length?fresh:base;
    var it=pool[Math.floor(Math.random()*pool.length)];
    var key=it.n||(it.a+' - '+it.s);
    S.prefs.mediaP[kind]=[key].concat(seen).slice(0,25);
    if(kind==='games') S.prefs.mediaG[it.g]=(S.prefs.mediaG[it.g]||0)+1;
    if(kind==='film') (it.g||[]).forEach(function(g){ S.prefs.mediaG['f_'+g]=(S.prefs.mediaG['f_'+g]||0)+1; });
    if(kind==='music') S.prefs.mediaM[it.g]=(S.prefs.mediaM[it.g]||0)+1;
    save();
    return it;
  };

  /* ---------- biçimlendirme + ana sayfa havuz kartı ---------- */
  window.fmtN=function(n){ try{ return Number(n).toLocaleString('tr-TR'); }catch(e){ return String(n); } };
  try{
    var _home=VIEWS.home.bind(VIEWS);
    VIEWS.home=function(){
      var mine=_home(), st=window.POOL_STATS(), tot=window.POOL_TOTAL();
      var rows=st.map(function(x){ return '<div class="lr"><span>'+x.e+'</span><div class="grow"><div class="t">'+x.k+'</div></div><div class="a"><b>'+window.fmtN(x.n)+'</b></div></div>'; }).join('');
      var card='<div class="card mt2"><div class="row between"><div><h3>📚 Öneri havuzu</h3><div class="tiny muted">Toplam <b>'+window.fmtN(tot)+'</b> öğe hazır: gerçek içerik + filtre bileşenlerinden üretilen keşif paketleri.</div></div><span class="tag ok">dev havuz</span></div>'
        +'<div class="list mt">'+rows+'</div>'
        +'<div class="tiny muted mt">Havuz her açılışta aynı tohumla kurulur; öneriler ilk olarak gerçek içerikten seçilir ve tüm filtreler bu havuzla çalışır.</div></div>';
      return mine+card;
    };
  }catch(e){}
  window.POOL_MS=Date.now()-_t0;
  try{ console.log('✅ Öneri havuzu hazır — toplam '+window.POOL_TOTAL()+' öğe ('+window.POOL_MS+' ms)'); }catch(e){}
}catch(e){ try{ console.warn('Öneri havuzu kurulamadı:',e&&e.message); }catch(_){} }
})();
