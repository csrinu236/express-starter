require('express-async-errors');
const serverless = require('serverless-http');
const express = require('express');
const connectDB = require('../db/connect');
const cookieParser = require('cookie-parser');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // middleware for handling json body, express have their own body parser.
app.use(morgan('dev')); // for debuging each and every route only in development mode
app.use(cookieParser());
// app.use(cookieParser(process.env.JWT_SECRET_KEY));
app.use(
  cors({
    origin: [`${process.env.CLIENT_URL}`, 'http://localhost:3000'],
    credentials: true,
  })
);

// routers
const { authRouter } = require('../routes/authRouter');
const { notFound } = require('../middlewares/notFound');
const errorHandlerMiddleware = require('../middlewares/allErrorsHandler');
const CustomError = require('../customError');
const { StatusCodes } = require('http-status-codes');

const {
  getGoogleAuthTokens,
  attachCookieToResponse,
  getGitHubAuthTokens,
} = require('../utils');
const { cardsRouter } = require('../routes/cardsRouter');

const tempRouter = express.Router();

tempRouter.get('/health', (req, res) => {
  res.status(200).json({ msg: 'Health Okay' });
});

tempRouter.get('/logout', (req, res) => {
  res.cookie('token', null, {
    expires: new Date(new Date().getTime() - 1000),
  });
  return res.redirect(`${process.env.CLIENT_URL}/login`);
});

tempRouter.get('/cookie-check', (req, res) => {
  console.log(req.cookies);
  console.log(req.signedCookies);
  throw new CustomError('Checking Custom Error', StatusCodes.BAD_REQUEST);
});

// Entry 3
tempRouter.get('/auth/google/callback', async (req, res) => {
  // Extract code query param from
  const code = req.query.code;
  // Entry 4=> After making token, attack token to cookies
  // res.redirect will persist the cookie along with response, so cookies will be attached to response
  try {
    const token = await getGoogleAuthTokens({ code });
    attachCookieToResponse({ token, res });
    console.log('<================we came here =============> ', { token });
  } catch (error) {
    console.log('<================error here=============> ', error.message);
  }
  res.redirect(process.env.CLIENT_URL);
});

tempRouter.get('/auth/github/callback', async (req, res) => {
  const code = req.query.code;
  const token = await getGitHubAuthTokens({ code });
  attachCookieToResponse({ token, res });
  res.redirect(process.env.CLIENT_URL);
});

// routes
app.use('/.netlify/functions/app', tempRouter);
app.use('/.netlify/functions/app/api/v1/auth', authRouter);
app.use('/.netlify/functions/app/api/v1/cards', cardsRouter);

app.use(errorHandlerMiddleware); // all errors will come here
app.use(notFound);

// ================= uncomment for npm run dev

// const start = async () => {
//   try {
//     // const URI = 'mongodb://localhost:27017/no-cost-emi';
//     // await connectDB(URI);
//     await connectDB(process.env.MONGODB_URI);
//     app.listen(5000, () => {
//       console.log('APIs are running on port 5000');
//     });
//   } catch (error) {}
// };

// start();

// ================= uncomment for npm run dev

const appStarter = serverless(app);

module.exports.handler = async (event, context) => {
  await connectDB(process.env.MONGODB_URI);
  return appStarter(event, context);
};
