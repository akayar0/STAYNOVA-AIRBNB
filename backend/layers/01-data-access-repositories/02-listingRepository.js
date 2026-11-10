const { db } = require('../../db');

const listingRepository = {
  findById(id) {
    return db.prepare('SELECT * FROM listings WHERE id = ?').get(id) || null;
  },

  getAllListings() {
    return db.prepare('SELECT * FROM listings ORDER BY id DESC').all();
  },

  getListingsByHost(hostId) {
    return db.prepare('SELECT * FROM listings WHERE host_id = ? ORDER BY id DESC').all(hostId);
  },

  createListing(data) {
    const stmt = db.prepare(`
      INSERT INTO listings (
        host_id, title, description, property_type, category_label,
        city, district, neighborhood, address, lat, lng,
        base_price, cleaning_fee, max_adults, max_children,
        bedrooms, beds, bathrooms,
        amenities_json, photos_json, seasonal_multipliers_json, blocked_dates_json,
        cancellation_policy, status, moderation_note, created_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `);

    const res = stmt.run(
      data.hostId,
      data.title,
      data.description,
      data.propertyType,
      data.categoryLabel,
      data.city,
      data.district,
      data.neighborhood || '',
      data.address,
      data.lat || 36.8969,
      data.lng || 30.7133,
      data.basePrice,
      data.cleaningFee || 0,
      data.maxAdults || 2,
      data.maxChildren || 1,
      data.bedrooms || 1,
      data.beds || 1,
      data.bathrooms || 1,
      data.amenitiesJson || '[]',
      data.photosJson || '[]',
      data.seasonalMultipliersJson || '[]',
      data.blockedDatesJson || '[]',
      data.cancellationPolicy || 'esnek',
      data.status || 'pending_approval',
      data.moderationNote || '',
      data.createdAt
    );

    return this.findById(res.lastInsertRowid);
  },

  updateListing(id, data) {
    const stmt = db.prepare(`
      UPDATE listings SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        property_type = COALESCE(?, property_type),
        category_label = COALESCE(?, category_label),
        city = COALESCE(?, city),
        district = COALESCE(?, district),
        neighborhood = COALESCE(?, neighborhood),
        address = COALESCE(?, address),
        base_price = COALESCE(?, base_price),
        cleaning_fee = COALESCE(?, cleaning_fee),
        max_adults = COALESCE(?, max_adults),
        max_children = COALESCE(?, max_children),
        bedrooms = COALESCE(?, bedrooms),
        beds = COALESCE(?, beds),
        bathrooms = COALESCE(?, bathrooms),
        amenities_json = COALESCE(?, amenities_json),
        photos_json = COALESCE(?, photos_json),
        seasonal_multipliers_json = COALESCE(?, seasonal_multipliers_json),
        blocked_dates_json = COALESCE(?, blocked_dates_json),
        cancellation_policy = COALESCE(?, cancellation_policy),
        status = COALESCE(?, status)
      WHERE id = ?
    `);

    stmt.run(
      data.title,
      data.description,
      data.propertyType,
      data.categoryLabel,
      data.city,
      data.district,
      data.neighborhood,
      data.address,
      data.basePrice,
      data.cleaningFee,
      data.maxAdults,
      data.maxChildren,
      data.bedrooms,
      data.beds,
      data.bathrooms,
      data.amenitiesJson,
      data.photosJson,
      data.seasonalMultipliersJson,
      data.blockedDatesJson,
      data.cancellationPolicy,
      data.status,
      id
    );

    return this.findById(id);
  },

  deleteListing(id) {
    return db.prepare('DELETE FROM listings WHERE id = ?').run(id);
  }
};

module.exports = { listingRepository };

