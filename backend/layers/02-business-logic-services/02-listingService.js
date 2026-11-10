const { listingRepository } = require('../01-data-access-repositories/02-listingRepository');
const { CATEGORY_LABELS } = require('../../config/constants');
const { enrichListing } = require('../../services/pricingAndAvailabilityService');

const listingService = {
  createListing(authUser, body) {
    if (!authUser || !['host', 'admin'].includes(authUser.role)) {
      return { status: 403, data: { error: 'İlan oluşturmak için Ev Sahibi (Host) yetkisi gereklidir.' } };
    }
    if (!body.title || !body.city || !body.district || !body.basePrice) {
      return { status: 400, data: { error: 'Başlık, İl, İlçe ve Gecelik Fiyat alanları zorunludur.' } };
    }

    const propType = body.propertyType || 'daire';
    const created = listingRepository.createListing({
      hostId: authUser.id,
      title: body.title.trim(),
      description: body.description || '',
      propertyType: propType,
      categoryLabel: CATEGORY_LABELS[propType] || 'Konut & Otel',
      city: body.city.trim(),
      district: body.district.trim(),
      neighborhood: body.neighborhood || '',
      address: body.address || '',
      basePrice: Number(body.basePrice) || 2500,
      cleaningFee: Number(body.cleaningFee) || 400,
      maxAdults: Number(body.maxAdults) || 2,
      maxChildren: Number(body.maxChildren) || 1,
      bedrooms: Number(body.bedrooms) || 1,
      beds: Number(body.beds) || 1,
      bathrooms: Number(body.bathrooms) || 1,
      amenitiesJson: JSON.stringify(body.amenities || []),
      photosJson: JSON.stringify(body.photos || []),
      seasonalMultipliersJson: JSON.stringify(body.seasonalMultipliers || []),
      blockedDatesJson: JSON.stringify(body.blockedDates || []),
      cancellationPolicy: body.cancellationPolicy || 'esnek',
      status: 'pending_approval',
      moderationNote: 'Yönetici (Admin) moderasyon onayı bekleniyor.',
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
    const existing = listingRepository.findById(listingId);
    if (!existing) return { status: 404, data: { error: 'İlan bulunamadı.' } };
    if (existing.host_id !== authUser.id && authUser.role !== 'admin') {
      return { status: 403, data: { error: 'Bu ilanı düzenleme yetkiniz bulunmamaktadır.' } };
    }

    const propType = body.propertyType || existing.property_type;
    const updated = listingRepository.updateListing(listingId, {
      title: body.title,
      description: body.description,
      propertyType: propType,
      categoryLabel: CATEGORY_LABELS[propType] || existing.category_label,
      city: body.city,
      district: body.district,
      neighborhood: body.neighborhood,
      address: body.address,
      basePrice: body.basePrice ? Number(body.basePrice) : undefined,
      cleaningFee: body.cleaningFee ? Number(body.cleaningFee) : undefined,
      maxAdults: body.maxAdults ? Number(body.maxAdults) : undefined,
      maxChildren: body.maxChildren ? Number(body.maxChildren) : undefined,
      bedrooms: body.bedrooms ? Number(body.bedrooms) : undefined,
      beds: body.beds ? Number(body.beds) : undefined,
      bathrooms: body.bathrooms ? Number(body.bathrooms) : undefined,
      amenitiesJson: body.amenities ? JSON.stringify(body.amenities) : undefined,
      photosJson: body.photos ? JSON.stringify(body.photos) : undefined,
      seasonalMultipliersJson: body.seasonalMultipliers ? JSON.stringify(body.seasonalMultipliers) : undefined,
      blockedDatesJson: body.blockedDates ? JSON.stringify(body.blockedDates) : undefined,
      cancellationPolicy: body.cancellationPolicy
    });

    return { status: 200, data: { message: 'İlan başarıyla güncellendi.', listing: enrichListing(updated) } };
  },

  deleteListing(authUser, listingId) {
    const existing = listingRepository.findById(listingId);
    if (!existing) return { status: 404, data: { error: 'İlan bulunamadı.' } };
    if (existing.host_id !== authUser.id && authUser.role !== 'admin') {
      return { status: 403, data: { error: 'Bu ilanı silme yetkiniz bulunmamaktadır.' } };
    }
    listingRepository.deleteListing(listingId);
    return { status: 200, data: { message: 'İlan sistemden kaldırıldı.' } };
  },

  getHostListings(authUser) {
    if (!authUser || !['host', 'admin'].includes(authUser.role)) {
      return { status: 403, data: { error: 'Yetkisiz erişim.' } };
    }
    const listings = listingRepository.getListingsByHost(authUser.id).map(enrichListing);
    return { status: 200, data: { listings } };
  }
};

module.exports = { listingService };

