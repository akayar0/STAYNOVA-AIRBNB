// backend/db.js — SQLite Veritabanı Şeması, ERD Başlangıç Verileri ve SQL/JSON Senkronizasyonu (1. Kişi - AA | AIR-44)
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const { hashPassword } = require('./auth');
const { CATEGORY_LABELS } = require('./config/constants');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'staynova.sqlite'));

function initDb() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
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

    CREATE TABLE IF NOT EXISTS listings (
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

    CREATE TABLE IF NOT EXISTS reservations (
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

    CREATE TABLE IF NOT EXISTS payments (
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

    CREATE TABLE IF NOT EXISTS reviews (
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

    CREATE TABLE IF NOT EXISTS messages (
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

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      listing_id INTEGER NOT NULL,
      note TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      UNIQUE(user_id, listing_id)
    );
  `);

  // Eksik sütun kontrolü (Geriye dönük uyumluluk)
  const listingCols = db.prepare("PRAGMA table_info(listings)").all().map(c => c.name);
  if (!listingCols.includes('discounted_price')) {
    db.exec("ALTER TABLE listings ADD COLUMN discounted_price REAL DEFAULT NULL;");
  }
  if (!listingCols.includes('discount_note')) {
    db.exec("ALTER TABLE listings ADD COLUMN discount_note TEXT DEFAULT '';");
  }

  seedInitialData();
  syncReadableExports();
}

function seedInitialData() {
  const userCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get().cnt;
  if (userCount === 0) {
    const now = new Date().toISOString();
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone, avatar, bio, city, preferences_json, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `);

    // 1. Misafir Hesabı
    insertUser.run(
      'Zeynep Kaya',
      'misafir@staynova.com',
      hashPassword('123456'),
      'guest',
      '0532 410 20 30',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      'Seyahat etmeyi, yeni kültürler keşfetmeyi ve mimari tasarımlı konaklama deneyimlerini seven bir gezgin.',
      'İstanbul',
      JSON.stringify({ currency: 'TRY', language: 'tr' }),
      now
    );

    // 2. Ev Sahibi Hesabı
    insertUser.run(
      'Ahmet Kayar',
      'evsahibi@staynova.com',
      hashPassword('123456'),
      'host',
      '0544 820 90 10',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      'StayNova Süper Ev Sahibi. Akdeniz, Ege ve İstanbul bölgelerinde lüks villa ve tasarım daireler işletiyorum.',
      'Antalya',
      JSON.stringify({ currency: 'TRY', language: 'tr' }),
      now
    );

    // 3. Yönetici Hesabı
    insertUser.run(
      'Sistem Yöneticisi',
      'admin@staynova.com',
      hashPassword('admin123'),
      'admin',
      '0850 300 00 00',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
      'StayNova Platform Güvenlik ve Moderasyon Yöneticisi.',
      'Ankara',
      JSON.stringify({ currency: 'TRY', language: 'tr' }),
      now
    );
  }

  const listingCount = db.prepare('SELECT COUNT(*) as cnt FROM listings').get().cnt;
  if (listingCount === 0) {
    const hostUser = db.prepare("SELECT id FROM users WHERE role = 'host' LIMIT 1").get();
    const hostId = hostUser ? hostUser.id : 2;
    const now = new Date().toISOString();

    const insertListing = db.prepare(`
      INSERT INTO listings (
        host_id, title, description, property_type, category_label,
        city, district, neighborhood, address, lat, lng,
        base_price, discounted_price, discount_note, cleaning_fee,
        max_adults, max_children, bedrooms, beds, bathrooms,
        amenities_json, photos_json, seasonal_multipliers_json, blocked_dates_json,
        cancellation_policy, status, moderation_note, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedListings = [
      {
        title: 'Villa Azure — Kaş Yarımadası Sonsuzluk Havuzlu Taş Villa',
        description: 'Meis Adası manzarasına hakim Çukurbağ Yarımadasında, özel ısıtmalı sonsuzluk havuzu, jakuzili terası ve taş mimarisiyle izole bir tatil deneyimi.',
        propertyType: 'villa',
        city: 'Antalya',
        district: 'Kaş',
        neighborhood: 'Çukurbağ Yarımadası',
        address: 'Çukurbağ Yarımadası Bükülmez Cad. No: 18 Kaş/Antalya',
        lat: 36.1993,
        lng: 29.6391,
        basePrice: 8500,
        discountedPrice: 6950,
        discountNote: 'Erken Rezervasyon Fırsatı',
        cleaningFee: 950,
        maxAdults: 6,
        maxChildren: 2,
        bedrooms: 3,
        beds: 4,
        bathrooms: 3,
        amenities: ['wifi', 'pool', 'sea_view', 'ac', 'kitchen', 'parking', 'jacuzzi', 'bbq'],
        photos: [
          { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1000&auto=format&fit=crop&q=80', caption: 'Sonsuzluk Havuzu & Deniz Manzarası', isCover: true },
          { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000&auto=format&fit=crop&q=80', caption: 'Panoramik Teras', isCover: false },
          { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&auto=format&fit=crop&q=80', caption: 'Modern İç Mekan & Salon', isCover: false }
        ],
        seasonalMultipliers: [
          { label: 'Yaz Yüksek Sezonu', startDate: '2026-06-15', endDate: '2026-09-15', multiplier: 1.25 }
        ],
        blockedDates: ['2026-11-18', '2026-11-19', '2026-11-20'],
        cancellationPolicy: 'esnek',
        status: 'active',
        moderationNote: 'Onaylandı ve yayında.'
      },
      {
        title: 'Galata Boğaz Manzaralı Tarihi Çatı Katı Loft',
        description: 'Galata Kulesine 2 dakika yürüme mesafesinde, yüksek tavanlı, özel terasından Tarihi Yarımada ve Boğaz manzarası sunan tasarım loft daire.',
        propertyType: 'daire',
        city: 'İstanbul',
        district: 'Beyoğlu',
        neighborhood: 'Bereketzade',
        address: 'Serdar-ı Ekrem Cad. No: 42 Kat: 5 Galata Beyoğlu/İstanbul',
        lat: 41.0256,
        lng: 28.9741,
        basePrice: 4800,
        discountedPrice: null,
        discountNote: '',
        cleaningFee: 600,
        maxAdults: 4,
        maxChildren: 1,
        bedrooms: 2,
        beds: 2,
        bathrooms: 1,
        amenities: ['wifi', 'sea_view', 'ac', 'kitchen', 'workspace', 'elevator'],
        photos: [
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80', caption: 'Tasarım Loft Salon', isCover: true },
          { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&auto=format&fit=crop&q=80', caption: 'Boğaz Manzaralı Yatak Odası', isCover: false }
        ],
        seasonalMultipliers: [
          { label: 'Yılbaşı & Festival Dönemi', startDate: '2026-12-20', endDate: '2027-01-05', multiplier: 1.35 }
        ],
        blockedDates: ['2026-11-24', '2026-11-25'],
        cancellationPolicy: 'orta',
        status: 'active',
        moderationNote: 'Onaylandı ve yayında.'
      },
      {
        title: 'Sapanca Orman İçi Isıtmalı Havuzlu & Şömineli Glamping Bungalov',
        description: 'Sapanca Gölü manzaralı meşe ormanı içerisinde, 4 mevsim sıcak havuzlu, odun şömineli ve izole bahçeli ahşap üçgen bungalov.',
        propertyType: 'bungalov',
        city: 'Sakarya',
        district: 'Sapanca',
        neighborhood: 'Kırkpınar',
        address: 'Kırkpınar Soğuksu Mah. Orman Yolu Sok. No: 9 Sapanca/Sakarya',
        lat: 40.6914,
        lng: 30.2672,
        basePrice: 5400,
        discountedPrice: 4650,
        discountNote: 'Kasım İndirimi',
        cleaningFee: 500,
        maxAdults: 2,
        maxChildren: 2,
        bedrooms: 1,
        beds: 2,
        bathrooms: 1,
        amenities: ['wifi', 'pool', 'fireplace', 'ac', 'kitchen', 'parking', 'pet_friendly'],
        photos: [
          { url: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1000&auto=format&fit=crop&q=80', caption: 'Orman İçi Ahşap Bungalov', isCover: true },
          { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1000&auto=format&fit=crop&q=80', caption: 'Isıtmalı Bahçe Havuzu', isCover: false }
        ],
        seasonalMultipliers: [
          { label: 'Kış Şömine Sezonu', startDate: '2026-11-15', endDate: '2027-02-28', multiplier: 1.2 }
        ],
        blockedDates: ['2026-11-14', '2026-11-15'],
        cancellationPolicy: 'esnek',
        status: 'active',
        moderationNote: 'Onaylandı ve yayında.'
      }
    ];

    for (const item of seedListings) {
      insertListing.run(
        hostId,
        item.title,
        item.description,
        item.propertyType,
        CATEGORY_LABELS[item.propertyType] || 'Konut & Otel',
        item.city,
        item.district,
        item.neighborhood,
        item.address,
        item.lat,
        item.lng,
        item.basePrice,
        item.discountedPrice,
        item.discountNote,
        item.cleaningFee,
        item.maxAdults,
        item.maxChildren,
        item.bedrooms,
        item.beds,
        item.bathrooms,
        JSON.stringify(item.amenities),
        JSON.stringify(item.photos),
        JSON.stringify(item.seasonalMultipliers),
        JSON.stringify(item.blockedDates),
        item.cancellationPolicy,
        item.status,
        item.moderationNote,
        now
      );
    }
  }
}

function syncReadableExports() {
  try {
    const tables = ['users', 'listings', 'reservations', 'payments', 'reviews', 'messages', 'favorites'];
    const jsonDump = {};
    let sqlDump = '-- StayNova (1. Hafta - Sprint 1) Okunabilir SQL Şema ve Veri Dökümü\n';
    sqlDump += `-- Son Güncelleme: ${new Date().toISOString()}\n\n`;

    for (const tbl of tables) {
      const rows = db.prepare(`SELECT * FROM ${tbl}`).all();
      jsonDump[tbl] = rows;

      const createStmt = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name=?").get(tbl);
      if (createStmt && createStmt.sql) {
        sqlDump += `${createStmt.sql};\n`;
      }
      for (const r of rows) {
        const cols = Object.keys(r);
        const vals = cols.map(k => {
          const v = r[k];
          if (v === null || v === undefined) return 'NULL';
          if (typeof v === 'number') return String(v);
          return `'${String(v).replace(/'/g, "''")}'`;
        });
        sqlDump += `INSERT INTO ${tbl} (${cols.join(', ')}) VALUES (${vals.join(', ')});\n`;
      }
      sqlDump += '\n';
    }

    fs.writeFileSync(path.join(dataDir, 'staynova_veritabani.json'), JSON.stringify(jsonDump, null, 2), 'utf8');
    fs.writeFileSync(path.join(dataDir, 'staynova_veritabani.sql'), sqlDump, 'utf8');
  } catch (err) {
    console.error('SQL/JSON senkronizasyon uyarısı:', err.message);
  }
}

module.exports = { db, initDb, syncReadableExports };

