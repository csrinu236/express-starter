const CustomError = require('../customError.js');
const { StatusCodes } = require('http-status-codes');
const CCCollection = require('../models/CC.js');
const { encrypt, decrypt, validateCardNumber } = require('../utils/ccUtils.js');

const sendCardInputError = (res, code, message, fieldErrors, status = StatusCodes.BAD_REQUEST) =>
  res.status(status).json({ code, message, fieldErrors });

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
    cardholderName,
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
  } = req.body || {};

  const fieldErrors = {};
  const requiredText = {
    cardholderName,
    cardName,
    bankName,
    cardVariant,
    cardNumber,
    cvv,
    cardImageUrl,
  };

  for (const [field, value] of Object.entries(requiredText)) {
    if (typeof value !== 'string' || !value.trim()) {
      fieldErrors[field] = 'This field is required.';
    }
  }

  if (typeof cardholderName === 'string' && cardholderName.trim().length > 120) {
    fieldErrors.cardholderName = 'Cardholder name must be 120 characters or fewer.';
  }
  if (typeof cardName === 'string' && cardName.trim().length > 120) {
    fieldErrors.cardName = 'Card name must be 120 characters or fewer.';
  }
  if (typeof cardImageUrl === 'string' && cardImageUrl.trim().length > 2048) {
    fieldErrors.cardImageUrl = 'Image URL is too long.';
  }

  const allowedBanks = CCCollection.schema.path('bankName').enumValues;
  const allowedVariants = CCCollection.schema.path('cardVariant').enumValues;
  if (bankName && !allowedBanks.includes(bankName)) {
    fieldErrors.bankName = 'Choose a supported bank.';
  }
  if (cardVariant && !allowedVariants.includes(cardVariant)) {
    fieldErrors.cardVariant = 'Choose a supported card network.';
  }

  const month = Number(expiryMonth);
  const year = Number(expiryYear);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    fieldErrors.expiryMonth = 'Choose a valid expiry month.';
  }
  if (!Number.isInteger(year) || year < currentYear || year > 2100) {
    fieldErrors.expiryYear = 'Choose a valid expiry year.';
  } else if (
    Number.isInteger(month) && month >= 1 && month <= 12 &&
    year === currentYear && month < currentMonth
  ) {
    fieldErrors.expiryMonth = 'This card is expired. Choose a valid expiry date.';
  }

  const cardLimit = Number(limit);
  if (
    limit === undefined || limit === null || String(limit).trim() === '' ||
    !Number.isFinite(cardLimit) || cardLimit < 0
  ) {
    fieldErrors.limit = 'Enter a valid non-negative limit.';
  }
  const charges = Number(annualCharges);
  if (
    annualCharges === undefined || annualCharges === null || String(annualCharges).trim() === '' ||
    !Number.isFinite(charges) || charges < 0
  ) {
    fieldErrors.annualCharges = 'Enter valid non-negative annual charges.';
  }
  const billDate = Number(billGenDate);
  if (!Number.isInteger(billDate) || billDate < 1 || billDate > 28) {
    fieldErrors.billGenDate = 'Bill generation day must be between 1 and 28.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    let code = 'INVALID_CARD_DETAILS';
    let message = 'Check the highlighted fields and try again.';

    if (cardVariant && !allowedVariants.includes(cardVariant)) {
      code = 'UNSUPPORTED_CARD_VARIANT';
      message = 'Choose a supported card network.';
    } else if (bankName && !allowedBanks.includes(bankName)) {
      code = 'UNSUPPORTED_BANK';
      message = 'Choose a supported bank.';
    } else if (fieldErrors.expiryMonth?.startsWith('This card is expired')) {
      code = 'CARD_EXPIRED';
      message = 'This card is expired. Enter a valid expiry date.';
    }

    return sendCardInputError(
      res,
      code,
      message,
      fieldErrors
    );
  }

  const { valid, reason } = validateCardNumber(cardNumber, cardVariant, cvv);
  if (!valid) {
    const cvvError = reason.toLowerCase().includes('cvv');
    const variantError = reason === 'Unsupported card variant';
    const field = cvvError ? 'cvv' : variantError ? 'cardVariant' : 'cardNumber';
    const code = cvvError
      ? 'INVALID_CVV'
      : variantError
        ? 'UNSUPPORTED_CARD_VARIANT'
        : reason === 'Failed Luhn check'
          ? 'CARD_NUMBER_CHECKSUM_FAILED'
          : reason === "Card number doesn't match the variant pattern"
            ? 'CARD_NUMBER_VARIANT_MISMATCH'
            : 'INVALID_CARD_NUMBER';

    return sendCardInputError(res, code, reason, { [field]: reason });
  }

  const lastFourDigits = Number(cardNumber.slice(-4));
  try {
    const existingCard = await CCCollection.findOne({ userId, lastFourDigits })
      .select('_id')
      .lean();

    if (existingCard) {
      const message = `A card ending in ${String(lastFourDigits).padStart(4, '0')} is already saved.`;
      return sendCardInputError(
        res,
        'CARD_ALREADY_EXISTS',
        message,
        { cardNumber: message },
        StatusCodes.CONFLICT
      );
    }

    const lastCard = await CCCollection.findOne({ userId })
      .sort({ orderIndex: -1 })
      .select('orderIndex')
      .lean();
    const orderIndex = (lastCard?.orderIndex ?? -1) + 1;
    const encryptedNumber = encrypt(`${cardNumber}-${month}-${year}-${cvv}`);

    await CCCollection.create({
      userId,
      encryptedNumber,
      cardholderName: cardholderName.trim(),
      cardImageUrl: cardImageUrl.trim(),
      bankName,
      cardVariant,
      limit: cardLimit,
      billGenDate: billDate,
      annualCharges: charges,
      cardName: cardName.trim(),
      lastFourDigits,
      orderIndex,
    });

    return res.status(StatusCodes.CREATED).json({
      code: 'CARD_ADDED',
      message: 'Card added successfully.',
    });
  } catch (error) {
    if (error?.code === 11000) {
      const message = `A card ending in ${String(lastFourDigits).padStart(4, '0')} is already saved.`;
      return sendCardInputError(
        res,
        'CARD_ALREADY_EXISTS',
        message,
        { cardNumber: message },
        StatusCodes.CONFLICT
      );
    }

    if (error?.name === 'ValidationError') {
      const validationErrors = Object.fromEntries(
        Object.entries(error.errors).map(([field, detail]) => [field, detail.message])
      );
      return sendCardInputError(
        res,
        'INVALID_CARD_DETAILS',
        'Some card details are invalid. Check the highlighted fields.',
        validationErrors
      );
    }

    console.error('Failed to save credit card', error?.message || error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      code: 'CARD_SAVE_FAILED',
      message: 'We could not save this card right now. Please try again.',
    });
  }
};

const addCardsBulk = async (req, res) => {
  const { userId } = req.user;
  const cards = Array.isArray(req.body) ? req.body : req.body?.cards;

  if (!Array.isArray(cards) || cards.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Provide a non-empty array of cards',
    });
  }

  const lastExistingCard = await CCCollection.findOne({ userId })
    .sort({ orderIndex: -1 })
    .select('orderIndex')
    .lean();
  const nextOrderIndex = (lastExistingCard?.orderIndex ?? -1) + 1;
  const insertedCards = [];
  const seenLastFourDigits = new Map();

  for (const [index, card] of cards.entries()) {
    if (!card || typeof card !== 'object' || Array.isArray(card)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid card in bulk upload',
        cardIndex: index,
        reason: 'Each card must be a JSON object',
      });
    }

    const {
      cardholderName,
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

    if (
      typeof cardNumber !== 'string' ||
      typeof cvv !== 'string' ||
      typeof cardVariant !== 'string'
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid card in bulk upload',
        cardIndex: index,
        reason: 'Card number, card variant, and CVV are required',
      });
    }

    const { valid, reason } = validateCardNumber(cardNumber, cardVariant, cvv);
    if (!valid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid card in bulk upload',
        cardIndex: index,
        reason,
      });
    }

    const lastFourDigits = Number(cardNumber.slice(-4));
    if (seenLastFourDigits.has(lastFourDigits)) {
      return res.status(StatusCodes.CONFLICT).json({
        message: `Cards at positions ${seenLastFourDigits.get(lastFourDigits) + 1} and ${index + 1} share the same last four digits. No cards were added.`,
      });
    }
    seenLastFourDigits.set(lastFourDigits, index);

    const encryptedNumber = encrypt(
      `${cardNumber}-${expiryMonth}-${expiryYear}-${cvv}`
    );

    insertedCards.push({
      userId,
      encryptedNumber,
      cardholderName: typeof cardholderName === 'string' ? cardholderName.trim() : '',
      cardImageUrl,
      bankName,
      cardVariant,
      limit,
      billGenDate,
      annualCharges,
      cardName,
      lastFourDigits,
      orderIndex: nextOrderIndex + index,
    });
  }

  for (const [index, card] of insertedCards.entries()) {
    const validationError = new CCCollection(card).validateSync();
    if (validationError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid card in bulk upload',
        cardIndex: index,
        reason: validationError.message,
      });
    }
  }

  const existingCardsWithSameLastFourDigits = await CCCollection.find({
    userId,
    lastFourDigits: { $in: [...seenLastFourDigits.keys()] },
  })
    .select('lastFourDigits')
    .lean();

  if (existingCardsWithSameLastFourDigits.length > 0) {
    const duplicateLastFourDigits = [
      ...new Set(
        existingCardsWithSameLastFourDigits.map((card) => card.lastFourDigits)
      ),
    ];

    return res.status(StatusCodes.CONFLICT).json({
      message: `Card(s) ending in ${duplicateLastFourDigits.join(', ')} already exist. No cards were added.`,
    });
  }

  let createdCards;
  try {
    createdCards = await CCCollection.insertMany(insertedCards);
  } catch (error) {
    const hasDuplicateKeyError =
      error?.code === 11000 ||
      error?.writeErrors?.some((writeError) => writeError.code === 11000);

    if (hasDuplicateKeyError) {
      return res.status(StatusCodes.CONFLICT).json({
        message:
          'A matching card was added while this import was being saved. Refresh your cards before retrying.',
      });
    }

    throw error;
  }

  res.status(StatusCodes.OK).json({
    message: 'Cards added successfully',
    count: createdCards.length,
    cards: createdCards,
  });
};

const updateCard = async (req, res) => {
  const { userId } = req.user;
  const { cardId } = req.params;
  const {
    cardholderName,
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

  if (
    typeof cardholderName !== 'string' ||
    !cardholderName.trim() ||
    typeof cardNumber !== 'string' ||
    typeof cvv !== 'string' ||
    typeof cardVariant !== 'string'
  ) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      reason: 'Cardholder name, card number, card variant, and CVV are required',
    });
  }

  const { valid, reason } = validateCardNumber(cardNumber, cardVariant, cvv);
  if (!valid) {
    return res.status(StatusCodes.BAD_REQUEST).json({ reason });
  }

  const card = await CCCollection.findOne({ _id: cardId, userId });
  if (!card) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Card not found' });
  }

  const lastFourDigits = Number(cardNumber.slice(-4));
  const existingCard = await CCCollection.findOne({
    userId,
    lastFourDigits,
    _id: { $ne: cardId },
  })
    .select('_id')
    .lean();

  if (existingCard) {
    return res.status(StatusCodes.CONFLICT).json({
      message: `A card ending in ${lastFourDigits} already exists`,
    });
  }

  card.cardholderName = cardholderName.trim();
  card.encryptedNumber = encrypt(
    `${cardNumber}-${expiryMonth}-${expiryYear}-${cvv}`
  );
  card.cardImageUrl = cardImageUrl;
  card.bankName = bankName;
  card.cardVariant = cardVariant;
  card.limit = limit;
  card.billGenDate = billGenDate;
  card.annualCharges = annualCharges;
  card.cardName = cardName;
  card.lastFourDigits = lastFourDigits;

  await card.save();

  res.status(StatusCodes.OK).json({ message: 'Card updated successfully' });
};

const deleteCard = async (req, res) => {
  const { userId } = req.user;
  const { cardId } = req.params;

  const card = await CCCollection.findOneAndDelete(
    { _id: cardId, userId }
  );

  if (!card) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Card not found' });
  }

  res.status(StatusCodes.OK).json({
    message: 'Card removed',
  });
};

module.exports = {
  deleteCard,
  updateCard,
  addCard,
  getAllCards,
  addCardsBulk,
};
