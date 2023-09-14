require('express-async-errors');
const express = require('express');
const connectDB = require('./db/connect');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');

console.log('APP_JS Parsing....');

// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // middleware for handling json body, express have their own body parser.
app.use(morgan('dev')); // for debuging each and every route only in development mode
// app.use(cookieParser());
app.use(cookieParser(process.env.JWT_SECRET_KEY));
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

// With this middleware, req.session object is created, and when expired, session object dies
// so when user is logged in successfully, {user_sid: session} are stored as key value
// pairs in server memory and user_sid(key value) is sent as cookie.
app.use(
  '/',
  session({
    name: 'user_sid',
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 5,
      httpOnly: true,
    },
  })
);

// routers
const { appRouter } = require('./routes/authRouter');
const { notFound } = require('./middlewares/notFound');
const errorHandlerMiddleware = require('./middlewares/allErrorsHandler');
const CustomError = require('./customError');
const { usersRouter } = require('./routes/usersRouter');
const { StatusCodes } = require('http-status-codes');
const { productsRouter } = require('./routes/productsRouter');
const { reviewsRouter } = require('./routes/reviewsRouter');

app.get('/cookie-check', (req, res) => {
  throw new CustomError('Checking Custom Error', StatusCodes.BAD_REQUEST);
});

// routes
app.use('/api/v1/auth', appRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/reviews', reviewsRouter);

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
