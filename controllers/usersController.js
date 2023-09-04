const CustomError = require('../customError');
const UsersCollection = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const {
  createJwtToken,
  attachCookieToResponse,
  checkPermission,
} = require('../utils');

const getAllUsers = async (req, res) => {
  const allUsers = await UsersCollection.find({ role: 'user' }).select(
    '-password'
  );
  res.status(StatusCodes.OK).json(allUsers);
};

// problem: susan can see peter details if susan has peter id
// need to add one more check
const getSingleUser = async (req, res) => {
  const user = await UsersCollection.findOne({ _id: req.params.id }).select(
    '-password'
  );
  if (!user) {
    throw new CustomError(
      `User not found with id: ${req.params.id}`,
      StatusCodes.NOT_FOUND
    );
  }
  checkPermission(user._id, req.user);
  res.status(StatusCodes.OK).json({ user });
};

const updateUser = async (req, res) => {
  const { name } = req.body;
  // customize what can be returned from here either updated document or previous document
  // control doesnot go throug pre save hook
  const user = await UsersCollection.findOneAndUpdate(
    { _id: req.user.userId },
    { name: name },
    {
      new: true, // you should set the new option to true to return the document after update was applied.
      //   returnOriginal: fasle, // do the same above, read docs
      runValidators: true,
    }
  );
  console.log(user);
  // you have to create the cookie again because you have changed the name
  const { token, jwtPayload } = createJwtToken({ user });
  attachCookieToResponse({ token, res });
  res.status(StatusCodes.OK).json({ msg: 'user updated', user: jwtPayload });
};

// const updateUser = async (req, res) => {
//   const { name } = req.body;
//   //  actually we can go with user.save() by modifying pre save hook, see User Schema
//   const user = await UsersCollection.findOne({ _id: req.user.userId });
//   user.name = name;
//   await user.save();

//   // you have to create the cookie again because you have changed the name
//   // we are sending updated user only, coz we changed user.name = name
//   const { token, jwtPayload } = createJwtToken({ user });
//   attachCookieToResponse({ token, res });
//   res.status(StatusCodes.OK).json({ msg: 'user updated', user: jwtPayload });
// };

const showCurrentUser = async (req, res) => {
  const user = req.user;
  res.json({ user }).status(StatusCodes.OK);
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword, email } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError('Please enter valid data', StatusCodes.BAD_REQUEST);
  }
  const user = await UsersCollection.findOne({ email });
  //   const user = await UsersCollection.findOne({ _id: req.user.userId }); // this will also work
  const isPwdCorrect = await user.comparePassword(oldPassword);
  if (!isPwdCorrect) {
    throw new CustomError(
      'Please enter correct password',
      StatusCodes.UNAUTHORIZED
    );
  }

  // we can go with user.save(), control goes through pre save hook so again hash the new password as we wanted
  // it will not return the updated object, we have to manually fetch the updated object again if want.
  // ofcourse we don't want any object to be returned just for changing the password
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: 'password updated successfully' });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
