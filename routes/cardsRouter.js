const express = require('express');
const {
  addCard,
  deleteCard,
  getAllCards,
} = require('../controllers/cardsController');
const { authorizeUser } = require('../middlewares/authMiddleware');
const cardsRouter = express.Router();

cardsRouter.post('/addcard', authorizeUser, addCard);
cardsRouter.delete('/deletecard/:cardId', authorizeUser, deleteCard);
cardsRouter.get('/getall', authorizeUser, getAllCards);

module.exports = { cardsRouter };
