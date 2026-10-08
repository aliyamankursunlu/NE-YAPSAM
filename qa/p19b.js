/* inline handler'larda çift tırnak HTML niteliğini erken kapatır:
   dizeleri tek tırnakla ve kaçışlı yazmak zorundayız */
function p19q(s){ return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }

/* =====================================================================
   BÖLÜM 19B — AVATAR & MAĞAZA YENİDEN TASARIM (tur 6)
   Emoji yerine tamamen çizim (SVG): şapka, gözlük, kıyafet, saç, evcil
   hayvan ve arka planlar avatara gerçekten giydiriliyor.
   ===================================================================== */

/* ---------- yardımcılar ---------- */
function p19_shade(hex, amt){
  try{
    var c = String(hex).replace('#', '');
    if(c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    var n = parseInt(c, 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function f(v){ var x = Math.round(v + 255 * amt); return Math.max(0, Math.min(255, x)); }
    return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }catch(e){ return hex; }
}
var P19_SKINS = ['#f9dcc0', '#eec49d', '#d9a273', '#bd8154', '#8d5a35', '#5f3c26'];
var P19_HAIRCOLORS = ['#241a12', '#4b3427', '#7a5230', '#c19a3f', '#b5651d', '#8b3a3a', '#5b6cff', '#2dd4bf', '#e5e7eb'];
var P19_EYECOLORS = ['#3b82f6', '#22c55e', '#a16207', '#7c3aed', '#0ea5e9', '#475569'];
function p19_skinCol(){ return P19_SKINS[Math.min(5, Math.max(0, (S.user.skin || 2) - 1))] || P19_SKINS[1]; }
function p19_hairCol(){ return S.user.hair || '#4b3427'; }
function p19_eyeCol(){ return S.user.eye || '#3b82f6'; }

/* ---------- YENİ KOZMETİK İÇERİK ---------- */
COSMETICS.hair = [
  {id:'hair_kisa',      n:'Kısa',          st:'kisa',      pr:0,   d:'Sade ve temiz kısa kesim.'},
  {id:'hair_uzun',      n:'Uzun',          st:'uzun',      pr:40,  d:'Omuzlara dökülen uzun saç.'},
  {id:'hair_topuz',     n:'Topuz',         st:'topuz',     pr:40,  d:'Toplanmış pratik topuz.'},
  {id:'hair_dalgali',   n:'Dalgalı',       st:'dalgali',   pr:70,  d:'Yumuşak dalgalı model.'},
  {id:'hair_kivircik',  n:'Kıvırcık',      st:'kivircik',  pr:80,  d:'Hacimli kıvırcık bukleler.'},
  {id:'hair_atkuyrugu', n:'At Kuyruğu',    st:'atkuyrugu', pr:90,  d:'Yandan bağlı at kuyruğu.'},
  {id:'hair_afro',      n:'Afro',          st:'afro',      pr:110, d:'Yuvarlak, hacimli afro.'},
  {id:'hair_kel',       n:'Kel',           st:'kel',       pr:15,  d:'Kel; hafif sakal gölgesi.'}
];
COSMETICS.hat = [
  {id:'hat_none',     n:'Şapka Yok',   sc:'none',    pr:0,   d:'Açık baş.'},
  {id:'hat_kep',      n:'Kep',         sc:'kep',     pr:60,  d:'Öne siperliği olan spor kep.'},
  {id:'hat_bere',     n:'Bere',        sc:'bere',    pr:80,  d:'Ponponlu sıcak bere.'},
  {id:'hat_hasir',    n:'Hasır Şapka', sc:'hasir',   pr:120, d:'Yazlık geniş kenarlı hasır.'},
  {id:'hat_silindir', n:'Silindir',    sc:'silindir',pr:180, d:'Kırmızı kurdeleli silindir şapka.'},
  {id:'hat_tac',      n:'Altın Taç',   sc:'tac',     pr:520, d:'Mücevherli krallık tacı.'},
  {id:'hat_buyucu',   n:'Büyücü Şapkası', sc:'buyucu', pr:300, d:'Yıldızlı, ucu kıvrık büyücü şapkası.'},
  {id:'hat_parti',    n:'Parti Şapkası',  sc:'parti',  pr:140, d:'Renkli konik parti şapkası.'},
  {id:'hat_kulaklik', n:'Kulaklık',    sc:'kulaklik', pr:220, d:'Kablosuz oyuncu kulaklığı.'}
];
COSMETICS.glass = [
  {id:'glass_none',  n:'Gözlük Yok',       sc:'none',    pr:0,   d:'Çıplak gözler.'},
  {id:'glass_yuvarlak', n:'Yuvarlak Gözlük', sc:'yuvarlak', pr:70, d:'İnce çerçeveli yuvarlak gözlük.'},
  {id:'glass_dikdortgen', n:'Kare Gözlük',  sc:'dikdortgen', pr:90, d:'Modern kare çerçeve.'},
  {id:'glass_gunes', n:'Güneş Gözlüğü',    sc:'gunes',   pr:150, d:'Koyu camlı güneş gözlüğü.'},
  {id:'glass_monokl', n:'Monokl',          sc:'monokl',  pr:260, d:'Zincirli tek göz camı.'}
];
COSMETICS.pet = [
  {id:'pet_none', n:'Evcil Yok',  sc:'none', pr:0,   d:'Yalnız takıl.'},
  {id:'pet_kedi', n:'Tekir Kedi', sc:'kedi', pr:170, d:'Yanında oturan sevimli tekir.'},
  {id:'pet_kopek', n:'Köpek',     sc:'kopek',pr:170, d:'Kulakları sarkık sadık dost.'},
  {id:'pet_kus',  n:'Muhabbet Kuşu', sc:'kus', pr:200, d:'Omzuna konan renkli kuş.'},
  {id:'pet_dino', n:'Mini Dinozor', sc:'dino', pr:320, d:'Küçük ama iddialı bir arkadaş.'},
  {id:'pet_robot',n:'Mini Robot', sc:'robot',pr:420, d:'Işıklı gözlü yardımcı robot.'}
];
COSMETICS.outfit = [
  {id:'out_default', n:'Mor Tişört',    sc:'tee',    c:'#7c5cff', pr:0,   d:'Klasik mor tişört.'},
  {id:'out_mavi',    n:'Mavi Tişört',   sc:'tee',    c:'#3b82f6', pr:40,  d:'Deniz mavisi tişört.'},
  {id:'out_yesil',   n:'Yeşil Tişört',  sc:'tee',    c:'#22c55e', pr:40,  d:'Canlı yeşil tişört.'},
  {id:'out_kirmizi', n:'Kırmızı Sweat', sc:'hoodie', c:'#ef4444', pr:120, d:'Kapüşonlu kırmızı sweatshirt.'},
  {id:'out_hoodie',  n:'Kapüşonlu',     sc:'hoodie', c:'#f59e0b', pr:90,  d:'Cebi ve kapüşonu olan hoodie.'},
  {id:'out_gomlek',  n:'Gömlek',        sc:'shirt',  c:'#e2e8f0', pr:110, d:'Düğmeli, yakalı gömlek.'},
  {id:'out_ceket',   n:'Siyah Ceket',   sc:'jacket', c:'#1f2937', pr:160, d:'Fermuarlı deri ceket.'},
  {id:'out_denizci', n:'Denizci Çizgili', sc:'stripes', c:'#0ea5e9', pr:190, d:'Mavi-beyaz çizgili denizci üstü.'},
  {id:'out_uzay',    n:'Uzay Tulumu',   sc:'suit',   c:'#64748b', pr:380, d:'Göğüs paneli olan uzay tulumu.'},
  {id:'out_zirh',    n:'Altın Zırh',    sc:'armor',  c:'#fbbf24', pr:620, d:'Omuzluklu efsanevi zırh.'}
];
COSMETICS.bg = [
  {id:'bg_default',   n:'Mor Sis',      pr:0,   css:'radial-gradient(120% 90% at 50% 10%,#4c1d95 0%,#1b1035 55%,#0b0d17 100%)'},
  {id:'bg_orman',     n:'Orman',        pr:120, css:'linear-gradient(180deg,#0b3d2e 0%,#0e2a22 55%,#08170f 100%)'},
  {id:'bg_deniz',     n:'Deniz',        pr:120, css:'linear-gradient(180deg,#0e7490 0%,#0b3b52 50%,#0a1c2e 100%)'},
  {id:'bg_sehir',     n:'Gece Şehri',   pr:160, css:'linear-gradient(180deg,#312e81 0%,#1e1b4b 45%,#0f172a 100%)'},
  {id:'bg_kar',       n:'Karlı Dağ',    pr:140, css:'linear-gradient(180deg,#bae6fd 0%,#64748b 45%,#1e293b 100%)'},
  {id:'bg_uzay',      n:'Uzay',         pr:260, css:'radial-gradient(100% 80% at 70% 20%,#3b1a6b 0%,#120b2e 55%,#05050f 100%)'},
  {id:'bg_sakura',    n:'Sakura',       pr:240, css:'linear-gradient(180deg,#831843 0%,#4a1f3a 50%,#1b1030 100%)'},
  {id:'bg_neon',      n:'Neon',         pr:280, css:'linear-gradient(140deg,#062a35 0%,#0f172a 50%,#2a0b3d 100%)'},
  {id:'bg_gunbatimi', n:'Gün Batımı',   pr:200, css:'linear-gradient(180deg,#fb7185 0%,#c2410c 45%,#312e81 100%)'},
  {id:'bg_kumsal',    n:'Kumsal',       pr:170, css:'linear-gradient(180deg,#38bdf8 0%,#67e8f9 40%,#fde68a 100%)'}
];

/* ---------- SVG avatar ---------- */
function p19_hairBack(style, col){
  var dark = p19_shade(col, -0.12);
  if(style === 'uzun') return '<path d="M52 86 q0 -50 48 -50 q48 0 48 50 l0 84 q-8 12 -22 12 l0 -66 q0 -16 -26 -16 q-26 0 -26 16 l0 66 q-14 0 -22 -12 z" fill="' + col + '"/>';
  if(style === 'dalgali') return '<path d="M50 88 q0 -54 50 -54 q50 0 50 54 q0 34 -6 58 q-8 -14 -6 -40 q-2 -26 -38 -26 q-36 0 -38 26 q2 26 -6 40 q-6 -24 -6 -58 z" fill="' + col + '"/>';
  if(style === 'topuz') return '<path d="M54 84 q0 -48 46 -48 q46 0 46 48 l0 18 q-10 -18 -46 -18 q-36 0 -46 18 z" fill="' + col + '"/><circle cx="100" cy="26" r="16" fill="' + dark + '"/>';
  if(style === 'atkuyrugu') return '<path d="M52 84 q0 -48 48 -48 q48 0 48 48 l0 20 q-12 -20 -48 -20 q-36 0 -48 20 z" fill="' + col + '"/><path d="M148 62 q30 10 26 46 q-3 26 -18 36 q4 -34 -14 -54 z" fill="' + col + '"/>';
  if(style === 'kivircik') return '<circle cx="100" cy="58" r="48" fill="' + col + '"/><circle cx="58" cy="70" r="20" fill="' + col + '"/><circle cx="142" cy="70" r="20" fill="' + col + '"/>';
  if(style === 'afro') return '<circle cx="100" cy="56" r="54" fill="' + col + '"/><circle cx="52" cy="66" r="22" fill="' + col + '"/><circle cx="148" cy="66" r="22" fill="' + col + '"/>';
  return '';
}
function p19_hairFront(style, col){
  var cap = '<path d="M54 88 q0 -50 46 -50 q46 0 46 50 q-8 -26 -46 -26 q-38 0 -46 26 z" fill="' + col + '"/>';
  if(style === 'kel') return '<path d="M62 84 q10 -20 38 -20 q22 0 32 10" stroke="' + col + '" stroke-width="6" fill="none" stroke-linecap="round" opacity=".22"/>';
  if(style === 'kisa') return cap + '<path d="M122 44 q16 8 16 24 q-10 -14 -22 -14 z" fill="' + col + '"/>';
  if(style === 'uzun') return cap + '<path d="M54 88 q-4 34 4 58 q-12 -4 -14 -30 q-2 -20 10 -28 z" fill="' + col + '"/><path d="M146 88 q4 34 -4 58 q12 -4 14 -30 q2 -20 -10 -28 z" fill="' + col + '"/>';
  if(style === 'dalgali') return '<path d="M54 88 q0 -50 46 -50 q46 0 46 50 q-6 12 -16 4 q-6 12 -16 2 q-8 10 -16 0 q-10 8 -18 -2 q-10 10 -16 -6 z" fill="' + col + '"/>';
  if(style === 'topuz') return cap + '<path d="M62 34 q38 -14 76 0" stroke="' + p19_shade(col, -0.2) + '" stroke-width="4" fill="none"/>';
  if(style === 'atkuyrugu') return cap + '<circle cx="146" cy="62" r="6" fill="' + p19_shade(col, -0.25) + '"/>';
  if(style === 'kivircik'){
    var b = ''; for(var i = 0; i < 7; i++){ b += '<circle cx="' + (60 + i * 13) + '" cy="' + (58 + (i % 2 ? -5 : 2)) + '" r="11" fill="' + col + '"/>'; }
    return b;
  }
  if(style === 'afro') return '<path d="M56 78 q6 -30 44 -30 q38 0 44 30 q-16 -14 -44 -14 q-28 0 -44 14 z" fill="' + p19_shade(col, 0.06) + '"/>';
  return cap;
}
function p19_hat(sc){
  if(sc === 'kep') return '<path d="M52 64 q4 -42 48 -42 q44 0 48 42 z" fill="#2563eb"/><path d="M46 64 q54 16 108 0 q-4 15 -54 15 q-50 0 -54 -15 z" fill="#1d4ed8"/><circle cx="100" cy="22" r="5" fill="#60a5fa"/>';
  if(sc === 'bere') return '<path d="M56 60 q4 -38 44 -38 q40 0 44 38 z" fill="#ef4444"/><path d="M54 58 q46 13 92 0 q-2 13 -46 13 q-44 0 -46 -13 z" fill="#b91c1c"/><circle cx="100" cy="18" r="9" fill="#fca5a5"/>';
  if(sc === 'hasir') return '<ellipse cx="100" cy="64" rx="64" ry="12" fill="#e8c07d"/><path d="M62 64 q6 -36 38 -36 q32 0 38 36 z" fill="#f2d9a6"/><path d="M60 62 q40 11 80 0 l0 7 q-40 11 -80 0 z" fill="#c08a3e"/><circle cx="132" cy="58" r="5" fill="#f472b6"/>';
  if(sc === 'silindir') return '<path d="M64 24 h72 v40 h-72 z" fill="#1f2937"/><path d="M64 42 h72 v9 h-72 z" fill="#dc2626"/><ellipse cx="100" cy="66" rx="58" ry="10" fill="#111827"/><path d="M64 24 h72 v6 h-72 z" fill="#374151"/>';
  if(sc === 'tac') return '<path d="M62 62 v-26 l13 13 l13 -19 l12 19 l12 -19 l13 19 l13 -13 v26 z" fill="#fbbf24" stroke="#d97706" stroke-width="2"/><circle cx="75" cy="52" r="3" fill="#ef4444"/><circle cx="100" cy="44" r="3.4" fill="#3b82f6"/><circle cx="125" cy="52" r="3" fill="#22c55e"/>';
  if(sc === 'buyucu') return '<path d="M100 4 q18 26 28 60 q-28 11 -56 0 q10 -34 28 -60 z" fill="#6d28d9"/><path d="M84 34 q16 8 32 3" stroke="#c4b5fd" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="100" cy="64" rx="60" ry="11" fill="#5b21b6"/><circle cx="136" cy="18" r="3.4" fill="#fde68a"/><circle cx="70" cy="30" r="2.6" fill="#fde68a"/><circle cx="112" cy="46" r="2.2" fill="#fde68a"/>';
  if(sc === 'parti') return '<path d="M100 12 l24 50 h-48 z" fill="#f472b6"/><path d="M86 44 l30 -9" stroke="#fff" stroke-width="4" opacity=".75"/><path d="M82 54 l38 -11" stroke="#fff" stroke-width="4" opacity=".55"/><circle cx="100" cy="10" r="6" fill="#facc15"/>';
  if(sc === 'kulaklik') return '<path d="M50 74 q0 -56 50 -56 q50 0 50 56" stroke="#0ea5e9" stroke-width="10" fill="none" stroke-linecap="round"/><rect x="36" y="58" width="26" height="38" rx="13" fill="#0ea5e9"/><rect x="138" y="58" width="26" height="38" rx="13" fill="#0ea5e9"/><rect x="43" y="65" width="12" height="24" rx="6" fill="#22d3ee"/><rect x="145" y="65" width="12" height="24" rx="6" fill="#22d3ee"/>';
  return '';
}
function p19_glasses(sc){
  if(sc === 'yuvarlak') return '<g fill="rgba(190,220,255,.22)" stroke="#1f2937" stroke-width="3.4"><circle cx="82" cy="92" r="15"/><circle cx="118" cy="92" r="15"/></g><path d="M97 92 h6 M67 89 l-11 -3 M133 89 l11 -3" stroke="#1f2937" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M74 86 q6 -4 12 0" stroke="#fff" stroke-width="2" fill="none" opacity=".55"/>';
  if(sc === 'dikdortgen') return '<g fill="rgba(190,220,255,.2)" stroke="#111827" stroke-width="3.4"><rect x="62" y="80" width="36" height="26" rx="7"/><rect x="102" y="80" width="36" height="26" rx="7"/></g><path d="M98 92 h4 M62 90 l-8 -2 M138 90 l8 -2" stroke="#111827" stroke-width="3.2" fill="none" stroke-linecap="round"/>';
  if(sc === 'gunes') return '<g fill="#0b1220" fill-opacity=".88" stroke="#111827" stroke-width="3.2"><rect x="60" y="80" width="38" height="24" rx="8"/><rect x="102" y="80" width="38" height="24" rx="8"/></g><path d="M65 86 l10 -4 M108 86 l10 -4" stroke="rgba(255,255,255,.45)" stroke-width="2.4" stroke-linecap="round"/><path d="M98 90 h4 M60 89 l-8 -2 M140 89 l8 -2" stroke="#111827" stroke-width="3.2" fill="none" stroke-linecap="round"/>';
  if(sc === 'monokl') return '<circle cx="118" cy="92" r="16" fill="rgba(200,225,255,.26)" stroke="#eab308" stroke-width="3.4"/><path d="M133 102 q12 20 5 40" stroke="#eab308" stroke-width="2.2" fill="none"/><path d="M110 86 q6 -4 12 0" stroke="#fff" stroke-width="2" fill="none" opacity=".5"/>';
  return '';
}
function p19_pet(sc){
  if(sc === 'kedi') return '<ellipse cx="162" cy="204" rx="16" ry="14" fill="#f59e0b"/><circle cx="154" cy="184" r="12" fill="#fbbf24"/><path d="M145 176 l-3 -13 l11 6 z" fill="#f59e0b"/><path d="M163 176 l3 -13 l-11 6 z" fill="#f59e0b"/><circle cx="150" cy="183" r="1.9" fill="#1f2937"/><circle cx="158" cy="183" r="1.9" fill="#1f2937"/><path d="M151 189 q3 3 6 0" stroke="#78350f" stroke-width="1.5" fill="none"/><path d="M176 202 q14 -2 10 -18" stroke="#f59e0b" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M142 186 l-8 -3 M142 189 l-8 1 M166 186 l8 -3 M166 189 l8 1" stroke="#fde68a" stroke-width="1.2"/>';
  if(sc === 'kopek') return '<ellipse cx="162" cy="206" rx="16" ry="13" fill="#c08457"/><circle cx="154" cy="186" r="12" fill="#d4a373"/><ellipse cx="143" cy="186" rx="6" ry="11" fill="#a97138" transform="rotate(-16 143 186)"/><ellipse cx="165" cy="186" rx="6" ry="11" fill="#a97138" transform="rotate(16 165 186)"/><ellipse cx="154" cy="193" rx="8" ry="6" fill="#f3e0c7"/><circle cx="154" cy="191" r="2.7" fill="#1f2937"/><path d="M152 197 q2 4 4 0" stroke="#ef4444" stroke-width="2.2" fill="none"/><circle cx="150" cy="183" r="1.8" fill="#1f2937"/><circle cx="158" cy="183" r="1.8" fill="#1f2937"/>';
  if(sc === 'kus') return '<ellipse cx="160" cy="200" rx="14" ry="12" fill="#38bdf8"/><circle cx="152" cy="184" r="9" fill="#60a5fa"/><path d="M143 183 l-8 3 l8 3 z" fill="#f59e0b"/><circle cx="151" cy="182" r="1.7" fill="#0f172a"/><path d="M168 196 q14 6 8 16" stroke="#0ea5e9" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M154 212 v6 M162 212 v6" stroke="#f59e0b" stroke-width="2"/>';
  if(sc === 'dino') return '<path d="M148 214 q-5 -24 14 -24 q19 0 14 24 z" fill="#34d399"/><circle cx="156" cy="186" r="10" fill="#4ade80"/><path d="M150 176 l3 -8 l4 7 M160 176 l3 -8 l4 7" fill="#059669"/><circle cx="153" cy="185" r="1.8" fill="#065f46"/><path d="M144 200 q-14 -6 -10 -18" stroke="#34d399" stroke-width="6" fill="none" stroke-linecap="round"/>';
  if(sc === 'robot') return '<rect x="146" y="176" width="24" height="20" rx="6" fill="#cbd5e1"/><rect x="150" y="182" width="16" height="7" rx="3" fill="#0f172a"/><circle cx="155" cy="185.5" r="2" fill="#22d3ee"/><circle cx="162" cy="185.5" r="2" fill="#22d3ee"/><path d="M158 176 v-8" stroke="#94a3b8" stroke-width="2"/><circle cx="158" cy="165" r="3.2" fill="#f87171"/><rect x="150" y="198" width="16" height="16" rx="5" fill="#94a3b8"/>';
  return '';
}
function p19_outfit(sc, c){
  var d = p19_shade(c, -0.16), l = p19_shade(c, 0.1);
  var body = '<path d="M42 230 q2 -62 58 -62 q56 0 58 62 z" fill="' + c + '"/>';
  if(sc === 'tee') return body + '<path d="M84 172 q16 16 32 0 q-4 12 -16 12 q-12 0 -16 -12 z" fill="' + d + '"/>';
  if(sc === 'hoodie') return body + '<path d="M74 170 q26 24 52 0 q-6 20 -26 20 q-20 0 -26 -20 z" fill="' + d + '"/><path d="M86 200 h28" stroke="' + d + '" stroke-width="4"/><path d="M78 214 q22 12 44 0" stroke="' + d + '" stroke-width="3" fill="none"/>';
  if(sc === 'shirt') return body + '<path d="M86 170 l14 16 l14 -16 q10 6 12 16 q-26 12 -52 0 q2 -10 12 -16 z" fill="#ffffff" opacity=".92"/><circle cx="100" cy="204" r="2.4" fill="#94a3b8"/><circle cx="100" cy="216" r="2.4" fill="#94a3b8"/><path d="M100 186 v44" stroke="' + d + '" stroke-width="1.6" opacity=".6"/>';
  if(sc === 'jacket') return body + '<path d="M84 170 q16 14 32 0 l6 10 q-22 12 -44 0 z" fill="' + d + '"/><path d="M100 184 v46" stroke="#94a3b8" stroke-width="3"/><path d="M70 196 h12 M118 196 h12" stroke="' + d + '" stroke-width="3"/>';
  if(sc === 'stripes'){
    var st = ''; for(var i = 0; i < 5; i++){ st += '<rect x="42" y="' + (176 + i * 11) + '" width="116" height="5.5" fill="#ffffff" opacity=".85"/>'; }
    return body + st + '<path d="M84 172 q16 16 32 0 q-4 12 -16 12 q-12 0 -16 -12 z" fill="#ffffff" opacity=".55"/>';
  }
  if(sc === 'suit') return body + '<rect x="74" y="186" width="52" height="26" rx="6" fill="#1e293b"/><circle cx="86" cy="196" r="3" fill="#22d3ee"/><circle cx="98" cy="196" r="3" fill="#f87171"/><path d="M74 202 h52" stroke="#334155" stroke-width="3"/><path d="M84 172 q16 16 32 0 q-4 12 -16 12 q-12 0 -16 -12 z" fill="#475569"/>';
  if(sc === 'armor') return body + '<ellipse cx="62" cy="184" rx="20" ry="13" fill="' + l + '"/><ellipse cx="138" cy="184" rx="20" ry="13" fill="' + l + '"/><path d="M100 174 l16 12 v22 l-16 12 l-16 -12 v-22 z" fill="' + l + '" opacity=".9"/><path d="M84 172 q16 16 32 0 q-4 12 -16 12 q-12 0 -16 -12 z" fill="' + d + '"/>';
  return body;
}
/* ---------- kollar & pozlar ---------- */
function p19_arms(sc, c, pose){
  var d = p19_shade(c, -0.16), sk = p19_skinCol();
  var L  = '<path d="M46 182 q-12 14 -8 30 q2 10 12 11 q7 1 8 -7 l2 -16 z" fill="' + d + '"/><circle cx="48" cy="226" r="8.5" fill="' + sk + '"/>';
  var R  = '<path d="M154 182 q12 14 8 30 q-2 10 -12 11 q-7 1 -8 -7 l-2 -16 z" fill="' + d + '"/><circle cx="152" cy="226" r="8.5" fill="' + sk + '"/>';
  var RU = '<path d="M157 188 q14 -24 6 -48 q-3 -10 -12 -7 q-8 3 -5 13 l7 32 z" fill="' + d + '"/><circle cx="168" cy="126" r="9" fill="' + sk + '"/>';
  var LU = '<path d="M43 188 q-14 -24 -6 -48 q3 -10 12 -7 q8 3 5 13 l-7 32 z" fill="' + d + '"/><circle cx="32" cy="126" r="9" fill="' + sk + '"/>';
  var RF = '<path d="M156 186 q12 14 -4 24 q-10 6 -20 -2 q-6 -6 0 -12 l12 -12 z" fill="' + d + '"/><circle cx="130" cy="210" r="8" fill="' + sk + '"/>';
  var LF = '<path d="M44 186 q-12 14 4 24 q10 6 20 -2 q6 -6 0 -12 l-12 -12 z" fill="' + d + '"/><circle cx="70" cy="210" r="8" fill="' + sk + '"/>';
  if(pose === 'sallama') return '<g class="av-arm-l">' + L + '</g><g class="av-arm-r av-wave">' + RU + '</g>';
  if(pose === 'zafer')   return '<g class="av-arm-l">' + LU + '</g><g class="av-arm-r">' + RU + '</g>';
  if(pose === 'oturma')  return '<g class="av-arm-l">' + LF + '</g><g class="av-arm-r">' + RF + '</g>';
  return '<g class="av-arm-l">' + L + '</g><g class="av-arm-r">' + R + '</g>';
}
function avatarSVG(size, opts){
  size = size || 200; opts = opts || {};
  var uid = 'av' + (avatarSVG._n = (avatarSVG._n || 0) + 1);
  var eq = S.equipped || {};
  function eqId(cat, def){ return (opts.forItem && opts.forItem.cat === cat) ? opts.forItem.id : (eq[cat] || (cat === 'glass' ? eq.glasses : null) || def); }
  var hair  = findItem('hair',  eqId('hair',  'hair_kisa'));
  var hat   = findItem('hat',   eqId('hat',   'hat_none'));
  var gl    = findItem('glass', eqId('glass', 'glass_none'));
  var pet   = findItem('pet',   eqId('pet',   'pet_none'));
  var out   = findItem('outfit',eqId('outfit','out_default'));
  var bg    = findItem('bg',    eqId('bg',    'bg_default'));
  var sk    = opts.skin || p19_skinCol();
  var hcol  = opts.hairColor || p19_hairCol();
  var ecol  = opts.eye || p19_eyeCol();
  var full  = !opts.bust;
  var pose  = opts.pose || (S.user && S.user.pose) || 'ayakta';
  var anim  = (opts.anim === undefined) ? !!((S.user && S.user.anim) !== false && !S.calm) : !!opts.anim;
  var cls   = function(x){ return anim ? x : ''; };
  var vb    = full ? '0 0 200 230' : '26 14 148 148';
  var w     = size, h = full ? Math.round(size * 1.15) : size;
  var s = '<svg width="' + w + '" height="' + h + '" viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="avatar">';
  s += '<defs><linearGradient id="' + uid + 'f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient></defs>';
  if(full) s += '<ellipse cx="100" cy="224" rx="58" ry="7" fill="rgba(0,0,0,.3)"/>';
  /* arka plan dokusu (sahne arka planı zaten CSS ile geliyor) */
  if(opts.scene && eqId('bg', 'bg_default') === 'bg_uzay') s += '<circle cx="170" cy="40" r="2" fill="#fff" opacity=".8"/><circle cx="30" cy="70" r="1.6" fill="#fff" opacity=".7"/><circle cx="150" cy="110" r="1.4" fill="#fff" opacity=".6"/>';
  s += '<g>' + p19_hairBack(hair.st, hcol) + '</g>';
  s += '<g class="' + cls('av-breathe') + '">';
  s += p19_outfit(out.sc, out.c);
  s += p19_arms(out.sc, out.c, pose);
  s += '</g>';
  s += '<path d="M88 138 h24 v20 q-12 8 -24 0 z" fill="' + p19_shade(sk, -0.1) + '"/>';
  s += '<ellipse cx="55" cy="100" rx="7" ry="11" fill="' + sk + '"/><ellipse cx="145" cy="100" rx="7" ry="11" fill="' + sk + '"/>';
  s += '<path d="M56 90 q0 -52 44 -52 q44 0 44 52 q0 30 -13 43 q-13 13 -31 13 q-18 0 -31 -13 q-13 -13 -13 -43 z" fill="' + sk + '"/>';
  s += '<path d="M56 90 q0 -52 44 -52 q44 0 44 52 q0 30 -13 43 q-13 13 -31 13 q-18 0 -31 -13 q-13 -13 -13 -43 z" fill="url(#' + uid + 'f)"/>';
  s += '<g fill="' + p19_shade(hcol, -0.05) + '"><path d="M70 78 q12 -7 22 -2" stroke="' + hcol + '" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M130 78 q-12 -7 -22 -2" stroke="' + hcol + '" stroke-width="3.6" fill="none" stroke-linecap="round"/></g>';
  s += '<g><ellipse cx="82" cy="92" rx="9" ry="7.6" fill="#fff"/><ellipse cx="118" cy="92" rx="9" ry="7.6" fill="#fff"/></g>';
  s += '<g><circle cx="83" cy="92" r="4.6" fill="' + ecol + '"/><circle cx="117" cy="92" r="4.6" fill="' + ecol + '"/>'
     + '<circle cx="83" cy="92" r="2.1" fill="#111827"/><circle cx="117" cy="92" r="2.1" fill="#111827"/>'
     + '<circle cx="84.6" cy="90.3" r="1.4" fill="#fff"/><circle cx="118.6" cy="90.3" r="1.4" fill="#fff"/></g>';
  /* göz kapağı: animasyon açıkken kırpma efekti */
  s += '<g' + (anim ? ' class="av-lids"' : '') + '>'
     + '<rect' + (anim ? ' class="av-lid"' : '') + ' x="72" y="83" width="22" height="18" rx="7" fill="' + sk + '"/>'
     + '<rect' + (anim ? ' class="av-lid"' : '') + ' x="106" y="83" width="22" height="18" rx="7" fill="' + sk + '"/></g>';
  s += '<path d="M100 96 q4 8 -3 11" stroke="' + p19_shade(sk, -0.22) + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  s += '<path d="M90 118 q10 9 20 0" stroke="#9d4a3f" stroke-width="3.4" fill="none" stroke-linecap="round"/>';
  s += '<ellipse cx="73" cy="109" rx="8" ry="5" fill="#ff8fa3" opacity=".33"/><ellipse cx="127" cy="109" rx="8" ry="5" fill="#ff8fa3" opacity=".33"/>';
  s += '<g>' + p19_hairFront(hair.st, hcol) + '</g>';
  s += '<g>' + p19_hat(hat.sc) + '</g>';
  s += '<g>' + p19_glasses(gl.sc) + '</g>';
  if(full && pet && pet.sc !== 'none') s += '<g class="' + cls('av-pet') + '">' + p19_pet(pet.sc) + '</g>';
  s += '</svg>';
  return s;
}


/* eski kozmetik kimliklerini yeni setle eşle (kayıtlı parçalar kaybolmasın) */
var P19_IDMAP = {hat_cadı:'hat_buyucu', hat_cadığı:'hat_buyucu', hat_mezun:'hat_kep', hat_baret:'hat_bere', hat_kova:'hat_hasir',
  hat_parti:'hat_parti', glass_normal:'glass_yuvarlak', glass_gunes:'glass_gunes', glass_koruyucu:'glass_dikdortgen', glass_tek:'glass_monokl',
  pet_kaplumbaga:'pet_kus', pet_papagan:'pet_kus', pet_tilki:'pet_kopek', pet_ejder:'pet_dino', out_altin:'out_zirh', out_siyah:'out_ceket',
  hair_kel:'hair_kel'};
function p19b_migrate(){
  try{
    if(S.owned){ var _seen={}, _nl=[]; S.owned.forEach(function(x){ var v=P19_IDMAP[x]||x; if(!_seen[v]){ _seen[v]=1; _nl.push(v); } }); S.owned=_nl; }
    if(S.equipped) Object.keys(S.equipped).forEach(function(k){ if(P19_IDMAP[S.equipped[k]]) S.equipped[k] = P19_IDMAP[S.equipped[k]]; });
    if(S.equipped && S.equipped.glasses && !S.equipped.glass) S.equipped.glass = S.equipped.glasses;
    if(!S.user.eye) S.user.eye = '#3b82f6';
    if(!S.user.hair) S.user.hair = '#4b3427';
  }catch(e){}
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', p19b_migrate);
setTimeout(p19b_migrate, 0);

/* ---------- mağaza/avatar görünümü ---------- */
Shop.cat = Shop.cat || 'hat';
Shop.randomize = function(){
  var cats = Object.keys(COSMETICS), changed = 0;
  cats.forEach(function(c){
    var owned = COSMETICS[c].filter(function(x){ return x.pr === 0 || S.owned.indexOf(x.id) >= 0; });
    if(owned.length > 1){ S.equipped[c] = pick(owned).id; changed++; }
  });
  save(); confetti(30); toast('🎲','Rastgele kombin', changed + ' parça değiştirildi.', 'good', 2600); App.repaintCurrent();
};
var P19_CATS = {hair:'💇 Saç', hat:'🎩 Şapka', glass:'👓 Gözlük', outfit:'👕 Kıyafet', pet:'🐾 Evcil', bg:'🖼️ Arka Plan'};
var P19_ACH = (typeof ACH !== 'undefined') ? ACH : [];
VIEWS.avatar = function(){
  var eq = S.equipped || {}, li = levelInfo(S.points), cat = Shop.cat;
  if(eq.glasses && !eq.glass){ eq.glass = eq.glasses; }
  var bg = findItem('bg', eq.bg || 'bg_default');
  var earned = P19_ACH.filter(function(a){ return S.seenBadges.includes(a.id); });
  var stage = '<div style="border-radius:18px;padding:14px;display:flex;justify-content:center;align-items:flex-end;min-height:300px;'
    + 'background:' + (bg.css || 'var(--card)') + ';border:1px solid var(--card-brd);position:relative;overflow:hidden">'
    + '<div id="avatarSvg" style="line-height:0">' + avatarSVG(232) + '</div>'
    + '<div style="position:absolute;left:12px;top:10px;font-size:.72rem;padding:4px 9px;border-radius:9px;background:rgba(0,0,0,.35);color:#fff">'
    + esc(bg.n || '') + '</div></div>';

  var controls = '<div class="grid g2 mt" style="gap:10px">'
    + '<label class="fld"><span>Ten rengi</span><div class="chips">' + P19_SKINS.map(function(c, i){
        return '<span class="chip ' + ((S.user.skin || 2) === i + 1 ? 'on' : '') + '" style="background:' + c + ';width:30px;height:30px;padding:0;border-radius:9px" '
          + 'onclick="S.user.skin=' + (i + 1) + ';save();App.repaintCurrent()"></span>';
      }).join('') + '</div></label>'
    + '<label class="fld"><span>Saç rengi</span>'
      + '<div class="chips">' + P19_HAIRCOLORS.map(function(c){
          return '<span class="chip ' + (String(S.user.hair || '').toLowerCase() === c ? 'on' : '') + '" style="background:' + c + ';width:26px;height:26px;padding:0;border-radius:8px" '
            + 'onclick="S.user.hair=\'' + p19q(c) + '\';save();App.repaintCurrent()"></span>';
        }).join('') + '</div>'
      + '<input type="color" value="' + esc(S.user.hair || '#4b3427') + '" onchange="S.user.hair=this.value;save();App.repaintCurrent()" style="margin-top:6px"></label>'
    + '<label class="fld"><span>Göz rengi</span>'
      + '<div class="chips">' + P19_EYECOLORS.map(function(c){
          return '<span class="chip ' + (String(S.user.eye || '') === c ? 'on' : '') + '" style="background:' + c + ';width:26px;height:26px;padding:0;border-radius:8px" '
            + 'onclick="S.user.eye=\'' + p19q(c) + '\';save();App.repaintCurrent()"></span>';
        }).join('') + '</div></label>'
    + '<label class="fld"><span>Adın</span><input type="text" value="' + esc(S.user.name || '') + '" maxlength="18" onchange="S.user.name=this.value;save();App.repaintCurrent()"></label>'
    + '</div>';

  var shopItems = (COSMETICS[cat] || []).map(function(it){
    var owned = S.owned.indexOf(it.id) >= 0, equ = (eq[cat] === it.id);
    var prev;
    if(cat === 'bg') prev = '<div style="height:74px;border-radius:12px;background:' + it.css + '"></div>';
    else prev = '<div style="height:74px;display:flex;align-items:center;justify-content:center;border-radius:12px;background:rgba(255,255,255,.04)">'
      + avatarSVG(70, {bust: cat !== 'pet', forItem:{cat:cat, id:it.id}}) + '</div>';
    return '<div class="item ' + (owned ? 'owned' : '') + ' ' + (equ ? 'equipped' : '') + '" title="' + esc(it.d || '') + '">'
      + prev + '<div class="nm">' + esc(it.n) + '</div>'
      + '<div class="pr">' + (owned ? (equ ? '✅ kuşanıldı' : 'sahipsin') : '🪙 ' + it.pr) + '</div>'
      + '<button class="btn sm ' + (equ ? 'green' : (owned ? '' : 'primary')) + ' block" onclick="Shop.buy(\'' + cat + '\',\'' + it.id + '\')">'
      + (equ ? 'Aktif' : (owned ? 'Kuşan' : 'Satın al')) + '</button></div>';
  }).join('');

  var achCard = '<div class="card mt2"><h3>🏅 Başarımlar (' + earned.length + '/' + P19_ACH.length + ')</h3>'
    + '<div class="shop-grid">' + P19_ACH.map(function(a){
        var ok = S.seenBadges.includes(a.id), cur = a.p(S), p = clamp(cur / a.g * 100, 0, 100);
        return '<div class="item ' + (ok ? 'owned' : '') + '" title="' + esc(a.d) + '">'
          + '<div class="prev">' + (ok ? a.e : '🔒') + '</div><div class="nm">' + esc(a.n) + '</div>'
          + '<div class="pr">' + (ok ? '+' + a.r + ' puan alındı' : (a.g > 1 ? cur + '/' + a.g : 'devam ediyor')) + '</div>'
          + (ok ? '<span class="tag ok">tamam</span>' : '<div>' + barHtml(p, 'gold') + '</div>')
          + '<div class="tiny muted mt">' + esc(a.d) + '</div></div>';
      }).join('') + '</div></div>';

  return secHead('🧑‍🎤', 'Avatar & Mağaza',
      'Avatarını gerçekten giydir: şapka, gözlük, kıyafet, saç, evcil hayvan ve arka planlar. Puanın: <b>' + TL(S.points) + '</b> · Seviye <b>' + li.lvl + ' (' + li.name + ')</b>')
    + '<div class="grid g2">'
    +   '<div class="card"><h3>🪞 Avatarım</h3>' + stage
    +     '<div class="row between mt"><b>' + esc(S.user.name || 'Sen') + '</b><span class="tag">' + esc((findItem('outfit', eq.outfit || 'out_default').n)) + ' · '
    +       esc(findItem('hat', eq.hat || 'hat_none').n) + '</span></div>'
    +     controls
    +     '<div class="btnrow mt"><button class="btn primary" onclick="Shop.surprise()">🎁 Sürpriz kutu (120 puan)</button>'
    +       '<button class="btn" onclick="Shop.randomize()">🎲 Rastgele kombin</button>'
    +       '<button class="btn" onclick="Shop.png()">🖼️ PNG indir</button></div>'
    +     '<div class="row between mt">' + barHtml(li.pct, 'gold') + '</div>'
    +     '<div class="tiny muted mt">Sonraki seviye: ' + (li.next ? TL(li.next - S.points) + ' puan kaldı' : 'maksimum') + '</div>'
    +   '</div>'
    +   '<div class="card"><h3>🛍️ Mağaza</h3>'
    +     '<div class="chips">' + Object.keys(P19_CATS).map(function(k){
          return '<span class="chip ' + (cat === k ? 'on' : '') + '" onclick="Shop.cat=\'' + p19q(k) + '\';App.repaintCurrent()">' + P19_CATS[k] + '</span>';
        }).join('') + '</div>'
    +     '<div class="shop-grid mt">' + shopItems + '</div>'
    +     '<div class="hint mt">Puan kaynakları: test çözme, odaklanma, hasat, günlük görevler, mini oyunlar, başarımlar. Her parça avatarda anında görünür.</div>'
    +   '</div>'
    + '</div>' + achCard;
};
