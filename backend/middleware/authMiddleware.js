// backend/middleware/authMiddleware.js — JWT Doğrulama ve RBAC Rol Denetimi Ara Katmanı (1. Kişi - AA | AIR-42)
const { verifyJwt } = require('../auth');
const { db } = require('../db');

function extractAuthUser(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  const payload = verifyJwt(token);
  if (!payload || !payload.sub) return null;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub);
  if (!user || user.status === 'banned' || user.status === 'suspended') return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status
  };
}

function requireAuth(req) {
  const user = extractAuthUser(req);
  if (!user) {
    return {
      authorized: false,
      status: 401,
      error: 'Bu işlem için oturum açmanız (JWT Token) gerekmektedir.'
    };
  }
  return { authorized: true, user };
}

function requireRole(req, allowedRoles = []) {
  const check = requireAuth(req);
  if (!check.authorized) return check;
  if (!allowedRoles.includes(check.user.role)) {
    return {
      authorized: false,
      status: 403,
      error: `Yetkisiz erişim (RBAC). Bu işlem yalnızca [${allowedRoles.join(', ').toUpperCase()}] rolüne sahip kullanıcılar içindir.`
    };
  }
  return check;
}

module.exports = {
  extractAuthUser,
  requireAuth,
  requireRole
};

