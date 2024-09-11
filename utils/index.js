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
  // Your app exchanges the authorization code for an access token and a refresh token by sending a POST request to Google’s OAuth 2.0 server, including your client ID, client secret, and the authorization code.

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

// Various Scopes:-

// Google Drive Scopes
// https://www.googleapis.com/auth/drive
// Full, unrestricted access to all files in the user's Google Drive, including reading, writing, deleting, and managing files.

// https://www.googleapis.com/auth/drive.file
// Access to only the files created or opened by your app in the user's Google Drive. You can read, modify, and delete only those files.

// https://www.googleapis.com/auth/drive.readonly
// Read-only access to all files in the user's Google Drive.

// https://www.googleapis.com/auth/drive.metadata.readonly
// Read-only access to file metadata in the user's Google Drive (e.g., file name, type, etc.), but not the file content itself.

// Google Sheets Scopes
// https://www.googleapis.com/auth/spreadsheets
// Full access to Google Sheets files, including reading, writing, and modifying spreadsheet content.

// https://www.googleapis.com/auth/spreadsheets.readonly
// Read-only access to Google Sheets files.

// Google Docs Scopes
// https://www.googleapis.com/auth/documents
// Full access to Google Docs, including reading, writing, and modifying documents.

// https://www.googleapis.com/auth/documents.readonly
// Read-only access to Google Docs.

// Gmail Scopes
// https://mail.google.com/
// Full access to a user's Gmail account, including reading, sending, deleting, and managing emails.

// https://www.googleapis.com/auth/gmail.readonly
// Read-only access to a user's Gmail, allowing you to view messages but not send, delete, or modify them.

// https://www.googleapis.com/auth/gmail.send
// Access to send email messages from the user's Gmail account, but no other permissions.

// https://www.googleapis.com/auth/gmail.modify
// Access to modify labels and mark messages in the user's Gmail but no permission to read or delete emails.

// Google Calendar Scopes
// https://www.googleapis.com/auth/calendar
// Full access to a user's Google Calendar, including reading, writing, and deleting calendar events.

// https://www.googleapis.com/auth/calendar.readonly
// Read-only access to a user's Google Calendar.

// Google Contacts Scopes
// https://www.googleapis.com/auth/contacts
// Full access to a user's Google Contacts, including reading, writing, and modifying contacts.

// https://www.googleapis.com/auth/contacts.readonly
// Read-only access to the user's Google Contacts.

// Google Maps Scopes
// https://www.googleapis.com/auth/mapsengine
// Access to the user's Google Maps Engine data, allowing you to create, view, and modify maps and layers.
// YouTube Scopes
// https://www.googleapis.com/auth/youtube
// Full access to a user's YouTube account, including viewing, managing, and uploading videos.

// https://www.googleapis.com/auth/youtube.readonly
// Read-only access to a user's YouTube account, allowing you to view videos and playlists.

// Google Analytics Scopes
// https://www.googleapis.com/auth/analytics.readonly
// Read-only access to a user's Google Analytics data.
// Google Cloud Platform Scopes
// https://www.googleapis.com/auth/cloud-platform
// Full access to Google Cloud Platform services.

// https://www.googleapis.com/auth/devstorage.read_write
// Read and write access to Google Cloud Storage buckets.

// Profile and Basic Information Scopes
// https://www.googleapis.com/auth/userinfo.profile
// Access to basic profile information such as the user’s name, profile picture, and public information.

// https://www.googleapis.com/auth/userinfo.email
// Access to the user's email address.

// Google Tasks Scopes
// https://www.googleapis.com/auth/tasks
// Full access to the user's Google Tasks, allowing the creation, modification, and deletion of tasks.

// https://www.googleapis.com/auth/tasks.readonly
// Read-only access to the user's Google Tasks.
