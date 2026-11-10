const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

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

  seedDefaultData();
  exportJsonAndSql();
}

function seedDefaultData() {
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (userCount === 0) {
    const { hashPassword } = require('./auth');
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone, city, avatar, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertUser.run('Ahmet Kayar', 'misafir@staynova.com', hashPassword('misafir123'), 'guest', '0532 111 2233', 'İstanbul', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80', new Date().toISOString());
    insertUser.run('Mehmet Ev Sahibi', 'evsahibi@staynova.com', hashPassword('evsahibi123'), 'host', '0542 444 5566', 'Antalya', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=240&q=80', new Date().toISOString());
    insertUser.run('Sistem Yöneticisi', 'admin@staynova.com', hashPassword('admin123'), 'admin', '0850 333 0000', 'Ankara', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&q=80', new Date().toISOString());
  }
}

function exportJsonAndSql() {
  try {
    const tables = ['users', 'listings', 'reservations', 'payments', 'reviews', 'messages', 'favorites'];
    const dump = {};
    for (const t of tables) {
      dump[t] = db.prepare(`SELECT * FROM ${t}`).all();
    }
    fs.writeFileSync(path.join(dataDir, 'staynova_veritabani.json'), JSON.stringify(dump, null, 2), 'utf8');

    let sqlDump = `-- STAYNOVA VERİTABANI DÖKÜMÜ\n-- Oluşturulma: ${new Date().toISOString()}\nPRAGMA foreign_keys = ON;\n\n`;
    for (const t of tables) {
      const rows = dump[t];
      if (rows && rows.length > 0) {
        sqlDump += `-- TABLO: ${t}\n`;
        for (const row of rows) {
          const cols = Object.keys(row).join(', ');
          const vals = Object.values(row).map(v => (v === null ? 'NULL' : typeof v === 'number' ? v : `'${String(v).replace(/'/g, "''")}'`)).join(', ');
          sqlDump += `INSERT OR IGNORE INTO ${t} (${cols}) VALUES (${vals});\n`;
        }
        sqlDump += `\n`;
      }
    }
    fs.writeFileSync(path.join(dataDir, 'staynova_veritabani.sql'), sqlDump, 'utf8');
  } catch (err) {
    console.error('Veritabani export hatasi:', err.message);
  }
}

module.exports = { db, initDb, exportJsonAndSql };

