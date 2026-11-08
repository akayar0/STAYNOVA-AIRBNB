-- StayNova (1. Hafta - Sprint 1) Okunabilir SQL Şema ve Veri Dökümü
-- Son Güncelleme: 2026-11-08T21:41:07.821Z

CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'guest', -- 'guest' | 'host' | 'admin'
      phone TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      city TEXT DEFAULT 'İstanbul',
      preferences_json TEXT DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'frozen' | 'suspended' | 'banned'
      status_reason TEXT DEFAULT '',
      reset_code TEXT DEFAULT NULL,
      created_at TEXT NOT NULL
    );
INSERT INTO users (id, name, email, password_hash, role, phone, avatar, bio, city, preferences_json, status, status_reason, reset_code, created_at) VALUES (1, 'Zeynep Kaya', 'misafir@staynova.com', 'scrypt$6d7e160756e62f0ff1371a6c5659ae0e$6b3c5baa4d222849609d19ad6f8227cc09ab9f94338dd3020fa52513f25273744c4908c8bab55efff02781a4435184886b7361abf075b736765ecd72725b9554', 'guest', '0532 410 20 30', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', 'Seyahat etmeyi, yeni kültürler keşfetmeyi ve mimari tasarımlı konaklama deneyimlerini seven bir gezgin.', 'İstanbul', '{"currency":"TRY","language":"tr"}', 'active', '', NULL, '2026-11-08T21:41:07.688Z');
INSERT INTO users (id, name, email, password_hash, role, phone, avatar, bio, city, preferences_json, status, status_reason, reset_code, created_at) VALUES (2, 'Ahmet Kayar', 'evsahibi@staynova.com', 'scrypt$417fa1c7a36ab527c615c0c4fb66537e$75755f88dccb1985673d5fab3ce5984d5283d7be6eb9ee2fe7249cf9d75642be267f0c5646f96770c993950c2869dbb06dd4ff9fe612aa07772f4e0c8b613a61', 'host', '0544 820 90 10', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', 'StayNova Süper Ev Sahibi. Akdeniz, Ege ve İstanbul bölgelerinde lüks villa ve tasarım daireler işletiyorum.', 'Antalya', '{"currency":"TRY","language":"tr"}', 'active', '', NULL, '2026-11-08T21:41:07.688Z');
INSERT INTO users (id, name, email, password_hash, role, phone, avatar, bio, city, preferences_json, status, status_reason, reset_code, created_at) VALUES (3, 'Sistem Yöneticisi', 'admin@staynova.com', 'scrypt$eb5cb81b81bb0b1e27a2057822e07454$f7817bc85751731101404b5a59fa594a0fd9d5a342c13b8bfc9eac6f17c8a3ca51ac9f6b706f005b2cc823ac7e21f4443a22c821e7871ea1451405778cc38741', 'admin', '0850 300 00 00', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80', 'StayNova Platform Güvenlik ve Moderasyon Yöneticisi.', 'Ankara', '{"currency":"TRY","language":"tr"}', 'active', '', NULL, '2026-11-08T21:41:07.688Z');

CREATE TABLE listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      host_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      property_type TEXT NOT NULL, -- 'daire' | 'villa' | 'otel_odasi' | 'bungalov' | 'paylasimli_oda'
      category_label TEXT NOT NULL,
      city TEXT NOT NULL,
      district TEXT NOT NULL,
      neighborhood TEXT DEFAULT '',
      address TEXT NOT NULL,
      lat REAL DEFAULT 36.8969,
      lng REAL DEFAULT 30.7133,
      base_price REAL NOT NULL,
      discounted_price REAL DEFAULT NULL,
      discount_note TEXT DEFAULT '',
      cleaning_fee REAL NOT NULL DEFAULT 0,
      max_adults INTEGER NOT NULL DEFAULT 2,
      max_children INTEGER NOT NULL DEFAULT 1,
      bedrooms INTEGER NOT NULL DEFAULT 1,
      beds INTEGER NOT NULL DEFAULT 1,
      bathrooms INTEGER NOT NULL DEFAULT 1,
      amenities_json TEXT NOT NULL DEFAULT '[]',
      photos_json TEXT NOT NULL DEFAULT '[]',
      seasonal_multipliers_json TEXT NOT NULL DEFAULT '[]',
      blocked_dates_json TEXT NOT NULL DEFAULT '[]',
      cancellation_policy TEXT NOT NULL DEFAULT 'esnek',
      status TEXT NOT NULL DEFAULT 'active',
      moderation_note TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
    );
INSERT INTO listings (id, host_id, title, description, property_type, category_label, city, district, neighborhood, address, lat, lng, base_price, discounted_price, discount_note, cleaning_fee, max_adults, max_children, bedrooms, beds, bathrooms, amenities_json, photos_json, seasonal_multipliers_json, blocked_dates_json, cancellation_policy, status, moderation_note, created_at) VALUES (1, 2, 'Villa Azure — Kaş Yarımadası Sonsuzluk Havuzlu Taş Villa', 'Meis Adası manzarasına hakim Çukurbağ Yarımadasında, özel ısıtmalı sonsuzluk havuzu, jakuzili terası ve taş mimarisiyle izole bir tatil deneyimi.', 'villa', 'Müstakil Lüks Villa', 'Antalya', 'Kaş', 'Çukurbağ Yarımadası', 'Çukurbağ Yarımadası Bükülmez Cad. No: 18 Kaş/Antalya', 36.1993, 29.6391, 8500, 6950, 'Erken Rezervasyon Fırsatı', 950, 6, 2, 3, 4, 3, '["wifi","pool","sea_view","ac","kitchen","parking","jacuzzi","bbq"]', '[{"url":"https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1000&auto=format&fit=crop&q=80","caption":"Sonsuzluk Havuzu & Deniz Manzarası","isCover":true},{"url":"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000&auto=format&fit=crop&q=80","caption":"Panoramik Teras","isCover":false},{"url":"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&auto=format&fit=crop&q=80","caption":"Modern İç Mekan & Salon","isCover":false}]', '[{"label":"Yaz Yüksek Sezonu","startDate":"2026-06-15","endDate":"2026-09-15","multiplier":1.25}]', '["2026-11-18","2026-11-19","2026-11-20"]', 'esnek', 'active', 'Onaylandı ve yayında.', '2026-11-08T21:41:07.804Z');
INSERT INTO listings (id, host_id, title, description, property_type, category_label, city, district, neighborhood, address, lat, lng, base_price, discounted_price, discount_note, cleaning_fee, max_adults, max_children, bedrooms, beds, bathrooms, amenities_json, photos_json, seasonal_multipliers_json, blocked_dates_json, cancellation_policy, status, moderation_note, created_at) VALUES (2, 2, 'Galata Boğaz Manzaralı Tarihi Çatı Katı Loft', 'Galata Kulesine 2 dakika yürüme mesafesinde, yüksek tavanlı, özel terasından Tarihi Yarımada ve Boğaz manzarası sunan tasarım loft daire.', 'daire', 'Rezidans & Daire', 'İstanbul', 'Beyoğlu', 'Bereketzade', 'Serdar-ı Ekrem Cad. No: 42 Kat: 5 Galata Beyoğlu/İstanbul', 41.0256, 28.9741, 4800, NULL, '', 600, 4, 1, 2, 2, 1, '["wifi","sea_view","ac","kitchen","workspace","elevator"]', '[{"url":"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80","caption":"Tasarım Loft Salon","isCover":true},{"url":"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&auto=format&fit=crop&q=80","caption":"Boğaz Manzaralı Yatak Odası","isCover":false}]', '[{"label":"Yılbaşı & Festival Dönemi","startDate":"2026-12-20","endDate":"2027-01-05","multiplier":1.35}]', '["2026-11-24","2026-11-25"]', 'orta', 'active', 'Onaylandı ve yayında.', '2026-11-08T21:41:07.804Z');
INSERT INTO listings (id, host_id, title, description, property_type, category_label, city, district, neighborhood, address, lat, lng, base_price, discounted_price, discount_note, cleaning_fee, max_adults, max_children, bedrooms, beds, bathrooms, amenities_json, photos_json, seasonal_multipliers_json, blocked_dates_json, cancellation_policy, status, moderation_note, created_at) VALUES (3, 2, 'Sapanca Orman İçi Isıtmalı Havuzlu & Şömineli Glamping Bungalov', 'Sapanca Gölü manzaralı meşe ormanı içerisinde, 4 mevsim sıcak havuzlu, odun şömineli ve izole bahçeli ahşap üçgen bungalov.', 'bungalov', 'Doğa Bungalovu & Glamping', 'Sakarya', 'Sapanca', 'Kırkpınar', 'Kırkpınar Soğuksu Mah. Orman Yolu Sok. No: 9 Sapanca/Sakarya', 40.6914, 30.2672, 5400, 4650, 'Kasım İndirimi', 500, 2, 2, 1, 2, 1, '["wifi","pool","fireplace","ac","kitchen","parking","pet_friendly"]', '[{"url":"https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1000&auto=format&fit=crop&q=80","caption":"Orman İçi Ahşap Bungalov","isCover":true},{"url":"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1000&auto=format&fit=crop&q=80","caption":"Isıtmalı Bahçe Havuzu","isCover":false}]', '[{"label":"Kış Şömine Sezonu","startDate":"2026-11-15","endDate":"2027-02-28","multiplier":1.2}]', '["2026-11-14","2026-11-15"]', 'esnek', 'active', 'Onaylandı ve yayında.', '2026-11-08T21:41:07.804Z');

CREATE TABLE reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_code TEXT NOT NULL UNIQUE,
      listing_id INTEGER NOT NULL,
      guest_id INTEGER NOT NULL,
      host_id INTEGER NOT NULL,
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      nights INTEGER NOT NULL,
      adults INTEGER NOT NULL DEFAULT 1,
      children INTEGER NOT NULL DEFAULT 0,
      nightly_breakdown_json TEXT NOT NULL DEFAULT '[]',
      accommodation_total REAL NOT NULL,
      cleaning_fee REAL NOT NULL,
      service_fee REAL NOT NULL,
      tax_amount REAL NOT NULL,
      total_price REAL NOT NULL,
      host_net_payout REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'confirmed' | 'cancelled' | 'completed'
      cancellation_reason TEXT DEFAULT '',
      refund_amount REAL DEFAULT 0,
      guest_note TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
      FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE
    );

CREATE TABLE payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_code TEXT NOT NULL UNIQUE,
      invoice_no TEXT NOT NULL,
      reservation_id INTEGER NOT NULL,
      guest_id INTEGER NOT NULL,
      host_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      refunded_amount REAL NOT NULL DEFAULT 0,
      host_payout REAL NOT NULL,
      platform_commission REAL NOT NULL,
      tax_amount REAL NOT NULL,
      card_holder TEXT NOT NULL,
      card_masked TEXT NOT NULL,
      card_brand TEXT NOT NULL DEFAULT 'Mastercard',
      installments INTEGER NOT NULL DEFAULT 1,
      payment_status TEXT NOT NULL DEFAULT 'paid', -- 'paid' | 'failed' | 'refunded'
      created_at TEXT NOT NULL,
      FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
    );

CREATE TABLE reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER NOT NULL UNIQUE,
      listing_id INTEGER NOT NULL,
      guest_id INTEGER NOT NULL,
      cleanliness_rating INTEGER NOT NULL,
      location_rating INTEGER NOT NULL,
      communication_rating INTEGER NOT NULL,
      overall_rating REAL NOT NULL,
      comment TEXT NOT NULL,
      host_reply TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'approved',
      report_reason TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
    );

CREATE TABLE messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_key TEXT NOT NULL,
      listing_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      archived_by_sender INTEGER NOT NULL DEFAULT 0,
      archived_by_receiver INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

CREATE TABLE favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      listing_id INTEGER NOT NULL,
      note TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      UNIQUE(user_id, listing_id)
    );

