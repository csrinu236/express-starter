const { StatusCodes } = require("http-status-codes");
const CustomError = require("../customError");
const { verifyToken } = require("../utils");
// const { LOGGED_IN_USERS } = require("../controllers/authController");
const REDIS_CLIENT = require("../utils/redis.js");

const authorizeUser = async (req, res, next) => {
  console.log(req.signedCookies);
  const { token } = req.signedCookies;
  // const { token } = req.cookies;
  console.log({ token });
  if (!token) {
    throw new CustomError("Please login", StatusCodes.UNAUTHORIZED);
  }

  try {
    const isTokenValid = verifyToken({ token });
    const { role, userId, name } = isTokenValid;
    // const storedCsrfToken = LOGGED_IN_USERS.get(userId);
    const redisObj = await REDIS_CLIENT.get(userId).then((result) => JSON.parse(result));
    const csrfToken = req.headers.csrftoken;

    if (!redisObj?.csrfToken || !csrfToken || redisObj?.csrfToken !== csrfToken || token !== redisObj?.token) {
      throw new CustomError("Invalid Tampering", StatusCodes.UNAUTHORIZED);
    }
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
    throw new CustomError(error.message || "You are not authorized to access this route", StatusCodes.UNAUTHORIZED);
  }
};

const authorizeAdmin = (...roles) => {
  return (req, res, next) => {
    const { role, userId, name } = req.user;
    if (!roles.includes(role)) {
      throw new CustomError("Only admins", StatusCodes.FORBIDDEN);
    }
    next();
  };
};

module.exports = { authorizeUser, authorizeAdmin };
