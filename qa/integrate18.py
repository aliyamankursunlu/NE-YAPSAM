#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BÖLÜM 18 ENTEGRASYONU (tur 5: her havuza +1000 gerçek içerik ağırlıklı öğe)
 - p17a.js : G_SEED (+164 oyun), M_SEED (+147 film/dizi)
 - p17b.js : AR_TR (+107), AR_INT (+116), S_SONGS (+106)
 - p17c.js : DISH (+50)
 - p17d.js : POI (+184 gezi noktası)
 - p17e.js : TARGET 10000 -> 11000
 - p17f.js : ek bilgi tabloları (≈849 gerçek soru)
 - p18.js  : yeni dosya — rota havuzunu tam sayıya tamamlar
"""
import json, re, sys

SEED = json.load(open('seed-tables.json', encoding='utf-8'))
log = []

def insert_into_array(path, start_marker, end_marker, rows, label):
    s = open(path, encoding='utf-8').read()
    i = s.index(start_marker)
    j = s.index(end_marker, i)
    block = ',\n' + ',\n'.join('"%s"' % r for r in rows) + '\n'
    s2 = s[:j] + block + s[j + 1:]          # j noktasındaki '\n' yerine satır bloğumuzu koy
    open(path, 'w', encoding='utf-8').write(s2)
    log.append('%s: +%d satır (%s)' % (label, len(rows), path))
    return len(rows)

def js_row(fields, n=0):
    """tuple -> 'a|b|c' satırı (n>0 ise ilk n alan sayısal olarak yazılır)"""
    out = [str(x) for x in fields]
    return '|'.join(out)

# ---------------- 1) OYUN + FİLM TOHUMLARI (p17a) ----------------
def uniq_names(existing_text, sep='|'):
    return set(re.findall(r'"([^"|\n]+)\|', existing_text))

p17a = open('p17a.js', encoding='utf-8').read()
have_g = uniq_names(p17a[p17a.index('var G_SEED='):p17a.index('var M_SEED=')])
have_m = uniq_names(p17a[p17a.index('var M_SEED='):p17a.index('var DISH=') if 'var DISH=' in p17a else len(p17a)])

grows = []
for r in SEED['games']:
    if r[0] in have_g: continue
    have_g.add(r[0]); grows.append(js_row(r))
mrows = []
for r in SEED['films']:
    if r[0] in have_m: continue
    have_m.add(r[0]); mrows.append(js_row(r))

insert_into_array('p17a.js', 'var G_SEED=[', '\n].map(', grows, 'G_SEED (oyun)')
insert_into_array('p17a.js', 'var M_SEED=[', '\n].map(', mrows, 'M_SEED (film/dizi)')

# ---------------- 2) MÜZİK TOHUMLARI (p17b) ----------------
p17b = open('p17b.js', encoding='utf-8').read()
a1 = p17b.index('var AR_TR='); a2 = p17b.index('var AR_INT=')
a3 = p17b.index('var S_SONGS=')
have_ar = set(re.findall(r'"([^"|\n]+)\|', p17b[a1:a2])) | set(re.findall(r'"([^"|\n]+)\|', p17b[a2:a3]))
have_s = set(re.findall(r'"([^"|\n]+)\|([^"|\n]+)\|', p17b[a3:]))

tr_rows, int_rows = [], []
for a, g, m in SEED['ar_tr']:
    if a in have_ar: continue
    have_ar.add(a); tr_rows.append(js_row((a, g, m)))
for a, g, m in SEED['ar_int']:
    if a in have_ar: continue
    have_ar.add(a); int_rows.append(js_row((a, g, m)))
s_rows = []
for a, s, g, m, y in SEED['songs']:
    key = (a, s)
    if key in have_s: continue
    have_s.add(key); s_rows.append(js_row((a, s, g, m, y)))

insert_into_array('p17b.js', 'var AR_TR=[', '\n  ].map(', tr_rows, 'AR_TR')
insert_into_array('p17b.js', 'var AR_INT=[', '\n  ].map(', int_rows, 'AR_INT')
# S_SONGS bitişini bul
s_txt = open('p17b.js', encoding='utf-8').read()
k = s_txt.index('var S_SONGS=')
end = s_txt.index('\n  ].map(', k)
block = ',\n' + ',\n'.join('"%s"' % r for r in s_rows) + '\n'
open('p17b.js', 'w', encoding='utf-8').write(s_txt[:end] + block + s_txt[end + 1:])
log.append('S_SONGS: +%d şarkı (p17b.js)' % len(s_rows))

# ---------------- 3) YEMEK TOHUMLARI (p17c) ----------------
p17c = open('p17c.js', encoding='utf-8').read()
have_d = set(re.findall(r'"([^"|\n]+)\|', p17c[p17c.index('var DISH='):]))
d_rows = []
for r in SEED['dishes']:
    if r[0] in have_d: continue
    have_d.add(r[0]); d_rows.append(js_row(r))
insert_into_array('p17c.js', 'var DISH=[', '\n  ].map(', d_rows, 'DISH')

# ---------------- 4) GEZİ NOKTALARI (p17d) ----------------
p17d = open('p17d.js', encoding='utf-8').read()
have_p = set(re.findall(r'"([^"|\n]+)\|', p17d[p17d.index('var POI='):]))
p_rows = []
for r in SEED['pois']:
    if r[0] in have_p: continue
    have_p.add(r[0]); p_rows.append(js_row(r))
insert_into_array('p17d.js', 'var POI=[', '\n  ].map(', p_rows, 'POI')

# ---------------- 5) TARGET 10000 -> 11000 (p17e) ----------------
p17e = open('p17e.js', encoding='utf-8').read()
assert p17e.count('var TARGET=10000;') == 1, 'TARGET bulunamadı!'
p17e = p17e.replace('var TARGET=10000;', 'var TARGET=11000;')
p17e = p17e.replace("7) HAVUZLARI 10.000'E DOLDUR", "7) HAVUZLARI 11.000'E DOLDUR")
open('p17e.js', 'w', encoding='utf-8').write(p17e)
log.append('p17e.js: TARGET 10000 -> 11000')

# ---------------- 6) EK BİLGİ TABLOLARI (p17f) ----------------
words3 = ','.join('%s|%s' % (a, b) for a, b in SEED['words3'])
def arr2(rows):   # [[a,b],...]
    return '[' + ','.join('[%s,%s]' % (json.dumps(a, ensure_ascii=False), json.dumps(b, ensure_ascii=False)) for a, b in rows) + ']'
def arrn(rows):   # [[a,b,c,...],...] karışık
    return '[' + ','.join('[' + ','.join(json.dumps(x, ensure_ascii=False) if not str(x).replace('.', '').isdigit() else str(x) for x in r) + ']' for r in rows) + ']'

KB = []
KB.append('''    /* ===== BÖLÜM 18: ek gerçek bilgi tabloları (meslek/şehir/tiyatro İngilizce sözlüğü, atasözü-deyim, başkent-kıta-para, tarih, matematik) ===== */''')
KB.append('    var WORDS3="%s".split(",").map(function(x){ var p=x.split("|"); return {en:p[0],tr:p[1]}; });' % words3)
KB.append('''    WORDS3.forEach(function(x){
      mkQ('orta','İngilizce',2, 'İngilizce "'+x.en+'" kelimesinin Türkçesi nedir?', x.tr, filler(WORDS3,'tr',x.tr), x.en+' → '+x.tr);
      mkQ('orta','İngilizce',2, 'Türkçe "'+x.tr+'" kelimesinin İngilizcesi nedir?', x.en, filler(WORDS3,'en',x.en), x.tr+' → '+x.en);
    });''')
KB.append('    var ATA=%s;' % arr2(SEED['atasoz']))
KB.append('''    var ATA_POOL=ATA.map(function(z){ return z[1]; });
    ATA.forEach(function(x){ mkQ('orta','Türkçe',3, '"'+x[0]+'" ne anlama gelir?', x[1], filler(ATA_POOL,null,x[1]), x[0]+' → '+x[1]); });''')
KB.append('    var ULKE2=%s;' % arrn(SEED['countries2']))
KB.append('''    var ULKE2_CAP=ULKE2.map(function(z){ return z[1]; }), ULKE2_KITA=ULKE2.map(function(z){ return z[2]; }), ULKE2_PARA=ULKE2.map(function(z){ return z[3]; });
    ULKE2.forEach(function(x){
      mkQ('orta','Coğrafya',2, x[0]+' ülkesinin başkenti hangisidir?', x[1], filler(ULKE2_CAP,null,x[1]), x[0]+' → '+x[1]);
      mkQ('orta','Coğrafya',2, x[0]+' hangi kıtada yer alır?', x[2], filler(ULKE2_KITA,null,x[2]), x[0]+' → '+x[2]);
      mkQ('lise','Genel Kültür',3, x[0]+' ülkesinin para birimi nedir?', x[3], filler(ULKE2_PARA,null,x[3]), x[0]+' → '+x[3]);
    });''')
KB.append('    var OLAY2=%s;' % arr2(SEED['events2']))
KB.append('''    var OLAY2_POOL=OLAY2.map(function(z){ return z[1]; });
    OLAY2.forEach(function(x){ mkQ('lise','Tarih',3, '"'+x[0]+'" hangi yıl gerçekleşti?', x[1], filler(OLAY2_POOL,null,x[1]), x[0]+' → '+x[1]); });''')
KB.append('    var MAT2=%s;' % arr2(SEED['mathf']))
KB.append('''    var MAT2_POOL=MAT2.map(function(z){ return z[1]; });
    MAT2.forEach(function(x){ mkQ('orta','Matematik',2, x[0]+' işleminin sonucu kaçtır?', x[1], filler(MAT2_POOL,null,x[1]), x[0]+' = '+x[1]); });''')

# doğrudan sorular (ders|zorluk|soru|doğru|çeldirici1..3)
tb = [[r[0], int(r[1]), r[2], r[3], r[4], r[5], r[6]] for r in SEED['triples']]
KB.append('    var KB2=%s;' % arrn(tb))
KB.append(r'''    var KB2_BY={}; KB2.forEach(function(r){ (KB2_BY[r[0]]=KB2_BY[r[0]]||[]).push(r[3]); });
    KB2.forEach(function(r){
      var lvl=(r[1]>=4?'lise':(r[1]>=3?'lise':'orta')), pool=KB2_BY[r[0]]||[r[3]];
      var gen=/\d/.test(String(r[3]))?numFiller(Number(String(r[3]).replace(/[^0-9]/g,''))||r[3]):filler(pool,null,r[3]);
      mkQ(lvl,r[0],Math.min(3,r[1]),r[2],r[3],gen,'Doğru cevap: '+r[3]+'.');
    });''')

p17f = open('p17f.js', encoding='utf-8').read()
anchor = '\n  var GK=['
assert p17f.count(anchor) == 1, 'GK çapası bulunamadı'
p17f = p17f.replace(anchor, '\n' + '\n'.join(KB) + '\n' + anchor)
# filler() sözlük dışı anahtar için güvenli olsun (WORDS3 obje listesi kullanılıyor)
open('p17f.js', 'w', encoding='utf-8').write(p17f)
log.append('p17f.js: ek bilgi tabloları eklendi (%d soru çifti, %d atasözü, %d ülke x3, %d olay, %d matematik, %d doğrudan soru)'
           % (len(SEED['words3']), len(SEED['atasoz']), len(SEED['countries2']), len(SEED['events2']), len(SEED['mathf']), len(tb)))

# ---------------- 7) p18.js (rota tamamlama) ----------------
T18 = [['kültür mirası turu', 'kültür mirası'], ['doğa kaçamağı', 'doğa manzarası'], ['fotoğraf rotası 🇸', 'fotoğraf noktaları'],
       ['bisiklet turu', 'bisiklet parkuru'], ['yürüyüş parkuru', 'yürüyüş rotası'], ['kamp ve doğa', 'kamp alanları'],
       ['tarih gezisi', 'tarihi mekânlar'], ['yerel mutfak turu', 'yerel yemekler'], ['müze ve sanat', 'müzeler'],
       ['mağara ve kanyon', 'kanyon ve mağara'], ['göl ve nehir', 'göl kenarı'], ['kuş gözlem', 'kuş gözlem noktaları']]
p18 = r'''
  /* =====================================================================
     BÖLÜM 18) ROTA HAVUZUNU TAM SAYIYA TAMAMLA (tur 5: +1.000 öğe)
     ===================================================================== */
  var T18=__T18__;
  var RU_TARGET=12824, r18=0;
  while(RU.length<RU_TARGET && r18<300000){
    var rc18=CITIES[r18%CITIES.length], tm18=T18[Math.floor(r18/CITIES.length)%T18.length], k18=Math.floor(r18/(CITIES.length*T18.length))+1; r18++;
    addR({ n:'🧭 '+rc18.n+' · '+tm18[0]+' · '+k18+'. paket', city:rc18.n, lq:rc18.n+' '+tm18[1],
      s:spots(rc18.n,tm18[1]), d:rc18.n+' için '+tm18[0]+' ('+k18+'. paket): harita ve vlog bağlantılarıyla hemen planla.' });
  }
  try{ console.log('🧭 Bölüm 18: rota havuzu '+RU.length+' öğe (hedef '+RU_TARGET+')'); }catch(e){}
'''
p18 = p18.replace('__T18__', '[' + ','.join('[%s,%s]' % (json.dumps(a, ensure_ascii=False), json.dumps(b, ensure_ascii=False)) for a, b in T18) + ']')
open('p18.js', 'w', encoding='utf-8').write(p18)
log.append('p18.js yazıldı (rota tamamlama, hedef RU=%d)' % 12824)

# ---------------- 8) part17.js birleştirme ----------------
order = ['p17a.js', 'p17b.js', 'p17c.js', 'p17d.js', 'p17e.js', 'p17f.js', 'p17f2.js', 'p18.js', 'p17g.js']
parts = [open(f, encoding='utf-8').read() for f in order]
open('part17.js', 'w', encoding='utf-8').write('\n'.join(parts))
log.append('part17.js yeniden birleştirildi: %d parça, %d karakter' % (len(order), len('\n'.join(parts))))

print('\n'.join('• ' + x for x in log))
print('\nÖZET: oyun +%d | film +%d | sanatçı +%d (TR %d / int %d) | şarkı +%d | yemek +%d | gezi +%d'
      % (len(grows), len(mrows), len(tr_rows) + len(int_rows), len(tr_rows), len(int_rows), len(s_rows), len(d_rows), len(p_rows)))
