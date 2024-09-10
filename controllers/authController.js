const CustomError = require('../customError.js');
const User = require('../models/User.js');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const { createJwtToken, attachCookieToResponse } = require('../utils/index.js');

// Entry 2
const generateGoogleAuthLink = async (req, res) => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

  const options = {
    redirect_uri: 'http://localhost:5000/auth/google/callback',
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const queryParams = new URLSearchParams(options);

  return res.redirect(`${rootUrl}?${queryParams.toString()}`);
  // will be redirected to
  // http://localhost:5000/auth/google/callback?code=4%2F0AQlEd8xMAdRKckM4rWUB-cywwazinq77ThSeeFtVKcbpJ3DrACnj78sSBcsfFd-gjDr12w&scope=email+profile+openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&authuser=0&prompt=consent
  // need to extract query param code
};
const generateGithubAuthLink = async (req, res) => {
  const rootUrl = 'https://github.com/login/oauth/authorize';

  const options = {
    redirect_uri: 'http://localhost:5000/auth/github/callback',
    client_id: process.env.GITHUB_CLIENT_ID,
    scope: ['read:user', 'user:email'].join(' '), // Scopes to get user profile and email
    allow_signup: 'true', // Allows users to sign up if they don't have a GitHub account
    response_type: 'code',
  };

  const queryParams = new URLSearchParams(options);

  return res.redirect(`${rootUrl}?${queryParams.toString()}`);
  // will be redirected to
  // ttp://localhost:5000/auth/github/callback?code=01b23935b3da29fb9f15
  // need to extract query param code
};

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

  const { token, jwtPayload } = createJwtToken({ user });
  attachCookieToResponse({ token, res });
  res.status(StatusCodes.OK).json({
    message: 'successfully logged in',
    user: jwtPayload,
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
  const { token, jwtPayload } = createJwtToken({ user });
  attachCookieToResponse({ token, res });

  res.status(StatusCodes.CREATED).json({
    msg: 'user registered',
    user: jwtPayload,
  });
};

const logout = async (req, res) => {
  // we have to remove token by setting it negative expiry time
  res.cookie('token', 'logout', {
    expires: new Date(new Date().getTime()),
  });
  res.json({ message: 'logout route' });
};

module.exports = {
  login,
  logout,
  register,
  generateGoogleAuthLink,
  generateGithubAuthLink,
};
