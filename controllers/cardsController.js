const CustomError = require('../customError.js');
const { StatusCodes } = require('http-status-codes');
const CardsCollection = require('../models/Card.js');

const getAllCards = async (req, res) => {
  const { userId } = req.user;
  const cards = await CardsCollection.find({ userId });

  res.status(StatusCodes.OK).json({
    cards,
  });
};

const addCard = async (req, res) => {
  const { userId } = req.user;

  const { interest, months, processingFee, loanTaken, emiType, cardId } =
    req.body;
  if (!interest || !months || !processingFee || !loanTaken || !emiType) {
    throw new CustomError('Invalid Request', StatusCodes.BAD_REQUEST);
  }

  //   const card = await CardsCollection.findOneAndUpdate(
  //     { ...(cardId && { _id: cardId }), userId },
  //     {
  //       interest,
  //       months,
  //       processingFee,
  //       loanTaken,
  //       emiType,
  //     },
  //     {
  //       new: true,
  //       upsert: true,
  //     }
  //   );

  const card = await CardsCollection.create({
    userId,
    interest,
    months,
    processingFee,
    loanTaken,
    emiType,
  });

  res.status(StatusCodes.OK).json({
    message: 'card successfully added',
    card,
  });
};

const deleteCard = async (req, res) => {
  const { cardId } = req.params;

  const card = await CardsCollection.findOneAndDelete(
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
