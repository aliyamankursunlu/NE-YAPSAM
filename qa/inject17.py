#!/usr/bin/env python3
# ne-yapsam.html üretimi: v3 tabanı + Bölüm 17 (dev öneri havuzu) + arayüz yamaları
import sys
SRC='pre17-backup.html'; OUT='/home/user/ne-yapsam.html'; PART='part17.js'  # p17a..p17g + p18 + p19a + p19b
s=open(SRC,encoding='utf-8').read(); part=open(PART,encoding='utf-8').read()
fails=[]
def rep(old,new,label,cnt=1):
    global s
    n=s.count(old)
    if n!=cnt: fails.append('%s: %d bulundu (beklenen %d)'%(label,n,cnt)); return
    s=s.replace(old,new,cnt)

marker='/* ===================== KLAVYE KISAYOLLARI + BAŞLATMA ===================== */'
rep(marker, part.strip()+'\n\n'+marker, 'Part 17 enjeksiyonu')
rep('${list.length} oyun uygun','${fmtN(list.length)} oyun uygun','oyun uygun')
rep('${list.length} oyun arasından rastgele','${fmtN(list.length)} oyun arasından rastgele','oyun arasından')
rep('${list.length} içerik uygun','${fmtN(list.length)} içerik uygun','içerik uygun')
rep('${list.length} şarkı uygun','${fmtN(list.length)} şarkı uygun','şarkı uygun')
rep('${MUSIC.length} şarkı) öneriyorum','${fmtN(MUSIC.length)} şarkı) öneriyorum','MUSIC şarkı')
rep('${list.length} tarif uygun','${fmtN(list.length)} tarif uygun','tarif uygun')
rep('${Quiz.pool().length} soru havuzda','${fmtN(Quiz.pool().length)} soru havuzda','soru havuzda')
rep('${list.length} il listelendi','${fmtN(list.length)} ${f.mode==="rota"?"rota":"il"} listelendi','il listelendi')
rep("['city','📍 İl seç']],f.mode,", "['city','📍 İl seç'],['rota','🧭 Hazır rota öner']],f.mode,", 'gezi chip')
rep("${f.mode==='region'?`<label class=\"fld\"><span>Bölge</span>",
    "${(f.mode==='region'||f.mode==='rota')?`<label class=\"fld\"><span>Bölge</span>", 'bölge chipi')
# --- tur 9: geliştirici ekranı, okul markası, sabit anahtar ---
rep(marker,
    "/* ==== KALICI ANAHTAR: neyapsam_v1 — SÜRÜM GÜNCELLEMELERİNDE ASLA DEĞİŞTİRİLMEZ ==== */\n" + marker,
    'kalıcı anahtar notu')
rep('<div class="kv"><span>Kayıt anahtarı</span><span>${LS_KEY}</span></div>',
    '<div class="kv"><span>Kayıt anahtarı 🔒</span><span title="Bu anahtar sürüm güncellemelerinde asla değişmez">${LS_KEY} · sabit</span></div>',
    'anahtar satırı')
rep("""      <div class="hint mt">Sürüm 1.0 · Tek dosya · ${S.seen.visits||1} ziyaret</div>
    </div>""",
    """      <div class="hint mt">Sürüm 1.0 · Tek dosya · ${S.seen.visits||1} ziyaret</div>
      <div class="btnrow mt"><button class="btn sm" onclick="Dev.acikla()">👨‍💻 Geliştiriciler &amp; Marka</button></div>
    </div>
    <div id="bilMarka"></div>""", 'geliştirici düğmesi + marka yeri')
rep("""      <span class="tb-emo">${t.e}</span><span>${esc(t.n)}</span></button>`).join('');
    App.renderQuickbar();""",
    """      <span class="tb-emo">${t.e}</span><span>${esc(t.n)}</span></button>`).join('')+
      `<button class="tab p20-devtab" onclick="Dev.acikla()" title="Geliştiriciler ve okul markası"><span class="tb-emo">👨‍💻</span><span>Geliştiriciler</span></button>`;
    App.renderQuickbar();""", 'navbar geliştirici düğmesi')
rep("""  import(input){ const f=input.files&&input.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=()=>{ try{ const data=JSON.parse(r.result);""",
    """  import(input){ const f=input.files&&input.files[0]; if(!f) return;
    /* Görsel geri yükleme (Bölüm 20): logo / arka plan resmi seçilirse onu işle */
    if(/^image\\//.test(f.type) && window.ImgBil && ImgBil.canHandle(f.type,f.size)){
      const ri=new FileReader(); ri.onload=()=>{ ImgBil.read(f.type,f.size,String(ri.result)); };
      ri.onerror=()=>toast('⚠️','Görsel okunamadı','Dosyayı tekrar seçmeyi dene.','warn',3200);
      ri.readAsDataURL(f); try{ input.value=''; }catch(e){} return; }
    const r=new FileReader(); r.onload=()=>{ try{ const data=JSON.parse(r.result);""", 'görsel geri yükleme')
rep('accept="application/json,.json"','accept="application/json,.json,image/*"','dosya kabulü')

# --- tur 10: kalıcı hesap (otomatik giriş) + tehlikeli ayarlar ---
rep("""<div class="kv"><span>Kayıt anahtarı 🔒</span><span title="Bu anahtar sürüm güncellemelerinde asla değişmez">${LS_KEY} · sabit</span></div>""",
    """<div class="kv"><span>Kayıt anahtarı 🔒</span><span title="Bu anahtar sürüm güncellemelerinde asla değişmez">${LS_KEY} · sabit</span></div>
      <div class="kv"><span>Hesap No 🔑</span><span><b>#${Hsp.no()}</b> · otomatik giriş</span></div>
      <div class="kv"><span>Hesap kimliği</span><span class="p21-kod">${esc(Hsp.kisa())}</span></div>
      <div class="kv"><span>Üyelik · giriş</span><span>${esc(Hsp.uyelik())} tarihinden beri · ${Hsp.girisSayisi()}. giriş</span></div>
      <div class="kv"><span>Son giriş</span><span>${esc(Hsp.sonGiris())}</span></div>
      <div class="btnrow mt"><button class="btn sm ghost" onclick="Hsp.kopyala()">📋 Hesap bilgisini kopyala</button></div>""",
    'hesap satırları')
rep('<button class="btn red sm" onclick="Ayar.resetAll()">🗑️ Tüm verileri sıfırla</button>',
    '<button class="btn warn sm" onclick="Hsp.sifirlaOnay()">🔄 Uygulamayı sıfırla (hesabın kalır)</button>',
    'sıfırlama düğmesi')
rep("""    <div class="card"><h3>ℹ️ Hakkında</h3>""",
    """    ${p21_tehlikeKart()}
    <div class="card"><h3>ℹ️ Hakkında</h3>""",
    'tehlikeli ayarlar kartı')

# --- tur 8: bildirimler (toast) tıklamayı engellemesin ---
rep("#toasts .toast{pointer-events:auto}",
    "#toasts .toast{pointer-events:none}#toasts .toast.has-actions{pointer-events:auto}",
    'toast tıklama engeli')
rep("t.className='toast '+(kind||'');",
    "t.className='toast '+(kind||'')+(actions?' has-actions':'');",
    'toast eylem sınıfı')

# --- tur 6: mağaza/şarkı bağlantıları düzeltmeleri ---
rep("""${ext('https://store.steampowered.com/search/?term='+q(g.n),'Steam','ghost')}""",
    """${ext(storeDirect(g),'▶️ Oyna','ghost')}""", 'favori Steam linki')
rep("ext('https://open.spotify.com/search/'+q(s.a+' '+s.s),'Spotify','ghost')",
    "ext(songDirect(s.a,s.s),'Spotify','ghost')", 'şarkı doğrudan link', 1)
rep("ext('https://open.spotify.com/search/'+q(s.a+' '+s.s),'▸','ghost')",
    "ext(songDirect(s.a,s.s),'Spotify','ghost')", 'sıra doğrudan link', 1)
rep("Türkiye'nin 81 ilinden öneri al, yol tarifi linkiyle hemen planla.",
    "Türkiye'nin 81 ili ve <b>${fmtN((window.GEZI_ROUTES||[]).length)}</b> hazır rotadan öneri al; harita linkleriyle hemen planla.", 'gezi başlık')
rep('<div class="tiny muted">Rastgele bir il + gezilecek 3 yer önerilir.</div>',
    '<div class="tiny muted">Seçim moduna göre il ya da hazır rota önerilir; harita ve vlog linkleri hazır gelir.</div>', 'gezi altyazı')
if fails:
    print('YAMA HATALARI:'); [print(' -',x) for x in fails]; sys.exit(1)
open(OUT,'w',encoding='utf-8').write(s)
print('yazıldı:', OUT, '|', len(s), 'karakter')
