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
    origin: "http://127.0.0.1:5500",
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
require("./db/passport");

app.get("/cookie-check", (req, res) => {
  console.log(req.cookies);
  console.log(req.signedCookies);
  throw new CustomError("Checking Custom Error", StatusCodes.BAD_REQUEST);
});

app.use(
  session({
    secret: "my_cookie",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 600000 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get(
  "/authenticate",
  (req, res, next) => {
    if (req?.user) {
      next();
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "You are not authenticated" });
    }
  },
  (req, res) => {
    console.log("req.user", req.user);
    return res.send("<h1>Authenicated Page</h1> <a href='/logout'>Logout</a>  <a href='/hello'>Hello</a>");
  }
);

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.send("<h1>Logout Page</h1> <a href='/authenticate'>Authenticate</a> <a href='http://127.0.0.1:5500/index.html'>Home</a>");
});

app.get("/hello", (req, res) => {
  res.send(`<h1>${JSON.stringify(req.user)}</h1>`);
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] }, () => {
    console.log("google auth");
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/authenticate",
    failureRedirect: "/logout",
  })
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
