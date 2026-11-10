const { db } = require('../../db');

const userRepository = {
  findById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) || null;
  },
  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email) || null;
  },
  createUser(userData) {
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone, city, avatar, bio, preferences_json, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const res = stmt.run(
      userData.name,
      userData.email,
      userData.passwordHash,
      userData.role,
      userData.phone || '',
      userData.city || 'İstanbul',
      userData.avatar || '',
      userData.bio || '',
      userData.preferencesJson || '{}',
      userData.status || 'active',
      userData.createdAt
    );
    return this.findById(res.lastInsertRowid);
  },
  updateProfile(id, updates) {
    const stmt = db.prepare(`
      UPDATE users SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        city = COALESCE(?, city),
        avatar = COALESCE(?, avatar),
        bio = COALESCE(?, bio),
        preferences_json = COALESCE(?, preferences_json)
      WHERE id = ?
    `);
    stmt.run(updates.name, updates.phone, updates.city, updates.avatar, updates.bio, updates.preferencesJson, id);
    return this.findById(id);
  }
};

module.exports = { userRepository };

