const { listingController } = require('../../layers/03-presentation-controllers/02-listingController');
const { authenticateRequest } = require('../../middleware/authMiddleware');

function handleListingManageRoutes(req, res, pathname, body) {
  if (req.method === 'POST' && pathname === '/api/listings') {
    const authUser = authenticateRequest(req);
    return listingController.handleCreateListing(req, res, body, authUser);
  }
  if (req.method === 'GET' && pathname === '/api/host/listings') {
    const authUser = authenticateRequest(req);
    return listingController.handleGetHostListings(req, res, authUser);
  }
  const matchUpdate = pathname.match(/^\/api\/listings\/(\d+)$/);
  if (matchUpdate) {
    const listingId = Number(matchUpdate[1]);
    const authUser = authenticateRequest(req);
    if (req.method === 'PUT') {
      return listingController.handleUpdateListing(req, res, listingId, body, authUser);
    }
    if (req.method === 'DELETE') {
      return listingController.handleDeleteListing(req, res, listingId, authUser);
    }
  }
  return false;
}

module.exports = { handleListingManageRoutes };

