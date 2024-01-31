const jwt = require("jsonwebtoken");
const CustomError = require("../customError");
const { StatusCodes } = require("http-status-codes");

const verifyToken = ({ token }) => {
  return jwt.verify(token, process.env.JWT_SECRET_KEY);
};

const createJwtToken = ({ user }) => {
  // jwtPayload is the only thing we have inorder to access authenticated routes
  const jwtPayload = {
    name: user.name, // to say Hi username on home page
    userId: user._id, // must needed to access user specific cartItems and Reviews
    role: user.role, // since we have role based authentications, we need this
  };
  const token = jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return { token, jwtPayload };
};

const attachCookieToResponse = ({ token, res }) => {
  // max size of a cookie is 4KB, so be carefull while creating jwt token, don't pass huge
  res.cookie("token", token, {
    httpOnly: true,
    // client side js shouldnot access cookie and hackers can't modify cookie to inject malicious data
    expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
    // cookieParser should be modified cookieParser(process.env.JSW_SECRET_KEY),
    // req.signedCookies instead of req.cookies
    // If a user tries to manually modify the cookie's value using developer tools or any
    // other method, the digital signature will no longer match, and the server will reject
    // the cookie as tampered with.
    // the server will add a digital signature to the cookie's value before sending it to the client's
    // browser.This digital signature is generated using a secret key known only to the server.
    signed: true,
    secure: process.env.NODE_ENV === "production", // https false in development
  });
};

const checkPermission = (userIdFromDatabase, userFromCookie) => {
  if (userFromCookie.role === "admin") return; // admins can see every user with their Id
  if (userFromCookie.userId === userIdFromDatabase.toString()) return;
  throw new CustomError("no acces to get single user for you via id", StatusCodes.UNAUTHORIZED);
};

module.exports = {
  verifyToken,
  createJwtToken,
  attachCookieToResponse,
  checkPermission,
};
