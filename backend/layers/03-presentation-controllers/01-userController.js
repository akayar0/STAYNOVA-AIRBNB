// backend/layers/03-presentation-controllers/01-userController.js — KATMAN 3: Kullanıcı Kontrolcü Katmanı (1. Kişi - AA | AIR-42)
const { userService } = require('../02-business-logic-services/01-userService');
const { extractAuthUser } = require('../../middleware/authMiddleware');

const userController = {
  handleRegister(req, body) {
    return userService.registerUser(body);
  },

  handleLogin(req, body) {
    return userService.loginUser(body);
  },

  handleGetProfile(req) {
    const authUser = extractAuthUser(req);
    return userService.getProfile(authUser);
  },

  handleUpdateProfile(req, body) {
    const authUser = extractAuthUser(req);
    return userService.updateProfile(authUser, body);
  }
};

module.exports = { userController };

