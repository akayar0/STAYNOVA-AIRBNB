const { listingService } = require('../02-business-logic-services/02-listingService');

const listingController = {
  handleCreateListing(req, res, body, authUser) {
    const result = listingService.createListing(authUser, body);
    res.writeHead(result.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.data));
  },
  handleUpdateListing(req, res, listingId, body, authUser) {
    const result = listingService.updateListing(authUser, listingId, body);
    res.writeHead(result.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.data));
  },
  handleDeleteListing(req, res, listingId, authUser) {
    const result = listingService.deleteListing(authUser, listingId);
    res.writeHead(result.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.data));
  },
  handleGetHostListings(req, res, authUser) {
    const result = listingService.getHostListings(authUser);
    res.writeHead(result.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.data));
  }
};

module.exports = { listingController };

