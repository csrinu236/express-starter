const mongoose = require('mongoose');
const ReviewsCollection = require('./Review');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide product name'],
      maxlength: [100, 'Name can not be more than 100 characters'],
      unique: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      default: 0,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      maxlength: [1000, 'Description can not be more than 1000 characters'],
    },
    // category: {
    //   type: String,
    //   required: [true, 'Please provide product category'],
    //   enum: ['office', 'kitchen', 'bedroom'],
    //   default: 'office',
    // },
    // company: {
    //   type: String,
    //   required: [true, 'Please provide company'],
    //   enum: {
    //     values: ['ikea', 'amazon', 'flipkart'],
    //     message: '{VALUE} is not supported',
    //   },
    // },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'UserSchema',
      required: true,
    },
    // colors: {
    //   type: [String],
    //   default: ['#222'],
    //   required: true,
    // },
    // featured: {
    //   type: Boolean,
    //   default: false,
    // },
    // freeShipping: {
    //   type: Boolean,
    //   default: false,
    // },
    // inventory: {
    //   type: Number,
    //   required: true,
    //   default: 15,
    // },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
  },
  // { timestamps: true } //adds created at flags on the flys
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } } // configuring this model to accpet vritual
);

// How to get all reviews associated with a single product
// const productId = req.params.id;
// ReviewsCollection.findOne({product: productId})
// total 3 things
// 1)ReviewsCollection, 2)product(field in ReviewSchema) 3)productId(value from req.params.id)
// we just utilize these 3 things

// ProductsCollection.findOne({}).populate('allreviews')

ProductSchema.virtual('allreviews', {
  ref: 'Reviews-Collection', // Collection-name, you have to search for this collection
  foreignField: 'product',
  localField: '_id',
  justOne: false, // we want many reviews, not justOne
  // match: { rating: 5 }, // filter the population, I only want reviews with rating=5
});

ProductSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    try {
      const manyReviews = await this.model('Reviews-Collection').deleteMany({
        product: this._id,
      });
      next();
    } catch (error) {
      next(error);
    }
  }
);

// Make sure that you've added everything you want to schema,
// including hooks, before calling.model()!
const ProductsCollection = mongoose.model('Products-Collection', ProductSchema);
module.exports = ProductsCollection;
