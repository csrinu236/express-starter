const express = require('express');
const { login, register, logout } = require('../controllers/authController');
const appRouter = express.Router();

appRouter.post('/login', login);
appRouter.post('/register', register);
appRouter.get('/logout', logout);

module.exports = { appRouter };
