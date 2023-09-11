const { StatusCodes } = require('http-status-codes');
const CustomError = require('../customError');
const { verifyToken } = require('../utils');

const authorizeUser = (req, res, next) => {
  console.log('singed', req.signedCookies);
  console.log('un singed', req.cookies);
  const { token } = req.signedCookies;
  if (!token) {
    throw new CustomError('Please login', StatusCodes.UNAUTHORIZED);
  }
  try {
    const isTokenValid = verifyToken({ token });
    const { role, userId, name, deviceId } = isTokenValid;
    const { deviceid } = req.headers;
    console.log({
      deviceid,
      deviceId,
    });
    if (deviceid && deviceId !== deviceid) {
      res.cookie('token', 'logout', {
        expires: new Date(new Date().getTime()),
      });
      throw new Error('You are doing some jugaad...');
    }
    // role === 'admin' check is done in authorizeAdmin middleware
    req.user = { role, userId, name, deviceId };
    next();
  } catch (error) {
    throw new CustomError(
      error || 'You are not authorized to access this route',
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
