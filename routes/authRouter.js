const express = require('express');
const { login, register, logout } = require('../controllers/authController');
const { showCurrentUser } = require('../controllers/usersController');
const { sessionChecker } = require('../middlewares/authMiddleware');
const appRouter = express.Router();

appRouter.post('/login', login);
appRouter.post('/register', register);
appRouter.get('/logout', sessionChecker, logout);
appRouter.get('/showMe', sessionChecker, showCurrentUser);

module.exports = { appRouter };
