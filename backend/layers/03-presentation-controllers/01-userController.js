const { userService } = require('../02-business-logic-services/01-userService');

const userController = {
  handleRegister(req, res, body) {
    const result = userService.registerUser(body);
    res.writeHead(result.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.data));
  },
  handleLogin(req, res, body) {
    const result = userService.loginUser(body);
    res.writeHead(result.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.data));
  },
  handleUpdateProfile(req, res, body, authUser) {
    const result = userService.updateProfile(authUser, body);
    res.writeHead(result.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.data));
  }
};

module.exports = { userController };

