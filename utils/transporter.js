// Check this video: https://www.youtube.com/watch?v=QDIOBsMBEI0
const nodemailer = require('nodemailer');
const { USERS_SESSIONS } = require('.');
const UsersCollection = require('../models/User');
// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   service: 'gmail',
//   port: 587,
//   secure: false, // true for port 465, false for other ports

//   auth: {
//     type: 'OAuth2',
//     user: process.env.SENDER_EMAIL,
//     clientId: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     accessToken:
//       'ya29.a0AeDClZBnqnaQxSvDBRxEHLToqGtigmuTXjKpjYftf5Mkii4GtMfekP5V_I05rLX6bwVGcqEVbJinmf63LZezAuxPEll16_PsxflqjZfPkhLvQUzVT3jeg_ynUybo2KRHYqJyCEZNQusaEC9VV81Csd7UpOJxVj2AG512ZVk_aCgYKAesSARMSFQHGX2MiIw_Hi3ijuGBnG8lbIrNgRA0175',
//     refreshToken:
//       '1//0gkay454U5Mv-CgYIARAAGBASNwF-L9IrhF1EzfsbTfNEmNv8xuNN7lhaLVlaXDlhDhvxUszxJ9gLxVlDWlytB_xkhJXE2hRBdrE',

//     expires: 1484314697598,
//   },
// });

const createTransporterForUser = async (userId) => {
  const { access_token, refresh_token, email, name } =
    await UsersCollection.findOne({
      userId,
    });

  console.log({ access_token, refresh_token, email });
  USERS_SESSIONS.set(email, { access_token, refresh_token });
  if (!access_token || !refresh_token) {
    throw new Error(`No tokens found for user`);
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    service: 'gmail',
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      type: 'OAuth2',
      user: email,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: refresh_token,
      accessToken: access_token,
    },
  });

  await transporter
    .verify()
    .then((e) => {
      console.log({ success: e });
    })
    .catch((e) => {
      Promise.reject(e);
    });

  return { transporter, refresh_token, name, senderEmail: email };
};

module.exports = { createTransporterForUser };
