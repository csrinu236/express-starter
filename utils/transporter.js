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

// SMTP verification performs network I/O. Keep it opt-in so importing the
// auth utilities during a serverless cold start does not open an SMTP connection.
const verifyTransporter = () => transporter.verify();

module.exports = { transporter, verifyTransporter };
