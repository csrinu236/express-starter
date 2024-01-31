const { StatusCodes } = require("http-status-codes");
const CustomError = require("../customError");
const { verifyToken, attachCookieToResponse, createJwtToken } = require("../utils");
const TokensCollection = require("../models/Token");

const authorizeUser = async (req, res, next) => {
  console.log(req.signedCookies);
  let { accessToken, refreshToken } = req.signedCookies;

  try {
    if (accessToken) {
      const isAccessTokenValid = verifyToken(accessToken);
      const { role, userId, name } = isAccessTokenValid;
      // role === 'admin' check is done in authorizeAdmin middleware
      req.user = { role, userId, name };
      return next();
    }
    const isRefreshTokenValid = verifyToken(refreshToken);
    const { role, userId, name, refreshTokenString } = isRefreshTokenValid;
    const existingRefreshTokenObj = await TokensCollection.findOne({ refreshTokenString, userId });
    // check for the validity of refreshTokenObj
    // It is assumed that ip  and userAgent will not change just within 15 minutes.
    // 1) req.ip !== existingRefreshTokenObj.ip
    // 2) req.headers['user-agent'] !=== existingRefreshTokenObj.userAgent
    if (req.ip !== existingRefreshTokenObj.ip || req.headers["user-agent"] !== existingRefreshTokenObj.userAgent) {
      throw new CustomError("You are not authorized to access this route", StatusCodes.UNAUTHORIZED);
    }
    const jwtPayload = {
      name,
      userId,
      role,
    };
    accessToken = createJwtToken(jwtPayload);
    refreshToken = createJwtToken({ ...jwtPayload, refreshTokenString });
    attachCookieToResponse({ accessToken, refreshToken, res });
    req.user = { role, userId, name };
    return next();
  } catch (error) {
    console.log(error);
    throw new CustomError("You are not authorized to access this route", StatusCodes.UNAUTHORIZED);
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
