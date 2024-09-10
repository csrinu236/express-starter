const jwt = require('jsonwebtoken');
const CustomError = require('../customError');
const { StatusCodes } = require('http-status-codes');
const axios = require('axios');
const UsersCollection = require('../models/User');

const verifyToken = ({ token }) => {
  return jwt.verify(token, process.env.JWT_SECRET_KEY);
};

const createJwtToken = ({ user }) => {
  // jwtPayload is the only thing we have inorder to access authenticated routes
  const jwtPayload = {
    name: user.name, // to say Hi username on home page
    userId: user._id, // must needed to access user specific cartItems and Reviews
    role: user.role, // since we have role based authentications, we need this
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
    signed: true,
    secure: process.env.NODE_ENV === 'production', // https false in development
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

// Entry 4 token making when authorization is successfull
const getGoogleAuthTokens = async ({ code }) => {
  const rootUrl = 'https://oauth2.googleapis.com/token';
  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: 'http://localhost:5000/auth/google/callback',
    grant_type: 'authorization_code',
  };

  try {
    const { data } = await axios({
      method: 'post',
      url: rootUrl,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      params: values,
    });
    console.log('google auth data ============>', data);
    // jwt.decode is different from jwt.verifiy which requires secret_key
    // decode will retrieve info embedded in the token that we see on "https://jwt.io"
    const { email, name, email_verified } = jwt.decode(data?.id_token);
    // or we can utilise below one
    const {
      email: email_2,
      name: name_2,
      email_verified: email_verified_2,
    } = await getGoogleUser({
      access_token: data?.access_token,
      id_token: data?.id_token,
    });

    if (!email_verified) {
      // Primise reject will forward errors out of this getGoogleAuthTokens into next catch block
      return Promise.reject(new Error('Email not verified'));
    }
    // upsert => update if found or insert if not found
    let user = await UsersCollection.findOneAndUpdate(
      {
        email: email,
      },
      {
        name: name + 'hhhh',
        email: email,
        role: 'user',
        isSocialMedia: true,
      },
      {
        new: true,
        insert: true,
      }
    );
    // if (!user) {
    //   user = {
    //     name: name,
    //     email: email,
    //     role: 'user',
    //     isSocialMedia: true,
    //   };
    //   await UsersCollection.create({ ...user });
    // }
    console.log(user);
    const { token } = createJwtToken({ user });
    return token;
  } catch (error) {
    // Primise reject will forward errors out of this getGoogleAuthTokens into next catch block
    return Promise.reject(error);
  }
};

const getGitHubAuthTokens = async ({ code }) => {
  const rootUrl = 'https://github.com/login/oauth/access_token';
  const values = {
    code,
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    redirect_uri: 'http://localhost:5000/auth/github/callback',
    grant_type: 'authorization_code',
  };

  try {
    // Request access token from GitHub
    const { data } = await axios({
      method: 'post',
      url: rootUrl,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json', // GitHub returns JSON when this header is set
      },
      data: values,
    });

    const { access_token } = data;

    // Fetch the GitHub user's profile data using the access token
    const { data: userData } = await axios({
      method: 'get',
      url: 'https://api.github.com/user',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    let { email, name, id: githubId } = userData;

    // Ensure the user has a public email set in GitHub (GitHub may not return email if not set)
    if (!email) {
      // If no public email, fetch private emails (requires user:email scope)
      const { data: emails } = await axios({
        method: 'get',
        url: 'https://api.github.com/user/emails',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      console.log({ emails });
      const primaryEmail = emails.find(
        (emailObj) => emailObj.primary && emailObj.verified
      );
      if (!primaryEmail) {
        return Promise.reject(
          new Error('No verified email found for GitHub user.')
        );
      }
      email = primaryEmail.email;
    }

    // Upsert user into your database
    let user = await UsersCollection.findOneAndUpdate(
      {
        email: email,
      },
      {
        name: name,
        email: email,
        role: 'user',
        isSocialMedia: true,
      },
      {
        new: true,
        upsert: true, // Update if found, insert if not
      }
    );

    console.log(user);

    // Generate JWT token for the user
    const { token } = createJwtToken({ user });
    return token;
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = {
  verifyToken,
  createJwtToken,
  attachCookieToResponse,
  checkPermission,
  getGoogleAuthTokens,
  getGitHubAuthTokens,
};
