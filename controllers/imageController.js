const path = require('path');
const { StatusCodes } = require('http-status-codes');
const fs = require('fs/promises');
const axios = require('axios');
const { createTransporterForUser } = require('../utils/transporter');
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

  console.log('==============> here111 =========>');

  const { transporter, name, senderEmail } = await createTransporterForUser(
    req?.user?.userId
  );

  console.log('==============> here222 =========>');

  transporter.set('oauth2_provision_cb', async (user, renew, callback) => {
    console.log({ user, renew });
    let { access_token } = USERS_SESSIONS.get(user);
    if (!access_token) {
      return callback(new Error('Unknown user'));
    } else {
      console.log('==============> CallBack =========>');
      const { refresh_token } = USERS_SESSIONS.get(user);
      access_token = await getAccessToken(refresh_token);
      USERS_SESSIONS.set(user, { refresh_token, access_token });
      console.log('==============> CallBack - 2 =========>');

      return callback(null, access_token);
    }
  });

  const mailOptions = {
    from: {
      name,
      address: senderEmail,
    },
    auth: {
      user: senderEmail,
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

  let result = await transporter.sendMail(mailOptions);

  for (const uploadPath of uploadedFiles) {
    await fs.unlink(uploadPath);
  }

  res.status(StatusCodes.OK).json({ msg: 'Image Uploaded' });
};

module.exports = {
  imageUpload,
};
