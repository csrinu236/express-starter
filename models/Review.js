const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'please provide rating'],
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Please provide review title'],
      maxlength: 100,
    },
    comment: {
      type: String,
      trim: true,
      required: [true, 'Please enter comment'],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'users-collection', // not Schema name, collection name
      required: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: 'Products-Collection', // not Schema name, collection name
      required: true,
    },
  },
  { timestamps: true }
);

// one user can submit ONLY SINGLE review of a product
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

// setting user unique && review unique will not to do the job, I guess you can imagine
// WE want combined uniqueness or compound indexing

ReviewSchema.statics.calculateValues = async function (productId) {
  const result = await this.aggregate([
    // $<operator>: expression
    {
      $match: {
        // product: this.product, will NOT do the job because this is Class, not an instance
        product: productId,
      },
    },
    {
      $group: {
        _id: null,
        noOfReviews: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  const numOfReviews = result[0]?.noOfReviews || 0;
  const averageRating = result[0]?.avgRating.toFixed(1) || 0;

  await this.model('Products-Collection').findOneAndUpdate(
    { _id: productId },
    {
      averageRating,
      numOfReviews,
    }
  );
};

ReviewSchema.post(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    const productId = this.product;
    await this.constructor.calculateValues(productId);
  }
);

ReviewSchema.post(
  'save',
  { document: true, query: false },
  async function (next) {
    const productId = this.product;
    await this.constructor.calculateValues(productId);
  }
);

const ReviewsCollection = mongoose.model('Reviews-Collection', ReviewSchema);
module.exports = ReviewsCollection;
