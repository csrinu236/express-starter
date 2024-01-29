const CustomError = require("../customError.js");
const User = require("../models/User.js");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { createJwtToken, attachCookieToResponse } = require("../utils/index.js");

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

  // // creating the session and store this session in session storage.
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

  // Here is where cookie will be created with key(user_sid) and sent to client and req.session.<value>
  // is stored in server memory(session-storage) as value to the key.
  req.session.user = user; // entire session object is destroyed after maxAge is expired
  // req.session.isAuth = true;

  // We should not rely on in-memory session-storage because, it there are
  // multiple express servers running behing a load balancer, there is no guarantee
  // that the server has the session-stored. So, we should use a global/centralised db to store like
  // Reddis-Cache or MongoDb or any other db.

  // That's why we use JWT Token, which is stateless is more famous.

  // <====== Session.save(callback) =====>
  // Save the session back to the store, replacing the contents on the store with the contents in memory (though a store may do something else--consult the store's documentation for exact behavior).
  // This method is automatically called at the end of the HTTP response if the session data has been altered (though this behavior can be altered with various options in the middleware constructor). Because of this, typically this method does not need to be called.
  // There are some cases where it is useful to call this method, for example, redirects, long-lived requests or in WebSockets.

  // req.session.save(function (err) {
  // session saved
  // });

  // const { token, jwtPayload } = createJwtToken({ user });
  // attachCookieToResponse({ token, res });
  res.status(StatusCodes.OK).json({
    message: "successfully logged in",
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
  // const { token, jwtPayload } = createJwtToken({ user });
  // attachCookieToResponse({ token, res });

  res.status(StatusCodes.CREATED).json({
    msg: "user registered",
  });
};

const logout = async (req, res) => {
  // we have to remove token by setting it negative expiry time
  req.session.destroy();
  //clear cookie
  res.clearCookie("user_sid");
  // res.cookie('token', 'logout', {
  //   expires: new Date(new Date().getTime()),
  // });
  res.json({ message: "logout route" });
};

module.exports = {
  login,
  logout,
  register,
};
