require('express-async-errors');
const serverless = require('serverless-http');
const express = require('express');
const connectDB = require('../db/connect');
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
app.use(
  cors({
    credentials: true,
    origin: ['https://my-front-end-app.netlify.app', 'http://localhost:3000'],
  })
);
const bodyParser = require('body-parser');

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

app.use(fileUpload());
// Also read about cloudinary upload widget
// Cloudinary's Node.js SDK wraps Cloudinary's upload API and simplifies the integration.
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Check this video: https://www.youtube.com/watch?v=QDIOBsMBEI0
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  service: 'gmail',
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD,
  },
});

transporter
  .verify()
  .then((e) => {
    console.log({ success: e });
  })
  .catch((e) => {
    console.log({ failed: e });
  });

app.get('/send-mail', async (req, res) => {
  // Check this video: https://www.youtube.com/watch?v=QDIOBsMBEI0
  console.log('llllllllll==========================');

  let mailOptions = {
    from: {
      name: 'Chenna Sreenu',
      address: 'csrinu236@gmail.com',
    },
    to: 'csrinu303@gmail.com',
    subject: 'Request for Credit Limit Enhacement',
    html: getHtml(),
  };

  let result = await transporter.sendMail(mailOptions);

  return res.status(200).send({ result });
});

// routers
const { appRouter } = require('../routes/authRouter');
const { notFound } = require('../middlewares/notFound');
const errorHandlerMiddleware = require('../middlewares/allErrorsHandler');
const CustomError = require('../customError');
const { usersRouter } = require('../routes/usersRouter');
const { StatusCodes } = require('http-status-codes');
const { productsRouter } = require('../routes/productsRouter');
const { reviewsRouter } = require('../routes/reviewsRouter');
const { imageRouter } = require('../routes/imageRouter');
const { authorizeUser } = require('../middlewares/authMiddleware');
const getHtml = require('../utils/getHtml');

// This also works
// app.get('/.netlify/functions/app/health', (req, res) => {
//   res.status(StatusCodes.OK).json({ msg: 'Health Route working fine' });
// });

app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({ msg: 'Health Route working fine' });
});

app.get('/cookie-check', (req, res) => {
  console.log(req.cookies);
  console.log(req.signedCookies);
  throw new CustomError('Checking Custom Error', StatusCodes.BAD_REQUEST);
});

// ================ bank amount transfer
app.post('/bank-transfer', authorizeUser, (req, res) => {
  const { amount, account } = req.body;
  res.status(StatusCodes.CREATED).json({
    msg: 'Bank Transfer Successfull',
    amount,
    account,
  });
});
app.get('/bank-transfer', authorizeUser, (req, res) => {
  res.status(StatusCodes.OK).json({ msg: 'Bank Transfer Get request' });
});
// =============== bank amount transfer

// routes
app.use('/v1/auth', appRouter);
app.use('/v1/users', usersRouter);
app.use('/v1/products', productsRouter);
app.use('/v1/reviews', reviewsRouter);
app.use('/v1/images', imageRouter);

app.use(errorHandlerMiddleware); // all errors will come here
app.use(notFound);

const start = async () => {
  try {
    // const URI = "mongodb://localhost:27017/e-commerce";
    // await connectDB(URI);
    await connectDB(process.env.MONGODB_URI);
    // app.listen(process.env.PORT || 5000, () => {
    //     console.log(`APIs are running on port ${process.env.PORT}`);
    // });
  } catch (error) {
    console.log('SOMETHING WENT WRONG IN STARTING THE APP');
  }
};

const appStarter = serverless(app);
module.exports.handler = async (event, context) => {
  await start();
  return appStarter(event, context);
};

// export default app;
