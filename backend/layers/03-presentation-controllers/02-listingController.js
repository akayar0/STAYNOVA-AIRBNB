// backend/layers/03-presentation-controllers/02-listingController.js — KATMAN 3: İlan Kontrolcü Katmanı (2. Kişi - AU | AIR-45)
const { listingService } = require('../02-business-logic-services/02-listingService');
const { extractAuthUser } = require('../../middleware/authMiddleware');

const listingController = {
  handleGetAllListings() {
    return listingService.getAllListings();
  },

  handleGetHostListings(req) {
    const authUser = extractAuthUser(req);
    return listingService.getHostListings(authUser);
  },

  handleGetListingById(listingId) {
    return listingService.getListingById(listingId);
  },

  handleCreateListing(req, body) {
    const authUser = extractAuthUser(req);
    return listingService.createListing(authUser, body);
  },

  handleUpdateListing(req, listingId, body) {
    const authUser = extractAuthUser(req);
    return listingService.updateListing(authUser, listingId, body);
  },

  handleDeleteListing(req, listingId) {
    const authUser = extractAuthUser(req);
    return listingService.deleteListing(authUser, listingId);
  }
};

module.exports = { listingController };

