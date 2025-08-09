const CustomError = require('../customError.js');
const { StatusCodes } = require('http-status-codes');
const CCCollection = require('../models/CC.js');
const { encrypt, decrypt, validateCardNumber } = require('../utils/ccUtils.js');

const getAllCards = async (req, res) => {
  const { userId } = req.user;

  let cards = await CCCollection.find({ userId })
    .select('-__v')
    // .sort({ createdAt: -1 })
    .sort({ orderIndex: 1 })
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

  const { valid, reason } = validateCardNumber(cardNumber, cardVariant, cvv);

  if (!valid) {
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
    lastFourDigits: cardNumber.slice(-4),
  });

  res.status(StatusCodes.OK).json({
    message: 'card successfully added',
    card,
  });
};

const addCardsBulk = async (req, res) => {
  const { userId } = req.user;
  const cards = req.body.cards; // Expecting an array of cards

  if (!Array.isArray(cards) || cards.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'No cards provided or invalid format',
    });
  }

  const insertedCards = cards.map((card, index) => {
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
    } = card;

    const { valid, reason } = validateCardNumber(cardNumber, cardVariant, cvv);
    if (!valid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Cards added successfully',
        reason,
      });
    }

    const encryptedNumber = encrypt(
      `${cardNumber}-${expiryMonth}-${expiryYear}-${cvv}`
    );

    return {
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
      orderIndex: index, // <- store insertion order
    };
  });

  // Insert all at once

  await CCCollection.deleteMany({ userId });
  const createdCards = await CCCollection.insertMany([...insertedCards]);
  console.log({ createdCards });

  res.status(StatusCodes.OK).json({
    message: 'Cards added successfully',
    count: createdCards.length,
    cards: createdCards,
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
  addCardsBulk,
};
