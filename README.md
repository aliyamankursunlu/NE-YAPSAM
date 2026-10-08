# NE YAPSAM? 🎲

**Tek dosyalık, internetsiz çalışan "ne oynasam / ne izlesem / ne dinlesem / ne yesem / nereyi gezsem" uygulaması.**

> `index.html` dosyasını indirip çift tıklaman yeterli — kurulum, üyelik, sunucu yok.
> İstersen GitHub Pages adresinden de doğrudan açabilirsin: **https://aliyamankursunlu.github.io/NE-YAPSAM/**

---

## ✨ İçindekiler

| Bölüm | Ne yapar |
|---|---|
| 🎲 **Sıkıldım** | Her şeyin karışımı; tek tıkla rastgele öneri |
| 🎮 **Ne oynasam** | 11.000 oyun; Steam/Epic/mobil filtreleri, fiyat ve satın alma bağlantıları |
| 🎬 **Ne izlesem** | 11.000 film/dizi; süre, tür, platform filtreleri |
| 🎵 **Ne dinlesem** | 11.000 şarkı; Spotify'da **doğrudan şarkıyı** açar |
| 🍽️ **Ne yesem** | 11.000 tarif; malzemeye/süreye göre öneri |
| 🧭 **Nereyi gezsem** | 81 il + 12.824 hazır rota, harita bağlantıları |
| 🧠 **Test / çalışma** | Sınıf seviyesine göre sorular, puan, süre tutma |
| ⏱️ **Sayaçlar** | Ders ve oyun süresi sayar, günlük/haftalık özet |
| 🌱 **Bahçe** | Her gün ekin ekle ve sula; büyüme mekaniği |
| 🌳 **Ağaç** | Günlük ağaç sulama, seri takibi |
| 💧 **Su hatırlatıcı** | Her 20 dakikada bir hatırlatır (bilgisayar kapalıyken geçen süreyi de hesaba katar) |
| 📝 **Not / günlük** | Etiketli notlar, arama, dışa aktarma |
| 🧑‍🎤 **Avatar** | Puanla satın alınan şapka, gözlük, kıyafet, evcil hayvan; 4 poz + animasyon + 8 hazır kombin |
| 📊 **Yıllık özet** | Yılın istatistikleri, kopyalanabilir/indirilebilir özet |
| 🌙 **Karanlık / aydınlık tema** | Otomatik hatırlanır |
| 🔑 **Kalıcı hesap** | Cihaz sıfırlanmadığı sürece **hep aynı hesap**, otomatik giriş |

**Toplam öneri havuzu: 67.905 içerik.** Tüm veriler tarayıcının kendi alanında (`neyapsam_v1` anahtarı) saklanır; sunucuya hiçbir şey gönderilmez.

---

## 🔑 Kalıcı hesap & veri güvenliği

- Uygulama her açılışta **seni tanır**; kaç güncelleme gelirse gelsin aynı hesaba otomatik giriş yapılır.
- Sabit bir **Hesap No** (örn. `#1232`) ve benzersiz bir hesap kimliği verilir.
- Kayıt anahtarı **`neyapsam_v1`'dir ve hiçbir sürümde değişmez.**
- Kimlik 3 ayrı kasada yedeklidir: localStorage + çerez + **IndexedDB**. Ana kayıt silinse bile hesap geri yüklenir.
- **Ayarlar → 💾 Verilerim → ⬇️ Yedek al (JSON)** ile yedeğini indirebilir, **⬆️ Yedeği geri yükle** ile geri getirebilirsin.
- **Ayarlar → 🔺 Tehlikeli Ayarlar** içinde *uygulamayı sıfırla* (hesap korunur) ve *hesabı sil* (hesap numarasını yazarak doğrulama ister) var.

---

## 👨‍💻 Geliştirici ekibi

| # | Ad | Rol |
|---|---|---|
| 01 | **ALİ YAMAN KURŞUNLU** | BAŞ GELİŞTİRİCİ |
| 02 | **GÖRKEM CENGİZ** | BAŞ GELİŞTİRİCİ |
| 03 | **ONUR HARMAN** | YARDIMCI GELİŞTİRİCİ |
| 04 | **EGE ÇAKAL** | YARDIMCI GELİŞTİRİCİ |

**BİL KOLEJİ® 2026**

*(Uygulama içinde sekmelerdeki "👨‍💻 Geliştiriciler" düğmesine tıklayarak bu ekranı görebilirsin.)*

---

## 📁 Depo içeriği

```
index.html            → uygulama (GitHub Pages'in açtığı dosya)
ne-yapsam.html        → uygulama (Türkçe adıyla aynı dosya)
OKUBENI.md            → tüm sürüm notları ve teknik dokümantasyon
assets/               → okul logosu
ekran/                → ekran görüntüleri
qa/                   → otomatik test takımı (Node.js + Puppeteer)
```

### Testler nasıl çalıştırılır

```bash
cd qa
npm install puppeteer jsdom acorn
node check17.js      # sözdizimi kontrolü (14/14)
node suite17.js      # genel test paketi
node hesap21.js      # kalıcı hesap + tehlikeli ayarlar
node feat20.js       # geliştirici ekranı + marka + logo
node key20.js        # kalıcı anahtar bekçisi (neyapsam_v1)
node audit20f.js     # arayüzdeki tüm tuşların taraması
```

---

## 📄 Lisans / not

Kişisel kullanım için hazırlanmıştır. Öneri katalogları uygulamanın içinde gömülüdür; "Steam'de aç", "Spotify'da çal", "JustWatch'ta bak", "YouTube'da ara" gibi düğmeler ilgili sitelere yönlendirir.
