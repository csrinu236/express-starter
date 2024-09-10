const express = require('express');
const {
  login,
  register,
  logout,
  generateGoogleAuthLink,
  generateGithubAuthLink,
} = require('../controllers/authController');
const appRouter = express.Router();

appRouter.post('/login', login);
// Entry 1
appRouter.get('/google/login', generateGoogleAuthLink);
appRouter.get('/github/login', generateGithubAuthLink);
appRouter.post('/register', register);
appRouter.get('/logout', logout);

module.exports = { appRouter };
