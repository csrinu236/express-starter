require("express-async-errors");
const express = require("express");
const passport = require("passport");
const connectDB = require("./db/connect");
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
var session = require("express-session");
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // middleware for handling json body, express have their own body parser.
app.use(morgan("dev")); // for debuging each and every route only in development mode
// app.use(cookieParser());
app.use(cookieParser(process.env.JWT_SECRET_KEY));
app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    credentials: true,
  })
);
app.use(fileUpload());
// Also read about cloudinary upload widget
// Cloudinary's Node.js SDK wraps Cloudinary's upload API and simplifies the integration.
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// routers
const { appRouter } = require("./routes/authRouter");
const { notFound } = require("./middlewares/notFound");
const errorHandlerMiddleware = require("./middlewares/allErrorsHandler");
const CustomError = require("./customError");
const { usersRouter } = require("./routes/usersRouter");
const { StatusCodes } = require("http-status-codes");
const { productsRouter } = require("./routes/productsRouter");
const { reviewsRouter } = require("./routes/reviewsRouter");
const { imageRouter } = require("./routes/imageRouter");
const { attachCookieToResponse } = require("./utils");
const { authorizeUser } = require("./middlewares/authMiddleware");
require("./db/passport");

app.get("/cookie-check", (req, res) => {
  console.log(req.cookies);
  console.log(req.signedCookies);
  throw new CustomError("Checking Custom Error", StatusCodes.BAD_REQUEST);
});

// app.use(
//   session({
//     secret: "my_cookie",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false, maxAge: 600000 },
//   })
// );

app.use(passport.initialize());
// app.use(passport.session());

app.get("/protected", authorizeUser, (req, res) => {
  res.status(200).json({ msg: "protected route", name: req.user.name, role: req.user.role });
  // return res.send("<h1>Protected Page</h1> <a href='/logout'>Logout</a>  <a href='/hello'>Hello</a>");
});

// app.get(
//   "/authenticate",
//   (req, res, next) => {
//     if (req?.user) {
//       console.log("req.user", req.user);
//       next();
//     } else {
//       return res.status(StatusCodes.UNAUTHORIZED).json({ message: "You are not authenticated" });
//     }
//   },
//   (req, res) => {
//     console.log("req.user", req.user);
//     return res.send("<h1>Authenicated Page</h1> <a href='/logout'>Logout</a>  <a href='/hello'>Hello</a>");
//   }
// );

app.get("/logout", (req, res) => {
  // req.session.destroy();
  res.send("<h1>Logout Page</h1> <a href='/authenticate'>Authenticate</a> <a href='http://127.0.0.1:5500/index.html'>Home</a>");
});

app.get("/hello", authorizeUser, (req, res) => {
  console.log("req.user", req.user);
  res.send(`<h1>Hello, ${req.user.name}</h1> <a href='/protected'>Authenticate</a>`);
});

// Entry 1
// comment "/auth/google/callback" route and check whether this route hit is calling GET "/auth/google/callback" or not
app.get("/auth/google", passport.authenticate("google", { scope: ["email", "profile", "openid"], accessType: "offline", prompt: "consent" }));

// Entry 4
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    // successRedirect: "/authenticate",
    // this will redirect to /authenticate route with pesisted req.user where as res.redirect(token based) will not persist req.user
    failureRedirect: "/logout",
    session: false,
  }),
  function (req, res) {
    console.log("req.user", req.user); // token from Entry 3 to attach cookie to response

    attachCookieToResponse({ token: req.user, res });
    // how to attch this cookie to response of redirect url ?
    // res.redirect("http://
    // res.session = req.user => modifications made to req are not available in the next middleware
    // basically here we are redirect to clientside url.
    res.status(200).redirect("http://localhost:5500/protected.html");
    // res.redirect will not persist the req.user, also we rely on cookie for authentication, so no problem.
    // cookie verification(verifyToken function) will add req.user to req object.
  }
);

// routes
app.use("/api/v1/auth", appRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/reviews", reviewsRouter);
app.use("/api/v1/images", imageRouter);

app.use(errorHandlerMiddleware); // all errors will come here
app.use(notFound);

const start = async () => {
  try {
    const URI = "mongodb://localhost:27017/e-commerce";
    await connectDB(URI);
    // await connectDB(process.env.MONGODB_URI);
    app.listen(5000, () => {
      console.log("APIs are running on port 5000");
    });
  } catch (error) {}
};

start();
