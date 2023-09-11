require('express-async-errors');
const express = require('express');
const connectDB = require('./db/connect');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const IP = require('ip');

// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // middleware for handling json body, express have their own body parser.
app.use(morgan('dev')); // for debuging each and every route only in development mode
// app.use(cookieParser());
app.use(cookieParser(process.env.JWT_SECRET_KEY));
app.use(cors());
app.use(
  '/api/v1/users/showMe',
  rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 7, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: 'draft-7', // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
    legacyHeaders: false, // X-RateLimit-* headers
    // store: ... , // Use an external store for more precise rate limiting,
    handler: (request, response, next, options) =>
      // response.status(options.statusCode).json(options.message),
      response.status(options.statusCode).json({ msg: 'custome rate limiter' }),
  })
);

app.set('trust proxy', 1); // we are using this we don't want server to assume reverse proxy

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Allow requests from a specific origin
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, deviceId');
//   res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Credentials', true); // Allow credentials (e.g., cookies)

//   if (req.method === 'OPTIONS') {
//     // Handle preflight requests (OPTIONS method)
//     console.log('helo---------------------------------------');
//     return res.status(200).json({});
//   } else {
//     // Continue with the actual request

//     next();
//   }
// });

// routers
const { appRouter } = require('./routes/authRouter');
const { notFound } = require('./middlewares/notFound');
const errorHandlerMiddleware = require('./middlewares/allErrorsHandler');
const { usersRouter } = require('./routes/usersRouter');
const { StatusCodes } = require('http-status-codes');
const { productsRouter } = require('./routes/productsRouter');
const { reviewsRouter } = require('./routes/reviewsRouter');

app.get('/cookie-check', (req, res) => {
  console.log(req.cookies);
  console.log(req.signedCookies);
  res.status(StatusCodes.OK).send('Cookie......');
  // console.log(req.headers);
  // throw new CustomError('Checking Custom Error', StatusCodes.BAD_REQUEST);
});

app.get('/api/ip', (req, res) => {
  console.log('===========================================');
  // const ipAddress = IP.address(); // to check from whom exactly request is coming
  // console.log('🚀 ~ file: app.js:70 ~ app.get ~ ipAddress:', { ipAddress });
  const ipAddresses = req.header('x-forwarded-for');

  res.status(200).send(ipAddresses);
});

// routes
app.use('/api/v1/auth', appRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use(express.static('public'));

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

// Unique name why this failed, explore Schema
// Bearer token, how to verify that cookie belongs that user
// Hotstar, logged in one device, pop up and signout from all devices
// flow of pre and post hooks and responses.
// how far using cookie is safe, why sending token as cookie is not safe ?
// super admin cases
