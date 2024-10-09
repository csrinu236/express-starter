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

module.exports = { transporter };
