const { verifyJwt } = require('../auth');
const { userRepository } = require('../layers/01-data-access-repositories/01-userRepository');

function authenticateRequest(req) {
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7).trim();
  const decoded = verifyJwt(token);
  if (!decoded || !decoded.sub) return null;

  const user = userRepository.findById(decoded.sub);
  if (!user || user.status === 'banned') return null;
  return user;
}

function requireRole(allowedRoles = []) {
  return function (req, user) {
    if (!user) {
      return { status: 401, error: 'Oturum açmanız gerekmektedir.' };
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return { status: 403, error: `Bu işlem için yetkiniz yok. Gerekli rol: ${allowedRoles.join(', ')}` };
    }
    return null;
  };
}

module.exports = { authenticateRequest, requireRole };

