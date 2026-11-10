const { userController } = require('../../layers/03-presentation-controllers/01-userController');
const { authenticateRequest } = require('../../middleware/authMiddleware');

function handleUserRoutes(req, res, pathname, body) {
  if (req.method === 'POST' && pathname === '/api/auth/register') {
    return userController.handleRegister(req, res, body);
  }
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    return userController.handleLogin(req, res, body);
  }
  if (req.method === 'PUT' && pathname === '/api/users/profile') {
    const authUser = authenticateRequest(req);
    return userController.handleUpdateProfile(req, res, body, authUser);
  }
  return false;
}

module.exports = { handleUserRoutes };

