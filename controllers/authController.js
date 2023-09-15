const CustomError = require('../customError.js');
const User = require('../models/User.js');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const { createJwtToken, attachCookieToResponse } = require('../utils/index.js');

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError(
      'Please enter valid credentials',
      StatusCodes.BAD_REQUEST
    );
  }
  const user = await User.findOne({ email });
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

  // // creating the session
  // app.use(
  //   session({
  //     name: 'user_sid',
  //     secret: 'secret',
  //     resave: false,
  //     saveUninitialized: true,
  //     cookie: {
  //       maxAge: 1000 * 60,
  //       httpOnly: true,
  //     },
  //   })
  // );

  req.session.user = user; // entire session object is destroyed after maxAge is expired

  // const { token, jwtPayload } = createJwtToken({ user });
  // attachCookieToResponse({ token, res });
  res.status(StatusCodes.OK).json({
    message: 'successfully logged in',
  });
};

const register = async (req, res) => {
  const { email } = req.body;
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError('User with this Email already exists', 400);
  }

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';
  const user = await User.create({ ...req.body, role }); // this one goes to pre save hook

  // creating JWT Token, we do this in login route as well.
  // const { token, jwtPayload } = createJwtToken({ user });
  // attachCookieToResponse({ token, res });

  res.status(StatusCodes.CREATED).json({
    msg: 'user registered',
  });
};

const logout = async (req, res) => {
  // we have to remove token by setting it negative expiry time
  req.session.destroy();
  // res.cookie('token', 'logout', {
  //   expires: new Date(new Date().getTime()),
  // });
  res.json({ message: 'logout route' });
};

module.exports = {
  login,
  logout,
  register,
};
