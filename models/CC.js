const mongoose = require('mongoose');

const CCSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'users-collection',
    required: true,
  },
  cardName: { type: String, required: true },
  bankName: {
    type: String,
    required: true,
    enum: [
      'Axis Bank',
      'ICICI Bank',
      'IDFC First Bank',
      'IndusInd Bank',
      'HDFC Bank',
      'SBI Bank',
      'Kotak Mahindra Bank',
      'CSB Bank',
      'RBL Bank',
      'HSBC Bank',
      'Bank Of Baroda',
    ], // extend as needed
  },
  encryptedNumber: { type: String, required: true },
  annualCharges: { type: Number, required: true },
  lastFourDigits: { type: Number, required: true },
  cardImageUrl: { type: String, required: true },
  billGenDate: {
    type: Number,
    required: true,
    min: [1, 'min 1 only'],
    max: [28, 'max 28 only'],
  },
  limit: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  orderIndex: {
    type: Number,
    required: true,
  },
});

// Enforce unique card per user based on last 4 digits
CCSchema.index({ userId: 1, lastFourDigits: 1 }, { unique: true });

const CCCollection = mongoose.model('cc-collection', CCSchema);
module.exports = CCCollection;
