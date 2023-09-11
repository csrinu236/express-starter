const express = require('express');
const {
  login,
  register,
  logout,
  addDevice,
  removeAllDevices,
} = require('../controllers/authController');
const { authorizeUser } = require('../middlewares/authMiddleware');
const appRouter = express.Router();

appRouter.post('/login', login);
appRouter.post('/register', register);
appRouter.get('/logout', authorizeUser, logout);
appRouter.post('/add-device', addDevice);
appRouter.post('/remove-all', removeAllDevices);

module.exports = { appRouter };
