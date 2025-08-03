const CustomError = require('../customError.js');
const { StatusCodes } = require('http-status-codes');
const CCCollection = require('../models/CC.js');
const { encrypt, decrypt, validateCardNumber } = require('../utils/ccUtils.js');

const getAllCards = async (req, res) => {
  const { userId } = req.user;

  let cards = await CCCollection.find({ userId })
    .select('-__v')
    .sort({ createdAt: -1 })
    .lean();

  cards = cards.map((c) => {
    return {
      ...c,
      cardNumber: decrypt(c.encryptedNumber),
      encryptedNumber: undefined,
    };
  });

  res.status(StatusCodes.OK).json({
    cards,
  });
};

const addCard = async (req, res) => {
  const { userId } = req.user;

  const {
    cardNumber,
    expiryMonth,
    expiryYear,
    cardImageUrl,
    bankName,
    cardVariant,
    limit,
    billGenDate,
    annualCharges,
    cardName,
    cvv,
  } = req.body;

  const { isValid, reason } = validateCardNumber(cardNumber, cardVariant, cvv);

  if (!isValid) {
    return res.status(StatusCodes.OK).json({
      reason,
    });
  }

  const encryptedNumber = encrypt(
    `${cardNumber}-${expiryMonth}-${expiryYear}-${cvv}`
  );

  const card = await CCCollection.create({
    userId,
    encryptedNumber,
    cardImageUrl,
    bankName,
    cardVariant,
    limit,
    billGenDate,
    annualCharges,
    cardName,
    cvv,
    lastFourDigits: cardNumber.slice(-4),
  });

  res.status(StatusCodes.OK).json({
    message: 'card successfully added',
    card,
  });
};

const deleteCard = async (req, res) => {
  const { cardId } = req.params;

  const card = await CCCollection.findOneAndDelete(
    { _id: cardId },
    {
      new: true,
    }
  );

  res.status(StatusCodes.CREATED).json({
    msg: 'Card removed',
    card,
  });
};

module.exports = {
  deleteCard,
  addCard,
  getAllCards,
};
