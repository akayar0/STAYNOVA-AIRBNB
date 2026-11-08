// backend/modules/01-kullanici-yonetimi/userRoutes.js — KATMAN 4: Kullanıcı & Auth Rotaları (1. Kişi - AA | AIR-42)
const { userController } = require('../../layers/03-presentation-controllers/01-userController');

async function handleUserRoutes(req, pathname, method, parseBody, sendJson) {
  if (pathname === '/api/auth/register' && method === 'POST') {
    const body = await parseBody(req);
    const result = userController.handleRegister(req, body);
    sendJson(result.status, result.data);
    return true;
  }

  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = await parseBody(req);
    const result = userController.handleLogin(req, body);
    sendJson(result.status, result.data);
    return true;
  }

  if ((pathname === '/api/users/me' || pathname === '/api/users/profile') && method === 'GET') {
    const result = userController.handleGetProfile(req);
    sendJson(result.status, result.data);
    return true;
  }

  if (pathname === '/api/users/profile' && method === 'PUT') {
    const body = await parseBody(req);
    const result = userController.handleUpdateProfile(req, body);
    sendJson(result.status, result.data);
    return true;
  }

  return false;
}

module.exports = { handleUserRoutes };

