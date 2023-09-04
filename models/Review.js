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

// setting user unique && review unique will not to do the job, I guess you can imagine
// WE want combined uniqueness or compound indexing

ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

const ReviewsCollection = mongoose.model('Reviews-Collection', ReviewSchema);
module.exports = ReviewsCollection;
