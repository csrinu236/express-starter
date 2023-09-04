const express = require('express');
const {
  getAllReviews,
  getSingleReview,
  createReview,
  deleteReview,
  updateReview,
  getSingleProductAllReviews,
} = require('../controllers/reviewsController');
const {
  authorizeAdmin,
  authorizeUser,
} = require('../middlewares/authMiddleware');

const reviewsRouter = express.Router();

reviewsRouter.get('/', authorizeUser, authorizeAdmin('admin'), getAllReviews);
reviewsRouter.post('/', authorizeUser, createReview);

reviewsRouter.get('/:id/reviews', getSingleProductAllReviews);

reviewsRouter.get('/:id', authorizeUser, getSingleReview);
reviewsRouter.delete('/:id', authorizeUser, deleteReview);
reviewsRouter.patch('/:id', authorizeUser, updateReview);

module.exports = { reviewsRouter };
