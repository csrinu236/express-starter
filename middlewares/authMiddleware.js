const { StatusCodes } = require('http-status-codes');
const CustomError = require('../customError');
const { verifyToken } = require('../utils');

const authorizeUser = (req, res, next) => {
  // console.log(req.signedCookies);
  const { token } = req.signedCookies;
  if (!token) {
    throw new CustomError('Please login', StatusCodes.UNAUTHORIZED);
  }
  try {
    const isTokenValid = verifyToken({ token });
    const { role, userId, name } = isTokenValid;
    // role === 'admin' check is done in authorizeAdmin middleware
    // so that this middleware can be used for single user specific routes
    // if (role !== 'admin') {
    //   throw new CustomError(
    //     'Only admins can access this route',
    //     StatusCodes.UNAUTHORIZED
    //   );
    // }
    // passing data to next middleware from decrypting token for example to get data associated with Id
    req.user = { role, userId, name };
    next();
  } catch (error) {
    throw new CustomError(
      'You are not authorized to access this route',
      StatusCodes.UNAUTHORIZED
    );
  }
};

const sessionChecker = async (req, res, next) => {
  // it will check session
  console.log('req.session.user====>', req.session?.user);
  // console.log('req.signedCookies====>', req.signedCookies);
  console.log('req.cookies====>', req.cookies);
  console.log('req.session====>', req.session);
  if (!req.session.user) {
    // res.clearCookie('user_sid');
    throw new CustomError(
      'You are not authorized to access this route',
      StatusCodes.UNAUTHORIZED
    );
  }
  next();
};

const authorizeAdmin = (...roles) => {
  return (req, res, next) => {
    const { role, userId, name } = req.user;
    if (!roles.includes(role)) {
      throw new CustomError('Only admins', StatusCodes.FORBIDDEN);
    }
    next();
  };
};

module.exports = { authorizeUser, authorizeAdmin, sessionChecker };
