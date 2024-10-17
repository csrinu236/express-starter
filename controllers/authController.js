const CustomError = require('../customError.js');
const User = require('../models/User.js');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const { createJwtToken, attachCookieToResponse } = require('../utils/index.js');
const crypto = require('crypto');
const { transporter } = require('../utils/transporter.js');
const getHtml = require('../utils/getHtml.js');

// Entry 2
const generateGoogleAuthLink = async (req, res) => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

  const options = {
    redirect_uri: `${process.env.GOOGLE_REDIRECT_URI}`,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',

    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };
  // Scopes are embedded inside access_token => the above access_token can't be used for
  // other google services because we only mentioned profile and email scope, not spreadsheets, drive.
  // so this access_token can't be used to access spreadsheets, drive, docs, etc
  // https://www.googleapis.com/auth/spreadsheets
  // https://www.googleapis.com/auth/drive.
  // https://www.googleapis.com/auth/documents

  const queryParams = new URLSearchParams(options);

  return res.redirect(`${rootUrl}?${queryParams.toString()}`);
  // will be redirected to
  // http://localhost:5000/auth/google/callback?code=4%2F0AQlEd8xMAdRKckM4rWUB-cywwazinq77ThSeeFtVKcbpJ3DrACnj78sSBcsfFd-gjDr12w&scope=email+profile+openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&authuser=0&prompt=consent
  // need to extract query param code
};
const generateGithubAuthLink = async (req, res) => {
  const rootUrl = 'https://github.com/login/oauth/authorize';

  const options = {
    redirect_uri: process.env.GITHUB_REDIRECT_URI,
    client_id: process.env.GITHUB_CLIENT_ID,
    scope: ['read:user', 'user:email'].join(' '), // Scopes to get user profile and email
    allow_signup: 'true', // Allows users to sign up if they don't have a GitHub account
    response_type: 'code',
    prompt: 'consent',
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

  if (!user?.emailVerified) {
    throw new CustomError(
      'Email not verified, please verify your email',
      StatusCodes.NOT_FOUND
    );
  }

  if (user?.SocialMedia) {
    throw new CustomError(
      `Login with ${user.SocialMedia}`,
      StatusCodes.BAD_REQUEST
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

const user = async (req, res) => {
  const user = req.user;
  console.log({ user });
  res.status(StatusCodes.OK).json({
    msg: 'user verified',
    user,
  });
};

const register = async (req, res) => {
  const { email } = req.body;
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError('User with this Email already exists', 400);
  }
  const id = crypto.randomBytes(24).toString('hex');
  const user = await User.findOneAndUpdate(
    {
      email,
    },
    { ...req.body, emailVerificationString: id },
    {
      new: true,
      upsert: true,
    }
  ); // this one goes to pre save hook
  const link = `/verify?email_token=${id}&email=${email}`;
  let mailOptions = {
    from: {
      name: 'No Cost EMI',
      address: 'csrinu236@gmail.com',
    },
    to: email,
    subject: 'Verify Your Email',
    html: getHtml({ link }),
  };

  let result = await transporter.sendMail(mailOptions);

  res.status(StatusCodes.CREATED).json({
    msg: 'user registered, please verify your email to continue',
  });
};

const verify = async (req, res) => {
  const { email_token, email } = req.body;
  const user = await User.findOne({ email });
  if (!user || user?.emailVerificationString !== email_token) {
    throw new CustomError('invalid_request', 400);
  }

  if (user?.emailVerified) {
    throw new CustomError('already_verified', 400);
  }

  user.emailVerified = true;
  await user.save();

  res.status(StatusCodes.CREATED).json({
    msg: 'email verified please login',
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
  verify,
  generateGoogleAuthLink,
  generateGithubAuthLink,
  user,
};
