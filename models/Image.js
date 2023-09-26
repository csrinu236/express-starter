const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema(
  {
    src: {
      type: String,
      trim: true,
      required: [true, 'Please provide product image src'],
      unique: true,
    },
  },
  { timestamps: true }
);

const ImagesCollection = mongoose.model('Images-Collection', ImageSchema);
module.exports = ImagesCollection;
