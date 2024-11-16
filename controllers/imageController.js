const path = require('path');
const { StatusCodes } = require('http-status-codes');
const fs = require('fs/promises');
const axios = require('axios');
const {
  transporter,
  createTransporterForUser,
} = require('../utils/transporter');
const { USERS_SESSIONS } = require('../utils');

async function getAccessToken(refreshToken) {
  const tokenUrl = 'https://oauth2.googleapis.com/token';

  const params = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  };

  try {
    const { data } = await axios.post(tokenUrl, null, {
      params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token } = data;
    console.log(`Access Token: ${access_token}`);

    return access_token;
  } catch (error) {
    console.error(
      'Error fetching access token:',
      error.response?.data || error.message
    );
    throw new Error('Failed to fetch access token');
  }
}

const imageUpload = async (req, res) => {
  const { htmlBody, email } = req.body;

  const uploadedFiles = [];
  const sampleFileKeys = req?.files ? Object.keys(req.files) : [];

  if (sampleFileKeys.length > 0) {
    for (const iterator of sampleFileKeys) {
      const sampleFile = req.files[iterator];
      console.log(
        '🚀 ~ file: imageController.js:7 ~ imageUpload ~ sampleFile:',
        req.files[iterator]
      );
      const uploadPath = path.join(__dirname, '../uploads', sampleFile.name);
      uploadedFiles.push(uploadPath);
      await sampleFile.mv(uploadPath);
    }
  }

  let mailOptions = {
    from: {
      name: 'Chenna Sreenu',
      address: 'csrinu236@gmail.com',
    },
    auth: {
      user: 'csrinu236@gmail.com',
      accessToken:
        'ya29.GlvpBbERNZcel53gIAg1s7mTmFzog5MF3RYFXlCruB1gjAOPHbe0a75wGYid919jCffHxurGtb7NEHIvYBVXpISFGH_YB3mNynmRNdeXw4z5z_6Bl5sf8PC9bG5J',
    },
    to: email,
    subject: 'Request for Credit Limit Enhacement',
    html: htmlBody,
    attachments: uploadedFiles.map((fileName) => {
      return { path: fileName };
    }),
  };
  console.log('==============> here111 =========>');

  const { transporter, refresh_token } = await createTransporterForUser(
    req.user.email
  );

  console.log('==============> here222 =========>');

  transporter.set('oauth2_provision_cb', async (user, renew, callback) => {
    console.log({ user, renew });
    let access_token =
      'ya29.a0AeDClZBnqnaQxSvDBRxEHLToqGtigmuTXjKpjYftf5Mkii4GtMfekP5V_I05rLX6bwVGcqEVbJinmf63LZezAuxPEll16_PsxflqjZfPkhLvQUzVT3jeg_ynUybo2KRHYqJyCEZNQusaEC9VV81Csd7UpOJxVj2AG512ZVk_aCgYKAesSARMSFQHGX2MiIw_Hi3ijuGBnG8lbIrNgRA0175';
    // let { access_token, refresh_token } = USERS_SESSIONS.get(user);
    if (!access_token) {
      return callback(new Error('Unknown user'));
    } else {
      console.log('==============> CallBack =========>');
      const access_token = await getAccessToken(refresh_token);
      // USERS_SESSIONS.set();
      return callback(null, access_token);
    }
  });

  let result = await transporter.sendMail(mailOptions);

  for (const uploadPath of uploadedFiles) {
    await fs.unlink(uploadPath);
  }

  res.status(StatusCodes.OK).send('Image Uploaded');
};

module.exports = {
  imageUpload,
};
