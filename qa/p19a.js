
/* =====================================================================
   BÖLÜM 19A — MAĞAZA & FİYAT & MÜZİK DOĞRUDAN AÇMA (tur 6)
   - Doğrudan sayfa açma (DDG "I'm feeling ducky" yönlendirmesi)
   - Platforma göre doğru mağaza (Steam'de olmayanı Steam'de aramaz)
   - Canlı en ucuz fiyat + "başka nerede satılıyor" paneli (CheapShark API)
   - Öneriler artık paket/grup değil, tek tek somut içerik
   ===================================================================== */

var P19_DIRECT = (function(){
  /* DuckDuckGo "ı şanslı hissediyorum" (\ bang): ilk sonuca doğrudan gider */
  return function(text){ return 'https://duckduckgo.com/?q=' + encodeURIComponent('\\' + text); };
})();

/* ---------- platforma göre doğru mağaza / oyun sayfası ---------- */
function storeDirect(g){
  var nm = String((g && (g.lq || g.n)) || '').trim();
  if(!nm) return 'https://duckduckgo.com/?q=oyun';
  var p = g && g.p;
  if(p === 'steam'){
    var id = (window.P19C_APPID || {})[Price19.norm(nm)];
    if(id) return 'https://store.steampowered.com/app/' + id + '/?cc=tr&l=turkish';
    return P19_DIRECT('site:store.steampowered.com ' + nm);
  }
  if(p === 'epic')   return P19_DIRECT('site:store.epicgames.com ' + nm);
  return P19_DIRECT(nm + ' resmi site oyna');
}
function storeDirectLabel(g){
  var p = g && g.p;
  if(p === 'steam') return '▶️ Oynayacağın yere git (Steam)';
  if(p === 'epic')  return '▶️ Oynayacağın yere git (Epic)';
  return '▶️ Oynayacağın yere git';
}
function p19PlatTag(g){
  var p = g && g.p;
  if(p === 'steam') return '<span class="tag cy">Steam</span>';
  if(p === 'epic')  return '<span class="tag cy">Epic Games</span>';
  return '<span class="tag">Tarayıcı / mobil</span>';
}
/* şarkı: doğrudan şarkı sayfası (arama değil) */
function songDirect(a, s){
  return P19_DIRECT('site:open.spotify.com/track ' + a + ' ' + s);
}
function songDirectYt(a, s){
  return P19_DIRECT('site:youtube.com/watch ' + a + ' ' + s);
}
function songDirectApple(a, s){
  return P19_DIRECT('site:music.apple.com ' + a + ' ' + s);
}

/* ---------- mağaza listesi (panel) ---------- */
var P19_STORES = [
  ['Steam',            function(n){ return 'https://store.steampowered.com/search/?term=' + q(n); }],
  ['Epic Games',       function(n){ return 'https://store.epicgames.com/tr/browse?q=' + q(n); }],
  ['GOG',              function(n){ return 'https://www.gog.com/games?query=' + q(n); }],
  ['Humble Store',     function(n){ return 'https://www.humblebundle.com/store/search?search=' + q(n); }],
  ['Fanatical',        function(n){ return 'https://www.fanatical.com/en/search?search=' + q(n); }],
  ['Green Man Gaming', function(n){ return 'https://www.greenmangaming.com/search?query=' + q(n); }],
  ['itch.io',          function(n){ return 'https://itch.io/search?q=' + q(n); }],
  ['Microsoft Store',  function(n){ return 'https://www.microsoft.com/tr-tr/search/shop/games?q=' + q(n); }],
  ['PlayStation Store',function(n){ return 'https://store.playstation.com/tr-tr/search/' + q(n); }],
  ['Xbox',             function(n){ return 'https://www.xbox.com/tr-TR/search?q=' + q(n); }],
  ['Nintendo eShop',   function(n){ return 'https://www.nintendo.com/us/search/#q=' + q(n) + '&cat=gme'; }],
  ['Google Play',      function(n){ return 'https://play.google.com/store/search?q=' + q(n) + '&c=apps'; }],
  ['App Store',        function(n){ return 'https://www.apple.com/tr/search/' + q(n) + '?src=serp'; }],
  ['Amazon',           function(n){ return 'https://www.amazon.com.tr/s?k=' + q(n); }]
];

/* ---------- canlı fiyat modülü (CheapShark — ücretsiz, anahtar gerekmez) ---------- */
var Price19 = {
  stores: null, token: 0, cache: {},
  FALLBACK: {'1':'Steam','2':'GamersGate','3':'Green Man Gaming','7':'GOG','8':'EA App','11':'Humble Store','13':'Ubisoft Store',
             '15':'Fanatical','21':'WinGameStore','23':'GameBillet','24':'Voidu','25':'Epic Games Store','27':'GamesPlanet UK',
             '28':'GamesPlanet FR','29':'IndieGala','30':'Blizzard','31':'AllYouPlay','33':'DLGamer','34':'Noctre','35':'DreamGame',
             '37':'Gamivo','38':'Plitch','39':'GameStop','40':'Ziff Davis'},
  fetchJSON(url, ms){
    ms = ms || 6500;
    return new Promise(function(res, rej){
      var done = false, to = setTimeout(function(){ if(!done){ done = true; rej(new Error('zaman aşımı')); } }, ms);
      try{
        fetch(url, {mode:'cors', cache:'no-store'}).then(function(r){
          if(!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        }).then(function(j){ if(!done){ done = true; clearTimeout(to); res(j); } })
          .catch(function(e){ if(!done){ done = true; clearTimeout(to); rej(e); } });
      }catch(e){ if(!done){ done = true; clearTimeout(to); rej(e); } }
    });
  },
  norm(x){
    return String(x == null ? '' : x).toLowerCase()
      .replace(/[™®©]/g, '').replace(/&amp;/g, ' and ')
      .replace(/[^a-z0-9çğıiöşü ]/g, ' ').replace(/\s+/g, ' ').trim();
  },
  store(id){ return (this.stores && this.stores[id]) || this.FALLBACK[id] || ('Mağaza #' + id); },
  loadStores(){
    var self = this;
    if(self.stores) return Promise.resolve();
    try{ var c = localStorage.getItem('neyapsam_cs_stores'); if(c){ self.stores = JSON.parse(c); return Promise.resolve(); } }catch(e){}
    return self.fetchJSON('https://www.cheapshark.com/api/1.0/stores', 5000).then(function(list){
      var m = {}; (list || []).forEach(function(s){ m[s.storeID] = s.storeName; });
      if(Object.keys(m).length){ self.stores = m; try{ localStorage.setItem('neyapsam_cs_stores', JSON.stringify(m)); }catch(e){} }
    }).catch(function(){});
  },
  bestMatch(title, list){
    var t = this.norm(title), best = null, bs = 0;
    (list || []).forEach(function(g){
      var n = this.norm(g.external || g.title || '');
      if(!n) return;
      var sc = (n === t) ? 100 : (n.indexOf(t) === 0 ? 80 : (t.indexOf(n) === 0 ? 74 : (n.indexOf(t) >= 0 ? 60 : (t.indexOf(n) >= 0 ? 56 : 0))));
      if(sc > bs){ bs = sc; best = g; }
    }, this);
    return bs >= 56 ? best : null;
  },
  lookup(title){
    var self = this, key = self.norm(title), found = null;
    if(self.cache[key]) return Promise.resolve(self.cache[key]);
    return self.loadStores().then(function(){
      return self.fetchJSON('https://www.cheapshark.com/api/1.0/games?title=' + q(title) + '&limit=10');
    }).then(function(list){
      found = self.bestMatch(title, list);
      if(!found) throw new Error('eşleşme yok');
      return self.fetchJSON('https://www.cheapshark.com/api/1.0/games?id=' + encodeURIComponent(found.gameID));
    }).then(function(d){
      var deals = (d.deals || []).slice().sort(function(a, b){
        var pa = parseFloat(a.price) || 0, pb = parseFloat(b.price) || 0;
        if(pa === 0 && pb > 0) return 1; if(pb === 0 && pa > 0) return -1;
        return pa - pb;
      });
      var out = {cheapest: (deals[0] && deals[0].price) || d.cheapest, deals: deals.slice(0, 8), steamAppID: (found && found.steamAppID) || null};
      self.cache[key] = out;
      return out;
    });
  },
  money(p){ var n = parseFloat(p); return (!isFinite(n) || n <= 0) ? 'ücretsiz' : '$' + n.toFixed(2); },
  buyLink(deal){ return 'https://www.cheapshark.com/redirect?dealID=' + encodeURIComponent(deal.dealID); },
  /* modal içindeki fiyat bloğunu doldur */
  fill(it){
    var self = this;
    var box = document.getElementById('price19');
    if(!box) return;
    var name = (it && (it.lq || it.n)) || '';
    var gold = (it && it.gen && it.lq) ? it.lq : name;
    self.lastName = name;
    var myToken = ++self.token;
    box.innerHTML = '<div class="tiny muted">💰 Fiyatlar yükleniyor… (çevrimdışıysan bağlantılar yine çalışır)</div>';
    self.lookup(gold).then(function(res){
      if(myToken !== self.token || !document.getElementById('price19')) return;
      self.render(res);
    }).catch(function(){
      if(myToken !== self.token || !document.getElementById('price19')) return;
      self.renderOffline();
    });
  },
  staticHtml(name){
    var rows = P19_STORES.map(function(st){
      return '<div class="lr"><span>🏬</span><div class="grow"><div class="t">' + esc(st[0]) + '</div></div>'
        + '<div class="a">' + ext(st[1](name), 'Ara', 'ghost') + '</div></div>';
    }).join('');
    return '<div class="row between mt2"><b>🛍️ Başka nerede satılıyor?</b><span class="tiny muted">' + P19_STORES.length + ' mağaza</span></div>'
      + '<div class="list">' + rows + '</div>'
      + '<div class="btnrow mt">'
      + ext('https://isthereanydeal.com/search/?q=' + q(name), '📉 IsThereAnyDeal karşılaştır', 'primary')
      + ext('https://www.cheapshark.com/search?q=' + q(name), '🦈 CheapShark', 'ghost')
      + ext('https://duckduckgo.com/?q=' + encodeURIComponent(name + ' satın al fiyat'), '🔎 Fiyat ara', 'ghost')
      + '</div><div class="tiny muted mt">Listede olmayan bir mağaza için "Fiyat ara" bağlantısını kullan.</div>';
  },
  dealsHtml(res){
    var self = this, deals = res.deals || [];
    var cheap = deals[0] || {price: res.cheapest};
    var rows = deals.map(function(d){
      return '<div class="lr"><span>🏬</span><div class="grow"><div class="t">' + esc(self.store(d.storeID)) + '</div>'
        + '<div class="s">' + esc(self.money(d.price)) + (d.retailPrice && parseFloat(d.retailPrice) > parseFloat(d.price) ? ' · liste ' + esc(self.money(d.retailPrice)) : '') + '</div></div>'
        + '<div class="a">' + ext(self.buyLink(d), 'Satın al', 'ghost') + '</div></div>';
    }).join('');
    return '<div class="row between" style="gap:10px;flex-wrap:wrap;align-items:center">'
      + '<div><b>💰 En ucuz: ' + esc(self.money(cheap.price)) + '</b>' + (cheap.storeID ? ' <span class="tag ok">' + esc(self.store(cheap.storeID)) + '</span>' : '') + '</div>'
      + (cheap.dealID ? ext(self.buyLink(cheap), '🛒 En ucuzdan satın al', 'primary') : '')
      + '<button class="btn ghost sm" onclick="Price19.toggle()">🛍️ Başka nerede satılıyor?</button>'
      + '</div><div class="tiny muted mt">Fiyatlar uluslararası mağaza listesi (USD); kendi para birimin için mağaza sayfasına bak.</div>';
  },
  render(res){
    var box = document.getElementById('price19');
    if(!box) return;
    var name = this.lastName || ((Media.last.games && (Media.last.games.lq || Media.last.games.n)) || '');
    box.innerHTML = this.dealsHtml(res);
    var store = document.getElementById('store19');
    if(!store){
      store = document.createElement('div');
      store.id = 'store19'; store.className = 'store19';
      store.style.display = 'none';
      box.appendChild(store);
    }
    store.innerHTML = this.staticHtml(name);
  },
  renderOffline(){
    var box = document.getElementById('price19');
    if(!box) return;
    var name = this.lastName || ((Media.last.games && (Media.last.games.lq || Media.last.games.n)) || '');
    box.innerHTML = '<div class="row between" style="gap:10px;flex-wrap:wrap;align-items:center">'
      + '<div class="tiny muted">💰 Canlı fiyat alınamadı — aşağıdaki mağaza listesinden fiyatları karşılaştırabilirsin.</div>'
      + '<button class="btn ghost sm" onclick="Price19.toggle()">🛍️ Başka nerede satılıyor?</button></div>';
    var store = document.getElementById('store19');
    if(!store){
      store = document.createElement('div');
      store.id = 'store19'; store.className = 'store19';
      box.appendChild(store);
    }
    store.innerHTML = this.staticHtml(name);
    store.style.display = 'none';
  },
  toggle(){
    var store = document.getElementById('store19');
    if(!store){
      var box = document.getElementById('price19');
      if(!box) return;
      store = document.createElement('div');
      store.id = 'store19'; store.className = 'store19';
      store.innerHTML = this.staticHtml(this.lastName || '');
      box.appendChild(store);
    }
    var open = store.style.display !== 'none';
    store.style.display = open ? 'none' : 'block';
  }
};

/* ---------- oyun modalı: doğru mağaza + canlı fiyat + "başka nerede" ---------- */
var _p19_gameLinks = Media.gameLinks;
Media.gameLinks = function(g){
  var base = _p19_gameLinks.call(Media, g) || '';
  /* eski Steam/Epic arama düğmelerini çıkar (yanlış platforma yolluyordu) */
  base = base.replace(/<a [^>]*store\.steampowered\.com[^>]*>.*?<\/a>/g, '')
             .replace(/<a [^>]*store\.epicgames\.com\/tr\/browse[^>]*>.*?<\/a>/g, '')
             .replace(/<a [^>]*youtube\.com\/results[^>]*>.*?<\/a>/g, '')
             .replace(/<a [^>]*google\.com\/search[^>]*>.*?<\/a>/g, '');
  var nm = String((g && (g.lq || g.n)) || '');
  var btn = ext(storeDirect(g), storeDirectLabel(g), 'primary');
  btn = btn.replace('<a ', '<a id="storeBtn19" data-store="' + (g && g.p ? g.p : 'diger') + '" ');
  return [
    btn,
    (g && g.f ? '<span class="tag ok">Ücretsiz oyun</span>' : ''),
    p19PlatTag(g),
    ext(P19_DIRECT('site:youtube.com/watch ' + nm + ' inceleme oynanış'), '🎬 İnceleme videosu', 'red'),
    ext('https://www.google.com/search?q=' + q(nm + ' sistem gereksinimleri'), '🖥️ Sistem gereksinimleri', 'ghost')
  ].filter(Boolean).join(' ') + base.replace(/<span class="tag[^"]*">[^<]*<\/span>\s*/g, '');
};

/* ---------- müzik modalı: şarkıya doğrudan git ---------- */
var _p19_musicLinks = Media.musicLinks;
Media.musicLinks = function(m){
  var a = (m && m.a) || '', s = (m && m.s) || '';
  /* üretilmiş "seçki/paket" kayıtlarında doğrudan şarkı yoktur: liste araması göster */
  if(m && m.gen){
    return [
      ext('https://open.spotify.com/search/' + q(a + ' ' + s), '🎧 Spotify\'da ara', 'green'),
      ext('https://music.youtube.com/search?q=' + q(a + ' ' + s), '▶️ YouTube Music\'te ara', 'red'),
      ext('https://www.youtube.com/results?search_query=' + q(a + ' ' + s), '🎬 YouTube\'da ara', 'red'),
      ext('https://open.spotify.com/search/' + q(s), '💽 Benzer çalma listeleri', 'ghost')
    ].join(' ');
  }
  return [
    ext(songDirect(a, s), '🎧 Spotify\'da şarkıyı aç (doğrudan)', 'green'),
    ext(songDirectYt(a, s), '▶️ YouTube\'da şarkıyı aç', 'red'),
    ext(songDirectApple(a, s), '🍎 Apple Music\'te aç', 'ghost'),
    ext('https://open.spotify.com/search/' + q(a + ' ' + s), '🔎 Spotify\'da ara (yedek)', 'ghost'),
    ext('https://open.spotify.com/search/' + q(s), '💽 Şarkıyı çalan listeler', 'ghost')
  ].join(' ');
};

/* ---------- öneriler: grup/paket yerine tek somut içerik ---------- */
function p19_candidates(kind){
  /* filtreler 67.905 öğelik havuzun tamamıyla çalışsın */
  return _p19_cand(kind) || [];
}
var _p19_cand = Media.candidates;
Media.candidates = p19_candidates;

function p19_concretize(kind, it){
  if(!it || !it.gen || !it.lq) return it;
  var arr = kind === 'games' ? GAMES : (kind === 'film' ? MOVIES : null);
  if(!arr) return it;
  var lq = String(it.lq), found = null;
  for(var i = 0; i < arr.length; i++){
    var x = arr[i];
    if(x.gen) continue;
    if(x.n === lq){ found = x; break; }
    if(!found && x.n.indexOf(lq) >= 0) found = x;
  }
  /* oyun paketlerinde: içeriğin platformu paketin platformuyla uyuşmuyorsa
     aynı tür + aynı platformdan gerçek bir oyun seç (filtre sözü bozulmasın) */
  if(kind === 'games' && found && it.p && found.p !== it.p){
    var alt = GAMES.filter(function(x){ return !x.gen && x.p === it.p && x.g === it.g; });
    if(!alt.length) alt = GAMES.filter(function(x){ return !x.gen && x.p === it.p; });
    if(alt.length) found = alt[Math.floor(Math.random() * alt.length)];
  }
  if(!found) return it;
  var out = Object.assign({}, found);
  out.fromPack = it.n;
  if(it.f && !out.f) out.f = 1;
  return out;
}
var _p19_rand = Media.rand;
Media.rand = function(kind){
  var it = _p19_rand(kind);
  if(!it || !it.gen) return it;                      /* zaten somut içerik */
  if(kind === 'city') return it;                      /* rotalar/iller somut */
  var concrete = p19_concretize(kind, it);            /* paketin işaret ettiği gerçek içerik */
  if(concrete && !concrete.gen) return concrete;
  /* paket çözülemediyse gerçek içerikten seç */
  var real = (_p19_cand(kind) || []).filter(function(x){ return !x.gen; });
  if(!real.length) return it;
  var seen = (S.prefs && S.prefs.mediaP && S.prefs.mediaP[kind]) || [];
  var key = function(x){ return x.n || (x.a + ' - ' + x.s); };
  var fresh = real.filter(function(x){ return seen.indexOf(key(x)) < 0; });
  var pool = fresh.length ? fresh : real;
  var pickIt = pool[Math.floor(Math.random() * pool.length)];
  try{ S.prefs.mediaP[kind] = [key(pickIt)].concat(seen).slice(0, 25); save(); }catch(e){}
  return pickIt;
};

/* modal açılırken paket kaydını gerçek içeriğe indir + fiyat panelini kur */
var _p19_modalHtml = Media.modalHtml;
Media.modalHtml = function(kind, it){
  if(kind === 'games' || kind === 'film') it = p19_concretize(kind, it);
  var h = _p19_modalHtml(kind, it);
  if(kind === 'games'){
    h = h.replace('<div class="btnrow mt">', '<div id="price19" class="price19 mt"><div class="tiny muted">💰 Fiyatlar yükleniyor…</div></div><div class="btnrow mt">');
    setTimeout(function(){ try{ Price19.fill(it); }catch(e){} }, 25);
  }
  return h;
};

/* günün önerileri de gerçek içerikten seçilsin */
var _p19_dailyPick = dailyPick;
dailyPick = function(arr, extra){
  if(arr === GAMES || arr === MOVIES || arr === MUSIC || arr === FOODS){
    var real = arr.filter(function(x){ return !x.gen; });
    if(real.length) return _p19_dailyPick(real, extra);
  }
  return _p19_dailyPick(arr, extra);
};
