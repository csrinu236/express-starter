require('express-async-errors');
const express = require('express');
const connectDB = require('./db/connect');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // middleware for handling json body, express have their own body parser.
app.use(morgan('dev')); // for debuging each and every route only in development mode
// app.use(cookieParser());
app.use(cookieParser(process.env.JWT_SECRET_KEY));
app.use(cors());
app.use(fileUpload());
// Also read about cloudinary upload widget
// Cloudinary's Node.js SDK wraps Cloudinary's upload API and simplifies the integration.
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// routers
const { appRouter } = require('./routes/authRouter');
const { notFound } = require('./middlewares/notFound');
const errorHandlerMiddleware = require('./middlewares/allErrorsHandler');
const CustomError = require('./customError');
const { usersRouter } = require('./routes/usersRouter');
const { StatusCodes } = require('http-status-codes');
const { productsRouter } = require('./routes/productsRouter');
const { reviewsRouter } = require('./routes/reviewsRouter');
const { imageRouter } = require('./routes/imageRouter');
const {
  getGoogleAuthTokens,
  attachCookieToResponse,
  getGitHubAuthTokens,
} = require('./utils');

app.get('/health', (req, res) => {
  res.status(200).json({ msg: 'Health Okay' });
});

app.get('/cookie-check', (req, res) => {
  console.log(req.cookies);
  console.log(req.signedCookies);
  throw new CustomError('Checking Custom Error', StatusCodes.BAD_REQUEST);
});

// Entry 3
app.get('/auth/google/callback', async (req, res) => {
  // Extract code query param from
  const code = req.query.code;
  // Entry 4=> After making token, attack token to cookies
  // res.redirect will persist the cookie along with response, so cookies will be attached to response
  const token = await getGoogleAuthTokens({ code });
  attachCookieToResponse({ token, res });
  res.redirect('http://localhost:3000/dashboard');
});

app.get('/auth/github/callback', async (req, res) => {
  const code = req.query.code;
  const token = await getGitHubAuthTokens({ code });
  attachCookieToResponse({ token, res });
  res.redirect('http://localhost:3000/dashboard');
});

// routes
app.use('/api/v1/auth', appRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/images', imageRouter);

app.use(errorHandlerMiddleware); // all errors will come here
app.use(notFound);

const start = async () => {
  try {
    const URI = 'mongodb://localhost:27017/e-commerce';
    await connectDB(URI);
    // await connectDB(process.env.MONGODB_URI);
    app.listen(5000, () => {
      console.log('APIs are running on port 5000');
    });
  } catch (error) {}
};

start();
