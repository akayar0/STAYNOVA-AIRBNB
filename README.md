# 🏨 OTEL VE AIRBNB REZERVASYON TAKİP SİSTEMİ (StayNova)
## 📅 1. HAFTA: AIR Sprint 1 — Temel Altyapı, Yetkilendirme ve İlan Girişi

Bu çalışma alanı (`STAYNOVA-AIRBNB`), projenin **yalnızca 1. Hafta (Sprint 1)** görevlerini, katmanlı mimari klasörlerini ve kaynak kodlarını içerir.

---

## 👥 1. Hafta Ekip Görev Dağılımı

| Ekip Üyesi | Jira Görevi | Modül / Katman |
| :--- | :--- | :--- |
| **1. Kişi — Ahmet Kayra Altıparmak (AA)** | `AIR-44`, `AIR-42` | Veritabanı Şeması & ERD (`backend/db.js`), Scrypt & HS256 JWT Motoru (`backend/auth.js`), RBAC (`authMiddleware.js`) ve Kullanıcı Katmanları (`01-user*`) |
| **2. Kişi — Ahmet Uysal (AU)** | `AIR-45` | İlan CRUD İşlemleri ve Görsel Yükleme Servisi (`02-listingRepository.js`, `02-listingService.js`, `02-listingController.js`, `listingManageRoutes.js`) |
| **3. Kişi — Ahmet Kayar (AK)** | `AIR-43` | Giriş/Kayıt Portalı (Blurlu Seyahat Kolajı & Rol Ayrışımı) ve Bilgisayardan Resim Yüklemeli Kullanıcı Profili (`authAndProfileView.js`) |
| **4. Kişi — Ali Önder Biçer (AB)** | `AIR-47` | 5 Adımlı İlan Oluşturma/Düzenleme Sihirbazı, 81 İl/İlçe Seçici, Canlı Önizleme Kartı ve Müsaitlik Takvimi (`hostAndWizardView.js`, `constants.js`) |

---

## 🏛️ 1. Hafta Katmanlı Mimari Dizin Yapısı

```text
STAYNOVA-AIRBNB/
├── index.html                                      # 1. Hafta Ana Giriş Noktası
├── server.js                                       # HTTP Sunucu & 1. Hafta Modül Yönlendiricisi
├── package.json                                    # Proje Yapılandırması
├── data/
│   ├── staynova.sqlite                             # SQLite 3 İlişkisel Veritabanı Dosyası (Binary)
│   ├── staynova_veritabani.sql                     # Okunabilir SQL Şema (CREATE TABLE) ve Veri (INSERT) Dosyası
│   └── staynova_veritabani.json                    # Okunabilir JSON Formatında Tüm Veritabanı Tabloları
├── backend/
│   ├── db.js                                       # AIR-44: SQLite Şeması, ERD Başlangıç Verileri ve SQL/JSON Senkronizasyonu
│   ├── auth.js                                     # AIR-42: Scrypt Şifreleme ve HS256 JWT Motoru
│   ├── config/constants.js                         # Sistem Sabitleri
│   ├── middleware/authMiddleware.js                # AIR-42: JWT Doğrulama ve RBAC Rol Denetimi Ara Katmanı
│   ├── services/pricingAndAvailabilityService.js   # İlan Zenginleştirme & Müsaitlik Çekirdeği
│   ├── layers/
│   │   ├── 01-data-access-repositories/            # KATMAN 1: 01-userRepository.js, 02-listingRepository.js
│   │   ├── 02-business-logic-services/             # KATMAN 2: 01-userService.js, 02-listingService.js
│   │   └── 03-presentation-controllers/            # KATMAN 3: 01-userController.js, 02-listingController.js
│   └── modules/
│       ├── 01-kullanici-yonetimi/userRoutes.js     # KATMAN 4: Auth & Profil Rotaları (AIR-42)
│       └── 02-ilan-yonetimi/listingManageRoutes.js # KATMAN 4: İlan CRUD & Takvim Rotaları (AIR-45)
└── public/
    ├── index.html                                  # Ön Yüz Giriş Dosyası
    ├── favicon.svg                                 # StayNova Sekme Logosu
    ├── css/                                        # Modüler Tasarım Katmanı (Outfit Tipografi & Glassmorphism)
    └── js/
        ├── layers/                                 # Ön Yüz Katmanları (01-config, 02-state, 03-api, 04-controller)
        └── modules/
            ├── 01-kullanici-yonetimi/authAndProfileView.js  # KATMAN 5: Giriş/Kayıt & Profil Görünümü (AIR-43)
            └── 02-ilan-yonetimi/hostAndWizardView.js        # KATMAN 5: İlan Sihirbazı & Takvim Görünümü (AIR-47)
```

---

## ▶️ Çalıştırma ve Demo Hesaplar

```bash
node server.js
```

Tarayıcıdan **`http://localhost:3000`** adresine gidebilir veya doğrudan `index.html` dosyasını açabilirsiniz:
* **Misafir Demo Hesabı:** `misafir@staynova.com` / Şifre: `123456`
* **Ev Sahibi Demo Hesabı:** `evsahibi@staynova.com` / Şifre: `123456`
