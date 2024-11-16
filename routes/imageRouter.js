const express = require('express');
const { imageUpload } = require('../controllers/imageController');
const { authorizeUser } = require('../middlewares/authMiddleware');
const imageRouter = express.Router();

imageRouter.post('/upload', authorizeUser, imageUpload);

module.exports = { imageRouter };
