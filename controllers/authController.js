const CustomError = require("../customError.js");
const User = require("../models/User.js");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { createJwtToken, attachCookieToResponse } = require("../utils/index.js");
const TokensCollection = require("../models/Token.js");

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError("Please enter valid credentials", StatusCodes.BAD_REQUEST);
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError("No user found with the entered mail, please register", StatusCodes.NOT_FOUND);
  }

  const isPwdCorrect = await user.comparePassword(password);
  if (!isPwdCorrect) {
    throw new CustomError("Please enter correct password", StatusCodes.UNAUTHORIZED);
  }

  // jwtPayload is the only thing we have inorder to access authenticated routes
  const jwtPayload = {
    name: user.name, // to say Hi username on home page
    userId: user._id, // must needed to access user specific cartItems and Reviews
    role: user.role, // since we have role based authentications, we need this
  };

  const accessToken = createJwtToken(jwtPayload);

  let refreshTokenString = "";
  // check for existing token
  const existingRefreshTokenObj = await TokensCollection.findOne({ userId: user._id });
  if (existingRefreshTokenObj) {
    // if token exists, we have to check for validity
    const { isValid } = existingRefreshTokenObj;
    if (!isValid) {
      // if token is not valid,
      throw new CustomError("Please enter valid credentials", StatusCodes.BAD_REQUEST);
    } else {
      // if token is valid, we have to send it
      refreshTokenString = existingRefreshTokenObj.refreshTokenString;
      const refreshToken = createJwtToken({ ...jwtPayload, refreshTokenString });
      attachCookieToResponse({ accessToken, refreshToken, res });
      res.status(StatusCodes.OK).json({
        message: "successfully logged in",
        user: jwtPayload,
      });
      return;
    }
  }
  refreshTokenString = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const refreshTokenObj = {
    refreshTokenString,
    userAgent,
    ip,
    userId: user._id,
  };

  await TokensCollection.create(refreshTokenObj);
  const refreshToken = createJwtToken({ ...jwtPayload, refreshTokenString });

  attachCookieToResponse({ accessToken, refreshToken, res });
  res.status(StatusCodes.OK).json({
    message: "successfully logged in",
    user: jwtPayload,
  });
};

const register = async (req, res) => {
  const { email } = req.body;
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError("User with this Email already exists", 400);
  }

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";
  const user = await User.create({ ...req.body, role }); // this one goes to pre save hook

  // creating JWT Token, we do this in login route as well.
  const { token, jwtPayload } = createJwtToken({ user });
  attachCookieToResponse({ token, res });

  res.status(StatusCodes.CREATED).json({
    msg: "user registered",
    user: jwtPayload,
  });
};

const logout = async (req, res) => {
  // we have to remove token by setting it negative expiry time
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  await TokensCollection.findOneAndDelete({ userId: req.user.userId });
  res.json({ message: "logout route" });
};

module.exports = {
  login,
  logout,
  register,
};
