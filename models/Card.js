const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'users-collection',
    required: true,
  },
  loanTaken: {
    type: Number,
    required: true,
    min: [0, 'Loan amount cannot be negative'],
    max: [100000000, 'Loan amount is too large'],
  },
  interest: {
    type: Number,
    required: true,
    min: [0, 'Interest rate cannot be negative'],
    max: [100, 'Interest rate cannot exceed 100%'],
  },
  months: {
    type: Number,
    required: true,
    min: [1, 'Number of months must be at least 1'],
    max: [600, 'Number of months cannot exceed 600 (50 years)'],
  },
  processingFee: {
    type: Number,
    default: 0, // Optional, defaulting to 0 if not provided
    min: [0, 'Processing fee cannot be negative'],
  },
  emiType: {
    type: String,
    required: true,
    enum: ['noCost', 'interest'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

cardSchema.index(
  { loanTaken: 1, interest: 1, months: 1, processingFee: 1, emiType: 1 },
  { unique: true }
);

const CardsCollection = mongoose.model('cards-collection', cardSchema);
module.exports = CardsCollection;
