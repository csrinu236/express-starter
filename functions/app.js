require('express-async-errors');
const serverless = require('serverless-http');
const express = require('express');
const path = require('path');
const connectDB = require('../db/connect');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const fileUpload = require('express-fileupload');
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // middleware for handling json body, express have their own body parser.
app.use(morgan('dev')); // for debuging each and every route only in development mode
// app.use(cookieParser());
// app.use(cookieParser(process.env.JWT_SECRET_KEY));
app.use(cors());
const bodyParser = require('body-parser');

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

app.use(fileUpload());

const generateGoogleAuthLink = async (req, res) => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

  const options = {
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',

    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://mail.google.com/',
      // 'https://www.googleapis.com/auth/gmail.send',
    ].join(' '),
  };
  // Scopes are embedded inside access_token => the above access_token can't be used for
  // other google services because we only mentioned profile and email scope, not spreadsheets, drive.
  // so this access_token can't be used to access spreadsheets, drive, docs, etc
  // https://www.googleapis.com/auth/spreadsheets
  // https://www.googleapis.com/auth/drive.
  // https://www.googleapis.com/auth/documents

  const queryParams = new URLSearchParams(options);

  return res.redirect(`${rootUrl}?${queryParams.toString()}`);
  // will be redirected to
  // http://localhost:5000/auth/google/callback?code=4%2F0AQlEd8xMAdRKckM4rWUB-cywwazinq77ThSeeFtVKcbpJ3DrACnj78sSBcsfFd-gjDr12w&scope=email+profile+openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&authuser=0&prompt=consent
  // need to extract query param code
};

app.get('/auth/google/callback', async (req, res) => {
  // Extract code query param from
  const code = req.query.code;
  // Entry 4 => After making token, attack token to cookies
  // res.redirect will persist the cookie along with response, so cookies will be attached to response
  try {
    const token = await getGoogleAuthTokens({ code });
    attachCookieToResponse({ token, res });
    console.log(
      '<================we came here =============> ',
      { token },
      { clientURL: process.env.CLIENT_URL },
      { enviroment: process.env.NODE_ENV },
      { 'Cookies:': res.get('token') }
    );
  } catch (error) {
    console.log('<================error here=============> ', error.message);
  }
  return res.redirect(`${process.env.CLIENT_URL}`);
});

app.get('/auth/google', generateGoogleAuthLink);

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
    attachments: [
      {
        path: process.cwd() + '/uploads/Aug.pdf',
      },
      {
        path: process.cwd() + '/uploads/Sep.pdf',
      },
      {
        path: process.cwd() + '/uploads/June.pdf',
      },

      {
        path: process.cwd() + '/uploads/July.pdf',
      },
      {
        path: process.cwd() + '/uploads/Oct.pdf',
      },
    ],
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
const { transporter } = require('../utils/transporter');
const { getGoogleAuthTokens, attachCookieToResponse } = require('../utils');

// This also works
// app.get('/.netlify/functions/app/health', (req, res) => {
//   res.status(StatusCodes.OK).json({ msg: 'Health Route working fine' });
// });

app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({ msg: 'Health Route working fine' });
});

// routes
app.use('/api/v1/images', imageRouter);
app.use('/', express.static(path.join(__dirname, 'build')));

app.use(errorHandlerMiddleware); // all errors will come here
app.use(notFound);

const start = async () => {
  try {
    // const URI = "mongodb://localhost:27017/e-commerce";
    // await connectDB(URI);
    await connectDB(process.env.MONGODB_URI);
    await transporter
      .verify()
      .then((e) => {
        console.log({ success: e });
      })
      .catch((e) => {
        Promise.reject(e);
      });
    // app.listen(process.env.PORT || 5000, () => {
    //     console.log(`APIs are running on port ${process.env.PORT}`);
    // });
  } catch (error) {
    console.log('SOMETHING WENT WRONG IN STARTING THE APP', { error });
  }
};

const appStarter = serverless(app);
module.exports.handler = async (event, context) => {
  await start();
  return appStarter(event, context);
};

// export default app;
