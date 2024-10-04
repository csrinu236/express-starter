const express = require('express');
const {
  login,
  register,
  logout,
  generateGoogleAuthLink,
  generateGithubAuthLink,
} = require('../controllers/authController');
const authRouter = express.Router();

authRouter.post('/login', login);
// Entry 1
authRouter.get('/google/login', generateGoogleAuthLink);
authRouter.get('/github/login', generateGithubAuthLink);
authRouter.post('/register', register);
authRouter.get('/logout', logout);

module.exports = { authRouter };
