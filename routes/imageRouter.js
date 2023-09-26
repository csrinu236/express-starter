const express = require('express');
const { imageUpload } = require('../controllers/imageController');
const imageRouter = express.Router();

imageRouter.post('/upload', imageUpload);

module.exports = { imageRouter };
