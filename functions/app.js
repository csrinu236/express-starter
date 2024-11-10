require('express-async-errors');
const serverless = require('serverless-http');
const express = require('express');
const path = require('path');
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

app.use('/', express.static(path.join(__dirname, 'build')));

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

// This also works
// app.get('/.netlify/functions/app/health', (req, res) => {
//   res.status(StatusCodes.OK).json({ msg: 'Health Route working fine' });
// });

app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({ msg: 'Health Route working fine' });
});

// routes
app.use('/api/v1/images', imageRouter);

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
