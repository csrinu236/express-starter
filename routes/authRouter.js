const express = require('express');
const {
  logout,
  generateGoogleAuthLink,
} = require('../controllers/authController');
const { authorizeUser } = require('../middlewares/authMiddleware');
const authRouter = express.Router();

authRouter.get('/logout', logout);
authRouter.get('/google/login', generateGoogleAuthLink);
authRouter.get('/user', authorizeUser, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = { authRouter };
