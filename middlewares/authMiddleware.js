const { StatusCodes } = require('http-status-codes');
const CustomError = require('../customError');
const { verifyToken } = require('../utils');

const authorizeUser = (req, res, next) => {
  // console.log(req.signedCookies);
  // const { token } = req.signedCookies;
  const { token } = req.cookies;
  console.log({ token });
  if (!token) {
    throw new CustomError(
      'Please login, no token came with the request',
      StatusCodes.UNAUTHORIZED
    );
  }
  try {
    const isTokenValid = verifyToken({ token });
    console.log({ isTokenValid });
    const { userId, picture, name } = isTokenValid;
    // role === 'admin' check is done in authorizeAdmin middleware
    // so that this middleware can be used for single user specific routes
    // if (role !== 'admin') {
    //   throw new CustomError(
    //     'Only admins can access this route',
    //     StatusCodes.UNAUTHORIZED
    //   );
    // }
    // passing data to next middleware from decrypting token for example to get data associated with Id
    req.user = { userId, name, picture };
    next();
  } catch (error) {
    throw new CustomError(
      'You are not authorized to access this route',
      StatusCodes.UNAUTHORIZED
    );
  }
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

module.exports = { authorizeUser, authorizeAdmin };
