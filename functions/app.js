require('express-async-errors');
const serverless = require('serverless-http');
const express = require('express');
const connectDB = require('../db/connect');
const cookieParser = require('cookie-parser');
const app = express();
const fs = require('fs');
const path = require('path');
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
    credentials: true,
    origin: [
      'https://nocostemi-calcculator.netlify.app',
      'http://localhost:3000',
    ],
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

// tempRouter.get('/', async (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', `index.html`));
// });

// tempRouter.get('/login', async (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', `login.html`));
// });

// tempRouter.get('/saved', async (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', `saved.html`));
// });

// tempRouter.use(
//   '/_next',
//   express.static(path.join(__dirname, 'build', '_next'))
// );

tempRouter.use('/', express.static(path.join(__dirname, 'build')));

function getFileSystemStructure(dirPath) {
  let results = {};

  // Read directory
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    // Skip files or directories that start with a dot
    if (file.startsWith('.') || file.startsWith('node_modules')) {
      return;
    }

    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      // If it's a directory, recursively get its structure
      results[file] = getFileSystemStructure(fullPath);
    } else {
      // If it's a file, add it to the results
      results[file] = null; // or you can add more details about the file
    }
  });

  return results;
}

tempRouter.get('/health', (req, res) => {
  const fileSystem = getFileSystemStructure(process.cwd());
  res.status(200).json({ msg: 'Health Okay', fileSystem });
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
  console.log(res.cookies);
  return res.redirect(`${process.env.CLIENT_URL}/`);
});

tempRouter.get('/auth/github/callback', async (req, res) => {
  const code = req.query.code;
  const token = await getGitHubAuthTokens({ code });
  attachCookieToResponse({ token, res });
  return res.redirect(process.env.CLIENT_URL);
});

// routes
app.use('/', tempRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/cards', cardsRouter);

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
