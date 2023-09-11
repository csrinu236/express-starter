const CustomError = require('../customError.js');
const UsersCollection = require('../models/User.js');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const { createJwtToken, attachCookieToResponse } = require('../utils/index.js');

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('🚀 ~ file: authController.js:9 ~ login ~ email:', email);
  console.log('🚀 ~ file: authController.js:9 ~ login ~ password:', password);
  if (!email || !password) {
    throw new CustomError(
      'Please enter valid credentials',
      StatusCodes.BAD_REQUEST
    );
  }
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw new CustomError(
      'No user found with the entered mail, please register',
      StatusCodes.NOT_FOUND
    );
  }

  const isPwdCorrect = await user.comparePassword(password);
  if (!isPwdCorrect) {
    throw new CustomError(
      'Please enter correct password',
      StatusCodes.UNAUTHORIZED
    );
  }

  const { deviceid } = req.headers;

  // first time login case
  const alreadyLoggedIn =
    user.deviceIds.length > 0 && !user.deviceIds.includes(deviceid);
  const limitExeeded = user.deviceIds.length >= 2;

  // return res.status(StatusCodes.FORBIDDEN).json({
  //   msg: 'You can only login in maximum of 2 devices. Do you want to logout from all devices and add this device?',
  // });

  if (alreadyLoggedIn) {
    if (limitExeeded) {
      return res.status(StatusCodes.FORBIDDEN).json({
        msg: 'You can only login in maximum of 2 devices. Do you want to logout from all devices?',
      });
    }
    return res.status(StatusCodes.CONFLICT).json({
      msg: 'You already logged in another device, do you want to add this device as well? You can add maximum of 2 devices',
    });
  }

  user.deviceIds = [deviceid];
  await user.save();

  const { token, jwtPayload } = createJwtToken({ user, deviceid });
  attachCookieToResponse({ token, res });

  res.status(StatusCodes.OK).json({
    message: 'successfully logged in',
    // user: jwtPayload,
  });
};

const register = async (req, res) => {
  const { email } = req.body;
  // const emailAlreadyExists = await User.findOne({ email });
  // if (emailAlreadyExists) {
  //   throw new CustomError('User with this Email already exists', 400);
  // }

  const isFirstAccount = (await UsersCollection.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  const user = await UsersCollection.create({ ...req.body, role }); // this one goes to pre save hook

  // creating JWT Token, we do this in login route as well.
  // const { token, jwtPayload } = createJwtToken({ user });
  // attachCookieToResponse({ token, res });

  res.status(StatusCodes.CREATED).json({
    msg: 'user registered please login',
  });
};

const logout = async (req, res) => {
  // we have to remove token by setting it negative expiry time
  const user = await UsersCollection.findOne({ _id: req.user.userId });
  const updatedDeviceIds = user.deviceIds.filter(
    (eachId) => eachId !== req.headers.deviceid
  );
  user.deviceIds = updatedDeviceIds;
  await user.save();

  res.cookie('token', 'logout', {
    expires: new Date(new Date().getTime() - 1000 * 60 * 60),
  });
  res.json({ message: 'logout route' });
};

const removeAllDevices = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new CustomError('Please enter valid data', StatusCodes.BAD_REQUEST);
  }
  const user = await UsersCollection.findOne({ email });
  //   const user = await UsersCollection.findOne({ _id: req.user.userId }); // this will also work
  const isPwdCorrect = await user.comparePassword(password);
  if (!isPwdCorrect) {
    throw new CustomError(
      'Please enter correct password',
      StatusCodes.UNAUTHORIZED
    );
  }
  const { deviceid } = req.headers;
  user.deviceIds = [deviceid];
  await user.save();

  const { token, jwtPayload } = createJwtToken({ user, deviceid });
  attachCookieToResponse({ token, res });

  res
    .status(StatusCodes.OK)
    .json({ msg: 'removed all devices and added this device' });
};

const addDevice = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new CustomError('Please enter valid data', StatusCodes.BAD_REQUEST);
  }
  const user = await UsersCollection.findOne({ email });
  //   const user = await UsersCollection.findOne({ _id: req.user.userId }); // this will also work
  const isPwdCorrect = await user.comparePassword(password);
  if (!isPwdCorrect) {
    throw new CustomError(
      'Please enter correct password',
      StatusCodes.UNAUTHORIZED
    );
  }
  const { deviceid } = req.headers;
  user.deviceIds = [...user.deviceIds, deviceid];
  await user.save();

  const { token, jwtPayload } = createJwtToken({ user, deviceid });
  attachCookieToResponse({ token, res });

  res.status(StatusCodes.OK).json({ msg: 'added this device' });
};

module.exports = {
  login,
  logout,
  register,
  addDevice,
  removeAllDevices,
};
