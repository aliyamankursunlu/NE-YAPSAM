
/* =====================================================================
   BÖLÜM 19C — TL (Türkiye) fiyatları · Steam ürün sayfası · avatar poz/kombin
   1) USD fiyatların yanında güncel kur ile yaklaşık TL karşılığı
   2) "Başka nerede satılıyor?" paneline 12 mağazalık TL bölümü
   3) Steam mağaza kimliği bulununca tam ürün sayfasına (cc=tr) geçiş
   4) Avatara 4 poz, göz kırpma/nefes/el sallama animasyonları, 8 hazır kombin
   ===================================================================== */

/* ---------- 1) kur: USD → TRY (günde bir kez, çevrimdışıysa önbellek) ---------- */
var P19C_FX = {rate: null, at: 0, src: 'kur', busy: false};
function p19c_tl(usd){
  var n = parseFloat(usd);
  if(!isFinite(n) || n <= 0 || !P19C_FX.rate) return '';
  var tl = n * P19C_FX.rate;
  return (tl >= 100 ? Math.round(tl).toLocaleString('tr-TR') : tl.toFixed(2)) + ' ₺';
}
function p19c_loadFx(force){
  try{
    var c = JSON.parse(localStorage.getItem('neyapsam_fx') || 'null');
    if(c && c.rate && c.at && !force && (Date.now() - c.at) < 12 * 3600 * 1000){
      P19C_FX.rate = c.rate; P19C_FX.at = c.at; P19C_FX.src = 'kur (önbellek)';
      return Promise.resolve(c.rate);
    }
  }catch(e){}
  if(P19C_FX.busy) return Promise.resolve(P19C_FX.rate);
  P19C_FX.busy = true;
  return fetch('https://open.er-api.com/v6/latest/USD', {cache: 'no-store'})
    .then(function(r){ return r.json(); })
    .then(function(j){
      var rate = j && j.rates && j.rates.TRY;
      if(rate){
        P19C_FX.rate = rate; P19C_FX.at = Date.now(); P19C_FX.src = 'kur';
        try{ localStorage.setItem('neyapsam_fx', JSON.stringify({rate: rate, at: P19C_FX.at})); }catch(e){}
      }
      P19C_FX.busy = false;
      return P19C_FX.rate;
    })
    .catch(function(){ P19C_FX.busy = false; return P19C_FX.rate; });
}
try{ p19c_loadFx().then(function(){ try{ p19c_tl_refresh(); }catch(e){} }); }catch(e){}

/* ---------- 2) Steam mağaza kimliği ---------- */
window.P19C_APPID = {};
var _p19c_lookup = Price19.lookup;
Price19.lookup = function(title){
  var nm = String(title || '');
  return _p19c_lookup.call(Price19, nm).then(function(res){
    if(res && res.steamAppID){ window.P19C_APPID[Price19.norm(nm)] = res.steamAppID; p19c_steamBtn(nm, res.steamAppID); }
    if(res && res.cheapest) p19c_tl_refresh();
    return res;
  });
};
/* Steam oyunuysa ve ürün kimliği bulunduysa birincil düğmeyi tam sayfaya çevir */
function p19c_steamBtn(name, appid){
  var m = Media.last && Media.last.games;
  if(!m || (m.p !== 'steam')) return;
  var mn = (m.lq || m.n || '');
  if(Price19.norm(mn) !== Price19.norm(name)) return;
  var a = document.getElementById('storeBtn19') || document.querySelector('#modal a[data-store]');
  if(!a) return;
  a.href = 'https://store.steampowered.com/app/' + appid + '/?cc=tr&l=turkish';
  a.textContent = '▶️ Steam sayfasını aç (ürün · TL)';
  a.title = 'Doğrudan Steam ürün sayfası, Türkiye fiyatıyla';
}

/* ---------- 3) TL karşılığını modal satırına işle ---------- */
function p19c_tl_refresh(){
  var box = document.getElementById('price19');
  if(!box || !P19C_FX.rate) return;
  var row = box.querySelector('.p19c-tl');
  var usd = box.getAttribute('data-usd');
  if(!usd) return;
  var txt = '≈ <b>' + p19c_tl(usd) + '</b> <span class="tiny muted">(USD × ' + P19C_FX.rate.toFixed(2) + ' kur ile yaklaşık) · kur tarihi: ' + new Date(P19C_FX.at).toLocaleString('tr-TR') + '</span>';
  if(row){ row.innerHTML = txt; }
  else{
    row = document.createElement('div');
    row.className = 'p19c-tl tiny mt';
    row.innerHTML = txt;
    var anchor = box.querySelector('.tiny.muted.mt');
    if(anchor && anchor.parentNode === box) box.insertBefore(row, anchor); else box.appendChild(row);
  }
}
var _p19c_dealsHtml = Price19.dealsHtml;
Price19.dealsHtml = function(res){
  var h = _p19c_dealsHtml.call(Price19, res);
  var cheap = (res.deals && res.deals[0]) || {price: res.cheapest};
  var usd = parseFloat(cheap.price);
  if(isFinite(usd) && usd > 0){
    var box = document.getElementById('price19');
    if(box) box.setAttribute('data-usd', usd);
    setTimeout(function(){ p19c_tl_refresh(); }, 0);
  }
  return h;
};

/* ---------- 4) Türkiye (TL) mağazaları ---------- */
var P19C_TR = [
  ['Steam (TL)', function(n, id){ return id ? 'https://store.steampowered.com/app/' + id + '/?cc=tr&l=turkish' : 'https://store.steampowered.com/search/?cc=tr&l=turkish&term=' + q(n); }],
  ['Epic Games (TL)', function(n){ return 'https://store.epicgames.com/tr/browse?q=' + q(n); }],
  ['PlayStation Store TR', function(n){ return 'https://store.playstation.com/tr-tr/search/' + q(n); }],
  ['Xbox TR', function(n){ return 'https://www.xbox.com/tr-TR/search?q=' + q(n); }],
  ['Microsoft Store TR', function(n){ return 'https://www.microsoft.com/tr-tr/search/shop/games?q=' + q(n); }],
  ['Google Play (TR)', function(n){ return 'https://play.google.com/store/search?q=' + q(n) + '&c=apps&gl=TR'; }],
  ['DurmaPlay', function(n){ return 'https://www.durmaplay.com/arama?q=' + q(n); }],
  ['Voidu', function(n){ return 'https://www.voidu.com/tr/search?q=' + q(n); }],
  ['Playstore', function(n){ return 'https://www.playstore.com/arama?q=' + q(n); }],
  ['Trendyol', function(n){ return 'https://www.trendyol.com/s?q=' + q(n) + '+oyun'; }],
  ['Hepsiburada', function(n){ return 'https://www.hepsiburada.com/ara?q=' + q(n) + '+oyun'; }],
  ['n11', function(n){ return 'https://www.n11.com/arama?q=' + q(n) + '+oyun'; }]
];
var _p19c_static = Price19.staticHtml;
Price19.staticHtml = function(name){
  var id = window.P19C_APPID[Price19.norm(name)] || '';
  var rows = P19C_TR.map(function(st){
    return '<div class="lr"><span>🇹🇷</span><div class="grow"><div class="t">' + esc(st[0]) + '</div></div>'
      + '<div class="a">' + ext(st[1](name, id), 'Ara', 'ghost') + '</div></div>';
  }).join('');
  var trBlock = '<div class="row between mt2"><b>🇹🇷 Türkiye\'den TL fiyatlar</b><span class="tiny muted">' + P19C_TR.length + ' mağaza</span></div>'
    + '<div class="list">' + rows + '</div>'
    + '<div class="tiny muted mt">TL fiyatlar mağaza sayfasında kesinleşir'
    + (P19C_FX.rate ? '; yukarıdaki ≈ karşılık güncel kur ile hesaplandı (' + P19C_FX.rate.toFixed(2) + ' ₺/USD).' : '.') + '</div>';
  /* uluslararası listeden önce TL bölümü gelsin */
  return _p19c_static.call(Price19, name).replace('<div class="row between mt2"><b>🛍️ Başka nerede satılıyor?</b>', trBlock + '<div class="row between mt2"><b>🌍 Uluslararası mağazalar (USD)</b>');
};

/* ---------- 5) avatar: animasyon stilleri ---------- */
(function(){
  var st = document.createElement('style');
  st.textContent = [
    '@keyframes avBlink{0%,93%,100%{transform:scaleY(0)}95%,97%{transform:scaleY(1)}}',
    '@keyframes avBreathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.015) translateY(-1px)}}',
    '@keyframes avWave{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(11deg)}}',
    '@keyframes avBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}',
    '.av-lid{transform-box:fill-box;transform-origin:top center;transform:scaleY(0);animation:avBlink 5.2s infinite ease-in-out}',
    '.av-lid:nth-child(2){animation-delay:.06s}',
    '.av-breathe{transform-box:fill-box;transform-origin:bottom center;animation:avBreathe 4.4s ease-in-out infinite}',
    '.av-wave{transform-box:fill-box;transform-origin:22% 88%;animation:avWave 1.15s ease-in-out infinite}',
    '.av-pet{transform-box:fill-box;transform-origin:bottom center;animation:avBob 2.4s ease-in-out infinite}',
    '@media (prefers-reduced-motion: reduce){.av-lid,.av-breathe,.av-wave,.av-pet{animation:none}}'
  ].join('\n');
  document.head.appendChild(st);
})();

/* ---------- 6) pozlar & hazır kombinler ---------- */
var P19C_POSES = [['ayakta', '🧍 Ayakta'], ['sallama', '👋 El sallama'], ['zafer', '🙌 Zafer'], ['oturma', '🪑 Rahat']];
/* NOT: uygulama durumu (S) en sonda başlatılır; bu yüzden ilk ayarlar boot kancasında yapılır */
function p19c_boot(){
  try{
    if(!S.user) S.user = {};
    if(S.user.anim === undefined) S.user.anim = true;
    if(!S.user.pose) S.user.pose = 'ayakta';
  }catch(e){}
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', p19c_boot);
setTimeout(p19c_boot, 0);

var P19C_LOOKS = [
  {id: 'buyucu',   n: '🧙 Büyücü',        it: {hat: 'hat_buyucu',  glass: 'glass_monokl',    outfit: 'out_uzay',    hair: 'hair_dalgali',  bg: 'bg_uzay',      pet: 'pet_dino',  look: 1}},
  {id: 'kraliyet', n: '👑 Kraliyet',      it: {hat: 'hat_tac',     glass: 'glass_none',      outfit: 'out_zirh',    hair: 'hair_uzun',     bg: 'bg_sakura',    pet: 'pet_kedi',  look: 1}},
  {id: 'oyuncu',   n: '🎮 Oyuncu Gecesi', it: {hat: 'hat_kulaklik',glass: 'glass_gunes',     outfit: 'out_hoodie',  hair: 'hair_kisa',     bg: 'bg_neon',      pet: 'pet_robot', look: 1}},
  {id: 'ogrenci',  n: '🎓 Öğrenci',       it: {hat: 'hat_kep',     glass: 'glass_yuvarlak',  outfit: 'out_default', hair: 'hair_kisa',     bg: 'bg_default',   pet: 'pet_none',  look: 1}},
  {id: 'kis',      n: '❄️ Kış',           it: {hat: 'hat_bere',    glass: 'glass_none',      outfit: 'out_ceket',   hair: 'hair_dalgali',  bg: 'bg_kar',       pet: 'pet_kopek', look: 1}},
  {id: 'yaz',      n: '🏝️ Yaz',           it: {hat: 'hat_hasir',   glass: 'glass_gunes',     outfit: 'out_denizci', hair: 'hair_uzun',     bg: 'bg_kumsal',    pet: 'pet_kus',   look: 1}},
  {id: 'uzay',     n: '🚀 Uzay',          it: {hat: 'hat_none',    glass: 'glass_dikdortgen',outfit: 'out_uzay',    hair: 'hair_kisa',     bg: 'bg_uzay',      pet: 'pet_robot', look: 1}},
  {id: 'parti',    n: '🥳 Parti',         it: {hat: 'hat_parti',   glass: 'glass_gunes',     outfit: 'out_kirmizi', hair: 'hair_kivircik', bg: 'bg_gunbatimi', pet: 'pet_kedi',  look: 1}}
];
Shop.applyLook = function(id){
  var L = null; P19C_LOOKS.forEach(function(x){ if(x.id === id) L = x; });
  if(!L) return;
  var need = [], cost = 0;
  Object.keys(L.it).forEach(function(cat){
    var iid = L.it[cat], item = findItem(cat, iid);
    if(!item) return;
    if(S.owned.indexOf(iid) < 0 && item.pr > 0){ need.push([cat, iid, item]); cost += item.pr; }
  });
  if(need.length && S.points < cost){
    toast('🪙', 'Yetersiz puan', 'Kombin için <b>' + need.length + '</b> parça eksik: <b>' + cost + '</b> puan gerekiyor, sende <b>' + S.points + '</b> var.', 'warn', 5200);
    return;
  }
  if(need.length){
    S.points -= cost;
    need.forEach(function(x){ S.owned.push(x[1]); });
  }
  Object.keys(L.it).forEach(function(cat){ S.equipped[cat] = L.it[cat]; });
  save();
  if(need.length){ try{ sfx.coin(); confetti(45); }catch(e){} }
  toast('👗', 'Kombin giyildi', '<b>' + L.n + '</b>' + (cost ? ' · ' + need.length + ' yeni parça alındı (-' + cost + ' puan)' : ' · tüm parçalar zaten sende'), 'good', 4200);
  App.repaintCurrent();
};
Shop.setPose = function(p){ S.user.pose = p; save(); App.repaintCurrent(); toast('🧍', 'Poz değişti', P19C_POSES.filter(function(x){ return x[0] === p; })[0][1], 'good', 1800); };
Shop.toggleAnim = function(){ S.user.anim = !(S.user.anim !== false); save(); App.repaintCurrent();
  toast('✨', 'Animasyon ' + (S.user.anim ? 'açık' : 'kapalı'), S.user.anim ? 'Göz kırpma, nefes ve el sallama aktif.' : 'Hareketler durduruldu.', 'good', 2200); };

/* avatar görünümüne poz/kombin bölümünü ekle */
var _p19c_avatar = VIEWS.avatar;
VIEWS.avatar = function(){
  var h = _p19c_avatar();
  var ui = '<div class="card mt2"><h3>✨ Poz ve hazır kombinler</h3>'
    + '<div class="row between" style="gap:10px;flex-wrap:wrap">'
    +   '<div><div class="tiny muted">Poz</div><div class="chips">' + P19C_POSES.map(function(p){
          return '<span class="chip ' + (S.user.pose === p[0] ? 'on' : '') + '" onclick="Shop.setPose(\'' + p19q(p[0]) + '\')">' + p[1] + '</span>';
        }).join('') + '</div></div>'
    +   '<button class="btn ' + ((S.user.anim !== false) ? 'green' : 'ghost') + ' sm" onclick="Shop.toggleAnim()">✨ Animasyon: ' + ((S.user.anim !== false) ? 'açık' : 'kapalı') + '</button>'
    + '</div>'
    + '<div class="tiny muted mt">Hazır kombin: eksik parçalar varsa puanından düşülür ve hepsi birlikte giydirilir.</div>'
    + '<div class="chips mt">' + P19C_LOOKS.map(function(l){
        return '<span class="chip" style="padding:7px 12px" onclick="Shop.applyLook(\'' + p19q(l.id) + '\')">' + l.n + '</span>';
      }).join('') + '</div></div>';
  return h.replace('<div class="card mt2"><h3>🏅 Başarımlar', ui + '<div class="card mt2"><h3>🏅 Başarımlar');
};

