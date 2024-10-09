const express = require('express');
const {
  login,
  register,
  logout,
  generateGoogleAuthLink,
  generateGithubAuthLink,
  verify,
} = require('../controllers/authController');
const authRouter = express.Router();

authRouter.post('/login', login);
authRouter.post('/verify', verify);
// Entry 1
authRouter.get('/google/login', generateGoogleAuthLink);
authRouter.get('/github/login', generateGithubAuthLink);
authRouter.post('/register', register);
authRouter.get('/logout', logout);

module.exports = { authRouter };
