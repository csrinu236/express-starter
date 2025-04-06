const { StatusCodes } = require('http-status-codes');
const CustomError = require('../customError');
const OrdersCollection = require('../models/Order');

const getAllOrders = async (req, res) => {
  const orders = await OrdersCollection.find({}).select(
    'customerName customerPhoneNumber orderedDate amountPaid _id'
  );
  res.status(StatusCodes.OK).json({ orders });
};
// we add mongoose virtuals, don't persist in database
const getSingleOrder = async (req, res) => {
  const orderId = req.params.orderId;
  // we can also get reviews associated with this product with populate method
  const order = await OrdersCollection.findOne({ _id: orderId }).select(
    '-__v -createdAt -updatedAt'
  );
  if (!order) {
    throw new CustomError('no such product found', StatusCodes.BAD_REQUEST);
  }
  res.status(StatusCodes.OK).json({ order });
};

const createOrder = async (req, res) => {
  const order = await OrdersCollection.create(req.body);
  res.json({ order }).status(StatusCodes.OK);
};

const deleteSingleOrder = async (req, res) => {
  const orderId = req.params.orderId;
  const order = await OrdersCollection.findOne({ _id: orderId }); // we can also get reviews associated with this product with populate method
  if (!order) {
    throw new CustomError('no such product found', StatusCodes.BAD_REQUEST);
  }
  // await product.remove(); // we will run pre-remove hook to remove reviews associated with this productId
  await order.deleteOne(); // we will run pre-remove hook to remove reviews associated with this productId

  res.json({ msg: 'order deleted' }).status(StatusCodes.OK);
};

const updateSingleOrder = async (req, res) => {
  const orderId = req.params.orderId;
  const order = await OrdersCollection.findOneAndUpdate(
    { _id: orderId },
    { ...req.body }, // we just pass req.body coz, only these values will be updated, adminId remains same
    { new: true, runValidators: true }
  );
  res.json({ order }).status(StatusCodes.OK);
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  createOrder,
  updateSingleOrder,
  deleteSingleOrder,
};
