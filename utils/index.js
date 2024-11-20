const jwt = require('jsonwebtoken');
const CustomError = require('../customError');
const { StatusCodes } = require('http-status-codes');
const axios = require('axios');
const UsersCollection = require('../models/User');

const USERS_SESSIONS = new Map();

const verifyToken = ({ token }) => {
  return jwt.verify(token, process.env.JWT_SECRET_KEY);
};

const createJwtToken = ({ user }) => {
  console.log('createJwtToken', { user });
  // jwtPayload is the only thing we have inorder to access authenticated routes
  const jwtPayload = {
    name: user.name,
    userId: user._id,
    email: user.email,
    picture: user.picture,
  };
  const token = jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return { token, jwtPayload };
};

const attachCookieToResponse = ({ token, res }) => {
  // max size of a cookie is 4KB, so be carefull while creating jwt token, don't pass huge
  res.cookie('token', token, {
    httpOnly: true,
    // client side js shouldnot access cookie and hackers can't modify cookie to inject malicious data
    expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
    // cookieParser should be modified cookieParser(process.env.JSW_SECRET_KEY),
    // req.signedCookies instead of req.cookies
    // If a user tries to manually modify the cookie's value using developer tools or any
    // other method, the digital signature will no longer match, and the server will reject
    // the cookie as tampered with.
    // the server will add a digital signature to the cookie's value before sending it to the client's
    // browser.This digital signature is generated using a secret key known only to the server.
    // signed: true,
    // secure: process.env.NODE_ENV === 'production', // https false in development
    secure: true,
    sameSite: 'none', // lax, none, strict
  });
};

const checkPermission = (userIdFromDatabase, userFromCookie) => {
  if (userFromCookie.role === 'admin') return; // admins can see every user with their Id
  if (userFromCookie.userId === userIdFromDatabase.toString()) return;
  throw new CustomError(
    'no acces to get single user for you via id',
    StatusCodes.UNAUTHORIZED
  );
};

const getGoogleUser = async ({ access_token, id_token }) => {
  const rootUrl = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`;
  try {
    const { data } = await axios({
      method: 'get',
      url: rootUrl,
      headers: { Authorization: `Bearer ${id_token}` },
    });
    console.log('google user info data ============>', data);

    return data;
  } catch (error) {
    return Promise.reject(error);
  }
};

const getGoogleAuthTokens = async ({ code }) => {
  // Your app exchanges the authorization code for an access token and a refresh token by sending a POST request to Google’s OAuth 2.0 server, including your client ID, client secret, and the authorization code.

  const scope = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://mail.google.com/',
  ].join(' ');

  const rootUrl = 'https://oauth2.googleapis.com/token';
  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code',
    scope,
  };

  try {
    const { data } = await axios({
      method: 'post',
      url: rootUrl,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      params: values,
    });
    console.log('google auth data ============>', data);
    const { access_token, refresh_token, id_token } = data;
    // jwt.decode is different from jwt.verifiy which requires secret_key
    // decode will retrieve info embedded in the token that we see on "https://jwt.io"
    const { email, name, email_verified, picture } = jwt.decode(id_token);
    // console.log({ email, name, email_verified, picture });
    // or we can utilise below one
    // const {
    //   email: email_2,
    //   name: name_2,
    //   email_verified: email_verified_2,
    // } = await getGoogleUser({
    //   access_token: data?.access_token,
    //   id_token: data?.id_token,
    // });

    if (!email_verified) {
      // Primise reject will forward errors out of this getGoogleAuthTokens into next catch block
      return Promise.reject(new Error('Email not verified by Google'));
    }

    // upsert => update if found or insert if not found

    let user = await UsersCollection.findOneAndUpdate(
      {
        email: email,
      },
      {
        name: name,
        email: email,
        picture,
        access_token,
        refresh_token,
      },
      {
        new: true,
        upsert: true,
      }
    );

    // USERS_SESSIONS.set(email, {
    //   access_token,
    //   name,
    //   refresh_token,
    //   picture,
    // });

    console.log({ user });
    const { token } = createJwtToken({ user });
    return token;
    // return 'Hello';
  } catch (error) {
    console.log({ error });
    // Primise reject will forward errors out of this getGoogleAuthTokens into next catch block
    return Promise.reject(error);
  }
};

module.exports = {
  verifyToken,
  createJwtToken,
  attachCookieToResponse,
  checkPermission,
  getGoogleUser,
  getGoogleAuthTokens,
  USERS_SESSIONS,
};
