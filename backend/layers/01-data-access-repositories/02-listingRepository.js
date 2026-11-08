// backend/layers/01-data-access-repositories/02-listingRepository.js — KATMAN 1: İlan Veri Erişim Katmanı (2. Kişi - AU | AIR-45)
const { db, syncReadableExports } = require('../../db');

const listingRepository = {
  findAll() {
    return db.prepare('SELECT * FROM listings ORDER BY id DESC').all();
  },

  findByHostId(hostId) {
    return db.prepare('SELECT * FROM listings WHERE host_id = ? ORDER BY id DESC').all(Number(hostId));
  },

  findById(id) {
    if (!id) return null;
    return db.prepare('SELECT * FROM listings WHERE id = ?').get(Number(id));
  },

  createListing(data) {
    const stmt = db.prepare(`
      INSERT INTO listings (
        host_id, title, description, property_type, category_label,
        city, district, neighborhood, address, lat, lng,
        base_price, discounted_price, discount_note, cleaning_fee,
        max_adults, max_children, bedrooms, beds, bathrooms,
        amenities_json, photos_json, seasonal_multipliers_json, blocked_dates_json,
        cancellation_policy, status, moderation_note, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      Number(data.hostId),
      data.title,
      data.description,
      data.propertyType,
      data.categoryLabel,
      data.city,
      data.district,
      data.neighborhood || '',
      data.address,
      Number(data.lat) || 36.8969,
      Number(data.lng) || 30.7133,
      Number(data.basePrice) || 2500,
      data.discountedPrice !== null && data.discountedPrice !== undefined && data.discountedPrice !== ''
        ? Number(data.discountedPrice)
        : null,
      data.discountNote || '',
      Number(data.cleaningFee) || 0,
      Number(data.maxAdults) || 2,
      Number(data.maxChildren) || 0,
      Number(data.bedrooms) || 1,
      Number(data.beds) || 1,
      Number(data.bathrooms) || 1,
      data.amenitiesJson || '[]',
      data.photosJson || '[]',
      data.seasonalMultipliersJson || '[]',
      data.blockedDatesJson || '[]',
      data.cancellationPolicy || 'esnek',
      data.status || 'pending_approval',
      data.moderationNote || 'Yönetici (Admin) moderasyon onayı bekleniyor.',
      data.createdAt || new Date().toISOString()
    );

    syncReadableExports();
    return this.findById(info.lastInsertRowid);
  },

  updateListing(id, data) {
    db.prepare(`
      UPDATE listings SET
        title = ?,
        description = ?,
        property_type = ?,
        category_label = ?,
        city = ?,
        district = ?,
        neighborhood = ?,
        address = ?,
        base_price = ?,
        discounted_price = ?,
        discount_note = ?,
        cleaning_fee = ?,
        max_adults = ?,
        max_children = ?,
        bedrooms = ?,
        beds = ?,
        bathrooms = ?,
        amenities_json = ?,
        photos_json = ?,
        seasonal_multipliers_json = ?,
        blocked_dates_json = ?,
        cancellation_policy = ?,
        status = ?,
        moderation_note = ?
      WHERE id = ?
    `).run(
      data.title,
      data.description,
      data.propertyType,
      data.categoryLabel,
      data.city,
      data.district,
      data.neighborhood || '',
      data.address,
      Number(data.basePrice) || 2500,
      data.discountedPrice !== null && data.discountedPrice !== undefined && data.discountedPrice !== ''
        ? Number(data.discountedPrice)
        : null,
      data.discountNote || '',
      Number(data.cleaningFee) || 0,
      Number(data.maxAdults) || 2,
      Number(data.maxChildren) || 0,
      Number(data.bedrooms) || 1,
      Number(data.beds) || 1,
      Number(data.bathrooms) || 1,
      data.amenitiesJson,
      data.photosJson,
      data.seasonalMultipliersJson,
      data.blockedDatesJson,
      data.cancellationPolicy,
      data.status,
      data.moderationNote || '',
      Number(id)
    );

    syncReadableExports();
    return this.findById(id);
  },

  deleteListing(id) {
    db.prepare('DELETE FROM listings WHERE id = ?').run(Number(id));
    syncReadableExports();
  }
};

module.exports = { listingRepository };

