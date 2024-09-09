var GoogleStrategy = require("passport-google-oauth20").Strategy;

const passport = require("passport");
const UsersCollection = require("../models/User");
const { createJwtToken } = require("../utils");

const FB_CLIENT_SECRET = "49e8c8b5868abbdce69b056c588a924a";
const FB_CLIENT_ID = "392540833328136";

// Entry 2
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
      scope: ["profile", "email", "openid"],
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, params, profile, cb) {
      // Entry 3
      // when user is authenticated, this callback will be called
      // accessToken expires in 1 hour
      // console.log({ accessToken, refreshToken, profile });
      //   User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //     return cb(err, user);
      //   });
      // console.log({ params, profile });
      try {
        // if you want to utilise other google services like google calender
        // for example use accessToken, refreshToken.
        let user = await UsersCollection.findOne({ email: profile.emails[0].value });
        // request.user = user;
        if (!user) {
          user = {
            name: profile.displayName,
            email: profile.emails[0].value,
            role: "user",
            isSocialMedia: true,
          };
          await UsersCollection.create({ ...user });
        }
        const { token } = createJwtToken({ user });
        // this will send "req.user = token" to callbackURL: "http://localhost:5000/auth/google/callback",

        return cb(null, token); // will send req.user to ENTRY 4
        // cb(err, token) => if we connec to database we can forward that mongodb error here cb(err, token)
      } catch (error) {
        console.log(error);
        return cb(error, null);
      }
    }
  )
);

// These serializeUser & deserializeUser will run when user loggin is successful for session based authentication
passport.serializeUser((user, cb) => {
  // user from google
  // store user in your desired format(usually only user_id to takeup less session-storage space, instead of storing bulky user object) in session storage (thus generate cookie as key).
  console.log("serializeUser", user.displayName);
  cb(null, user.displayName); // will be transfered to deserializeUser in userDataFromSessionStorage
});

passport.deserializeUser((userDataFromSessionStorage, cb) => {
  // This callback retrieves user_id from session storage
  // De-Serialize the whole user by retrieving whole user from DB based on the user_id from userDataFromSessionStorage
  // User.findById(userDataFromSessionStorage.user_id, (err, wholeUser) => {
  //   attach user to req.user
  //   cb(null, { wholeUser, localtion: "Hyderabad" });
  // });
  console.log("deserializeUser", userDataFromSessionStorage);
  // send retrieved user to req.user
  cb(null, { userDataFromSessionStorage, localtion: "Hyderabad" });
});
