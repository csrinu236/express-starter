const express = require('express');
const {
  addCard,
  deleteCard,
  getAllCards,
} = require('../controllers/creditCardController');
const { authorizeUser } = require('../middlewares/authMiddleware');
const ccRouter = express.Router();

ccRouter.post('/addcard', authorizeUser, addCard);
ccRouter.delete('/deletecard/:cardId', authorizeUser, deleteCard);
ccRouter.get('/getall', authorizeUser, getAllCards);

module.exports = { ccRouter };
