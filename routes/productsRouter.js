const express = require('express');
const {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateSingleProduct,
  deleteSingleProduct,
} = require('../controllers/productsController');
const {
  authorizeAdmin,
  authorizeUser,
} = require('../middlewares/authMiddleware');
const productsRouter = express.Router();

productsRouter.get('/', authorizeUser, getAllProducts);
productsRouter.post(
  '/',
  [authorizeUser, authorizeAdmin('admin')],
  createProduct
);

productsRouter.get('/:id', authorizeUser, getSingleProduct);
productsRouter.patch(
  '/:id',
  authorizeUser,
  authorizeAdmin('admin'),
  updateSingleProduct
);
productsRouter.delete(
  '/:id',
  authorizeUser,
  authorizeAdmin('admin'),
  deleteSingleProduct
);

module.exports = { productsRouter };
