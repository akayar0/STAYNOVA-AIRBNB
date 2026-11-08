// backend/services/pricingAndAvailabilityService.js — İlan Zenginleştirme & Müsaitlik Çekirdeği
const { db } = require('../db');
const { CATEGORY_LABELS } = require('../config/constants');

function safeJsonParse(str, fallback = []) {
  if (!str) return fallback;
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function getDatesBetween(startDateStr, endDateStr) {
  const dates = [];
  const curr = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(curr.getTime()) || isNaN(end.getTime()) || curr >= end) return dates;
  while (curr < end) {
    dates.push(curr.toISOString().slice(0, 10));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

function enrichListing(row) {
  if (!row) return null;
  const amenities = safeJsonParse(row.amenities_json, []);
  const photos = safeJsonParse(row.photos_json, []);
  const seasonalMultipliers = safeJsonParse(row.seasonal_multipliers_json, []);
  const blockedDates = safeJsonParse(row.blocked_dates_json, []);

  // Aktif rezervasyonlardan dolu günleri de hesapla
  const resRows = db
    .prepare("SELECT check_in, check_out FROM reservations WHERE listing_id = ? AND status IN ('pending', 'confirmed')")
    .all(row.id);

  const bookedDates = [];
  for (const r of resRows) {
    bookedDates.push(...getDatesBetween(r.check_in, r.check_out));
  }

  const unavailableDates = Array.from(new Set([...blockedDates, ...bookedDates])).sort();
  const hostUser = db.prepare('SELECT id, name, email, phone, avatar, city FROM users WHERE id = ?').get(row.host_id);

  const coverPhotoObj = photos.find(p => p && p.isCover) || photos[0] || null;
  const coverPhoto = coverPhotoObj
    ? (typeof coverPhotoObj === 'string' ? coverPhotoObj : coverPhotoObj.url)
    : 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1000&auto=format&fit=crop&q=80';

  const basePrice = Number(row.base_price) || 2500;
  const rawDiscounted = row.discounted_price !== null && row.discounted_price !== undefined && row.discounted_price !== ''
    ? Number(row.discounted_price)
    : null;
  const hasDiscount = rawDiscounted !== null && rawDiscounted > 0 && rawDiscounted < basePrice;

  return {
    id: row.id,
    hostId: row.host_id,
    hostName: hostUser ? hostUser.name : 'Ev Sahibi',
    hostAvatar: hostUser ? hostUser.avatar : '',
    title: row.title,
    description: row.description,
    propertyType: row.property_type,
    categoryLabel: row.category_label || CATEGORY_LABELS[row.property_type] || 'Konut & Otel',
    city: row.city,
    district: row.district,
    neighborhood: row.neighborhood || '',
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    basePrice,
    discountedPrice: hasDiscount ? rawDiscounted : null,
    effectivePrice: hasDiscount ? rawDiscounted : basePrice,
    discountAmount: hasDiscount ? Math.round(basePrice - rawDiscounted) : 0,
    discountNote: hasDiscount ? (row.discount_note || 'Kısa Süreli İndirim') : '',
    lowest7DayAutoBadge: hasDiscount ? 'Son 7 günün en düşük fiyatı' : '',
    cleaningFee: Number(row.cleaning_fee) || 0,
    maxAdults: Number(row.max_adults) || 2,
    maxChildren: Number(row.max_children) || 0,
    maxGuests: (Number(row.max_adults) || 2) + (Number(row.max_children) || 0),
    bedrooms: Number(row.bedrooms) || 1,
    beds: Number(row.beds) || 1,
    bathrooms: Number(row.bathrooms) || 1,
    amenities,
    photos: photos.map((p, idx) =>
      typeof p === 'string'
        ? { url: p, caption: `Görsel ${idx + 1}`, isCover: idx === 0 }
        : { url: p.url, caption: p.caption || `Görsel ${idx + 1}`, isCover: Boolean(p.isCover || idx === 0) }
    ),
    coverPhoto,
    seasonalMultipliers,
    blockedDates,
    bookedDates,
    unavailableDates,
    cancellationPolicy: row.cancellation_policy || 'esnek',
    status: row.status || 'active',
    moderationNote: row.moderation_note || '',
    createdAt: row.created_at
  };
}

module.exports = {
  enrichListing,
  getDatesBetween,
  safeJsonParse
};

