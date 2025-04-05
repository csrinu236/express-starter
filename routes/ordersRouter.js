const express = require('express');

const { authorizeUser } = require('../middlewares/authMiddleware');
const {
  getAllOrders,
  createOrder,
  getSingleOrder,
  updateSingleOrder,
  deleteSingleOrder,
} = require('../controllers/ordersController');
const ordersRouter = express.Router();

ordersRouter.get('/', authorizeUser, getAllOrders);
ordersRouter.post('/', authorizeUser, createOrder);

ordersRouter.get('/:orderId', authorizeUser, getSingleOrder);
ordersRouter.patch('/:orderId', authorizeUser, updateSingleOrder);
ordersRouter.delete('/:orderId', authorizeUser, deleteSingleOrder);

module.exports = { ordersRouter };
