const express = require('express');
const {
  login,
  register,
  logout,
  generateGoogleAuthLink,
  generateGithubAuthLink,
  user,
  verify,
} = require('../controllers/authController');
const { authorizeUser } = require('../middlewares/authMiddleware');
const authRouter = express.Router();

authRouter.get('/user', authorizeUser, user);
authRouter.post('/login', login);
authRouter.post('/verify', verify);
// Entry 1
authRouter.get('/google/login', generateGoogleAuthLink);
authRouter.get('/github/login', generateGithubAuthLink);
authRouter.post('/register', register);
authRouter.get('/logout', logout);

module.exports = { authRouter };
