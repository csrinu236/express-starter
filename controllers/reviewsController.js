const { StatusCodes } = require('http-status-codes');
const CustomError = require('../customError');
const ProductsCollection = require('../models/Product');
const ReviewsCollection = require('../models/Review');
const { checkPermission } = require('../utils');

const createReview = async (req, res) => {
  const productId = req.body.productId;
  const product = await ProductsCollection.findOne({ _id: productId });
  if (!product) {
    throw new CustomError('no product found', StatusCodes.NOT_FOUND);
  }
  const alreadyReviewed = await ReviewsCollection.findOne({
    product: productId,
    user: req.user.userId,
  });
  if (alreadyReviewed) {
    throw new CustomError(
      'already reviewd for this product',
      StatusCodes.BAD_REQUEST
    );
  }

  req.body.product = productId;
  req.body.user = req.user.userId;

  const review = await ReviewsCollection.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

// overall reviews for admins only
const getAllReviews = async (req, res) => {
  const reviews = await ReviewsCollection.find({})
    .populate({
      path: 'product',
      select: 'name',
    })
    .populate({
      path: 'user',
      select: 'name',
    });
  res.json({ reviews }).status(StatusCodes.OK);
};

// We can also write a controller to get all reviews associated with a single
// productId(think about amazon website)
const getSingleProductAllReviews = async (req, res) => {
  const productId = req.params.id;
  const review = await ReviewsCollection.findOne({ product: productId });
  if (!review) {
    throw new CustomError(
      'no review found with this id',
      StatusCodes.BAD_REQUEST
    );
  }
  const reviews = await ReviewsCollection.find({ product: productId });
  res.json({ reviews }).status(StatusCodes.OK);
};

// get single review based on review id
const getSingleReview = async (req, res) => {
  const reviewId = req.params.id;
  const review = await ReviewsCollection.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError('no review found', StatusCodes.BAD_REQUEST);
  }
  res.json({ review }).status(StatusCodes.OK);
};

const updateReview = async (req, res) => {
  const reviewId = req.params.id;
  const review = await ReviewsCollection.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError('no review found', StatusCodes.BAD_REQUEST);
  }
  checkPermission(review.user, req.user);
  const { rating, title, comment } = req.body;
  review.rating = rating;
  // review.title = title;
  // review.comment = comment;

  // We are going with this instead of findOneAndUpdate() because
  await review.save(); // this will trigger pre save Hook where we can update the avg
  // reviews and no.of reviews of the single product
  res.status(StatusCodes.OK).json({ msg: 'review updated' });
};

const deleteReview = async (req, res) => {
  const reviewId = req.params.id;

  const review = await ReviewsCollection.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError('no review found', StatusCodes.BAD_REQUEST);
  }

  checkPermission(review.user, req.user);

  // We are going with this instead of findOneAndDelete() because
  // await review.remove(); // this will trigger pre delete Hook where we can update the avg
  await review.deleteOne(); // this will trigger pre delete Hook where we can update the avg
  // reviews and no.of reviews of the single product
  res.status(StatusCodes.OK).json({ review });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  getSingleProductAllReviews,
  deleteReview,
};
