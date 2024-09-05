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
        origin: [
            'https://my-front-end-app.netlify.app',
            'http://localhost:3000',
        ],
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

app.get('/.netlify/functions/app/apple', (req, res) => {
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
app.use('/.netlify/functions/app/v1/auth', appRouter);
app.use('/.netlify/functions/app/v1/users', usersRouter);
app.use('/.netlify/functions/app/v1/products', productsRouter);
app.use('/.netlify/functions/app/v1/reviews', reviewsRouter);
app.use('/.netlify/functions/app/v1/images', imageRouter);

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

start();

module.exports.handler = serverless(app);

// export default app;
