// backend/layers/01-data-access-repositories/01-userRepository.js — KATMAN 1: Kullanıcı Veri Erişim Katmanı (1. Kişi - AA | AIR-42)
const { db, syncReadableExports } = require('../../db');

const userRepository = {
  findByEmail(email) {
    if (!email) return null;
    return db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(String(email).trim());
  },

  findById(id) {
    if (!id) return null;
    return db.prepare('SELECT * FROM users WHERE id = ?').get(Number(id));
  },

  createUser({ name, email, passwordHash, role, phone, avatar, bio, city, preferencesJson, createdAt }) {
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone, avatar, bio, city, preferences_json, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `);
    const info = stmt.run(
      name,
      email,
      passwordHash,
      role || 'guest',
      phone || '',
      avatar || '',
      bio || '',
      city || 'İstanbul',
      preferencesJson || '{}',
      createdAt || new Date().toISOString()
    );
    syncReadableExports();
    return this.findById(info.lastInsertRowid);
  },

  deleteUserById(id) {
    db.prepare('DELETE FROM users WHERE id = ?').run(Number(id));
    syncReadableExports();
  },

  updateProfile(id, { name, phone, city, avatar, bio, preferencesJson }) {
    db.prepare(`
      UPDATE users
      SET name = ?, phone = ?, city = ?, avatar = ?, bio = ?, preferences_json = ?
      WHERE id = ?
    `).run(name, phone, city, avatar, bio, preferencesJson, Number(id));
    syncReadableExports();
    return this.findById(id);
  },

  updateStatus(id, status, reason = '') {
    db.prepare('UPDATE users SET status = ?, status_reason = ? WHERE id = ?').run(status, reason, Number(id));
    syncReadableExports();
    return this.findById(id);
  }
};

module.exports = { userRepository };

