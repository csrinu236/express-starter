const { StatusCodes } = require('http-status-codes');
const ProductsCollection = require('../models/Product');
const CustomError = require('../customError');

const getAllProducts = async (req, res) => {
  // we can also get reviews associated with this productId with populate method
  // const products = await ProductsCollection.find({}).populate('allreviews');
  const products = await ProductsCollection.find({});
  res.status(StatusCodes.OK).json({ products });
};
// we add mongoose virtuals, don't persist in database
const getSingleProduct = async (req, res) => {
  const productId = req.params.id;
  // we can also get reviews associated with this product with populate method
  const product = await ProductsCollection.findOne({ _id: productId }).populate(
    'allreviews'
  );
  res.status(StatusCodes.OK).json({ product });
};

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await ProductsCollection.create(req.body);
  res.json({ product }).status(StatusCodes.OK);
};

const deleteSingleProduct = async (req, res) => {
  const productId = req.params.id;
  const product = await ProductsCollection.findOne({ _id: productId }); // we can also get reviews associated with this product with populate method
  if (!product) {
    throw new CustomError('no such product found', StatusCodes.BAD_REQUEST);
  }
  // await product.remove(); // we will run pre-remove hook to remove reviews associated with this productId
  await product.deleteOne(); // we will run pre-remove hook to remove reviews associated with this productId

  res.json({ msg: 'product deleted' }).status(StatusCodes.OK);
};

const updateSingleProduct = async (req, res) => {
  const productId = req.params.id;
  const product = await ProductsCollection.findOneAndUpdate(
    { _id: productId },
    { ...req.body }, // we just pass req.body coz, only these values will be updated, adminId remains same
    { new: true, runValidators: true }
  );
  res.json({ product }).status(StatusCodes.OK);
};

module.exports = {
  getAllProducts,
  getSingleProduct,
  deleteSingleProduct,
  createProduct,
  updateSingleProduct,
};
