// backend/layers/02-business-logic-services/02-listingService.js — KATMAN 2: İlan CRUD ve Görsel Servisi (2. Kişi - AU | AIR-45)
const { listingRepository } = require('../01-data-access-repositories/02-listingRepository');
const { CATEGORY_LABELS } = require('../../config/constants');
const { enrichListing } = require('../../services/pricingAndAvailabilityService');

const listingService = {
  getAllListings() {
    const rows = listingRepository.findAll();
    return {
      status: 200,
      data: {
        listings: rows.map(enrichListing)
      }
    };
  },

  getHostListings(authUser) {
    if (!authUser) {
      return { status: 401, data: { error: 'Oturum açmanız gerekmektedir.' } };
    }
    const rows = authUser.role === 'admin'
      ? listingRepository.findAll()
      : listingRepository.findByHostId(authUser.id);
    return {
      status: 200,
      data: {
        listings: rows.map(enrichListing)
      }
    };
  },

  getListingById(id) {
    const row = listingRepository.findById(id);
    if (!row) return { status: 404, data: { error: 'İlan bulunamadı.' } };
    return { status: 200, data: { listing: enrichListing(row) } };
  },

  createListing(authUser, body) {
    if (!authUser || !['host', 'admin'].includes(authUser.role)) {
      return { status: 403, data: { error: 'İlan oluşturmak için Ev Sahibi (Host) yetkisi gereklidir.' } };
    }
    if (!body.title || !body.city || !body.district) {
      return { status: 400, data: { error: 'İlan başlığı, il ve ilçe alanları zorunludur.' } };
    }
    const propType = body.propertyType || 'daire';
    const created = listingRepository.createListing({
      hostId: authUser.id,
      title: String(body.title).trim(),
      description: String(body.description || '').trim(),
      propertyType: propType,
      categoryLabel: CATEGORY_LABELS[propType] || 'Konut & Otel',
      city: String(body.city).trim(),
      district: String(body.district).trim(),
      neighborhood: String(body.neighborhood || '').trim(),
      address: String(body.address || `${body.district}, ${body.city}`).trim(),
      basePrice: Number(body.basePrice) || 2500,
      discountedPrice: body.discountedPrice ? Number(body.discountedPrice) : null,
      discountNote: body.discountNote || '',
      cleaningFee: Number(body.cleaningFee) || 0,
      maxAdults: Number(body.maxAdults) || 2,
      maxChildren: Number(body.maxChildren) || 0,
      bedrooms: Number(body.bedrooms) || 1,
      beds: Number(body.beds) || 1,
      bathrooms: Number(body.bathrooms) || 1,
      amenitiesJson: JSON.stringify(body.amenities || []),
      photosJson: JSON.stringify(body.photos || []),
      seasonalMultipliersJson: JSON.stringify(body.seasonalMultipliers || []),
      blockedDatesJson: JSON.stringify(body.blockedDates || []),
      cancellationPolicy: body.cancellationPolicy || 'esnek',
      status: body.requireModeration === false ? 'active' : 'pending_approval',
      moderationNote: body.requireModeration === false ? 'Yayında' : 'Yönetici (Admin) moderasyon onayı bekleniyor.',
      createdAt: new Date().toISOString()
    });
    return {
      status: 201,
      data: {
        message: 'İlanınız oluşturuldu ve Moderasyon Onayı için yöneticiye iletildi.',
        listing: enrichListing(created)
      }
    };
  },

  updateListing(authUser, listingId, body) {
    if (!authUser || !['host', 'admin'].includes(authUser.role)) {
      return { status: 403, data: { error: 'İlan düzenlemek için Ev Sahibi yetkisi gereklidir.' } };
    }
    const existing = listingRepository.findById(listingId);
    if (!existing) {
      return { status: 404, data: { error: 'Güncellenecek ilan bulunamadı.' } };
    }
    if (authUser.role !== 'admin' && existing.host_id !== authUser.id) {
      return { status: 403, data: { error: 'Yalnızca kendi oluşturduğunuz ilanları düzenleyebilirsiniz.' } };
    }

    const currentEnriched = enrichListing(existing);
    const propType = body.propertyType || currentEnriched.propertyType;

    const updated = listingRepository.updateListing(existing.id, {
      title: body.title !== undefined ? String(body.title).trim() : currentEnriched.title,
      description: body.description !== undefined ? String(body.description).trim() : currentEnriched.description,
      propertyType: propType,
      categoryLabel: CATEGORY_LABELS[propType] || 'Konut & Otel',
      city: body.city !== undefined ? String(body.city).trim() : currentEnriched.city,
      district: body.district !== undefined ? String(body.district).trim() : currentEnriched.district,
      neighborhood: body.neighborhood !== undefined ? String(body.neighborhood).trim() : currentEnriched.neighborhood,
      address: body.address !== undefined ? String(body.address).trim() : currentEnriched.address,
      basePrice: body.basePrice !== undefined ? Number(body.basePrice) : currentEnriched.basePrice,
      discountedPrice: body.discountedPrice !== undefined
        ? (body.discountedPrice ? Number(body.discountedPrice) : null)
        : currentEnriched.discountedPrice,
      discountNote: body.discountNote !== undefined ? String(body.discountNote) : currentEnriched.discountNote,
      cleaningFee: body.cleaningFee !== undefined ? Number(body.cleaningFee) : currentEnriched.cleaningFee,
      maxAdults: body.maxAdults !== undefined ? Number(body.maxAdults) : currentEnriched.maxAdults,
      maxChildren: body.maxChildren !== undefined ? Number(body.maxChildren) : currentEnriched.maxChildren,
      bedrooms: body.bedrooms !== undefined ? Number(body.bedrooms) : currentEnriched.bedrooms,
      beds: body.beds !== undefined ? Number(body.beds) : currentEnriched.beds,
      bathrooms: body.bathrooms !== undefined ? Number(body.bathrooms) : currentEnriched.bathrooms,
      amenitiesJson: JSON.stringify(body.amenities !== undefined ? body.amenities : currentEnriched.amenities),
      photosJson: JSON.stringify(body.photos !== undefined ? body.photos : currentEnriched.photos),
      seasonalMultipliersJson: JSON.stringify(
        body.seasonalMultipliers !== undefined ? body.seasonalMultipliers : currentEnriched.seasonalMultipliers
      ),
      blockedDatesJson: JSON.stringify(
        body.blockedDates !== undefined ? body.blockedDates : currentEnriched.blockedDates
      ),
      cancellationPolicy: body.cancellationPolicy || currentEnriched.cancellationPolicy,
      status: body.status || currentEnriched.status,
      moderationNote: body.moderationNote !== undefined ? body.moderationNote : currentEnriched.moderationNote
    });

    return {
      status: 200,
      data: {
        message: 'İlan bilgileri ve müsaitlik takvimi başarıyla güncellendi.',
        listing: enrichListing(updated)
      }
    };
  },

  deleteListing(authUser, listingId) {
    if (!authUser || !['host', 'admin'].includes(authUser.role)) {
      return { status: 403, data: { error: 'İlan silmek için Ev Sahibi yetkisi gereklidir.' } };
    }
    const existing = listingRepository.findById(listingId);
    if (!existing) {
      return { status: 404, data: { error: 'Silinecek ilan bulunamadı.' } };
    }
    if (authUser.role !== 'admin' && existing.host_id !== authUser.id) {
      return { status: 403, data: { error: 'Yalnızca kendi ilanınızı silebilirsiniz.' } };
    }
    listingRepository.deleteListing(existing.id);
    return {
      status: 200,
      data: { message: `"${existing.title}" ilanı sistemden kalıcı olarak silindi.` }
    };
  }
};

module.exports = { listingService };

