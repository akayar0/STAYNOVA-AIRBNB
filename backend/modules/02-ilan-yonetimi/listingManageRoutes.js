// backend/modules/02-ilan-yonetimi/listingManageRoutes.js — KATMAN 4: İlan CRUD ve Takvim Rotaları (2. Kişi - AU | AIR-45)
const { listingController } = require('../../layers/03-presentation-controllers/02-listingController');

async function handleListingManageRoutes(req, pathname, method, parseBody, sendJson) {
  if (pathname === '/api/listings' && method === 'GET') {
    const result = listingController.handleGetAllListings();
    sendJson(result.status, result.data);
    return true;
  }

  if (pathname === '/api/listings/host' && method === 'GET') {
    const result = listingController.handleGetHostListings(req);
    sendJson(result.status, result.data);
    return true;
  }

  if (pathname === '/api/listings' && method === 'POST') {
    const body = await parseBody(req);
    const result = listingController.handleCreateListing(req, body);
    sendJson(result.status, result.data);
    return true;
  }

  const idMatch = pathname.match(/^\/api\/listings\/(\d+)$/);
  if (idMatch) {
    const listingId = Number(idMatch[1]);
    if (method === 'GET') {
      const result = listingController.handleGetListingById(listingId);
      sendJson(result.status, result.data);
      return true;
    }
    if (method === 'PUT') {
      const body = await parseBody(req);
      const result = listingController.handleUpdateListing(req, listingId, body);
      sendJson(result.status, result.data);
      return true;
    }
    if (method === 'DELETE') {
      const result = listingController.handleDeleteListing(req, listingId);
      sendJson(result.status, result.data);
      return true;
    }
  }

  return false;
}

module.exports = { handleListingManageRoutes };

