// Check this video: https://www.youtube.com/watch?v=QDIOBsMBEI0
const nodemailer = require('nodemailer');
const { USERS_SESSIONS } = require('.');
const UsersCollection = require('../models/User');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  service: 'gmail',
  port: 587,
  secure: false, // true for port 465, false for other ports
  // auth: {
  //   user: process.env.SENDER_EMAIL,
  //   pass: process.env.SENDER_PASSWORD,
  // },
  auth: {
    type: 'OAuth2',
    user: process.env.SENDER_EMAIL,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    accessToken:
      'ya29.a0AeDClZBnqnaQxSvDBRxEHLToqGtigmuTXjKpjYftf5Mkii4GtMfekP5V_I05rLX6bwVGcqEVbJinmf63LZezAuxPEll16_PsxflqjZfPkhLvQUzVT3jeg_ynUybo2KRHYqJyCEZNQusaEC9VV81Csd7UpOJxVj2AG512ZVk_aCgYKAesSARMSFQHGX2MiIw_Hi3ijuGBnG8lbIrNgRA0175',
    refreshToken:
      '1//0gkay454U5Mv-CgYIARAAGBASNwF-L9IrhF1EzfsbTfNEmNv8xuNN7lhaLVlaXDlhDhvxUszxJ9gLxVlDWlytB_xkhJXE2hRBdrE',

    expires: 1484314697598,
  },
});

async function getAccessTokenUsingRefreshToken(refreshToken) {
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const params = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  };

  const { data } = await axios.post(tokenUrl, null, { params });
  return data.access_token;
}

const createTransporterForUser = async (email) => {
  const { access_token, refresh_token } = await UsersCollection.findOne({
    email,
  });

  console.log({ access_token, refresh_token });
  if (!access_token || !refresh_token) {
    throw new Error(`No tokens found for user: ${email}`);
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

  return { transporter, refresh_token };
};

module.exports = { transporter, createTransporterForUser };
