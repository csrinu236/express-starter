const express = require('express');
const {
  login,
  register,
  logout,
  checkUser,
} = require('../controllers/authController');
const { authorizeUser } = require('../middlewares/authMiddleware');
const appRouter = express.Router();

appRouter.post('/login', login);
appRouter.post('/register', register);
appRouter.get('/logout', logout);
appRouter.get('/checkuser', authorizeUser, checkUser);

module.exports = { appRouter };
