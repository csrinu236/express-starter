var GoogleStrategy = require("passport-google-oauth20").Strategy;

const passport = require("passport");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
      scope: ["profile", "email"],
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, cb) {
      // when user is authenticated, this callback will be called

      console.log({ accessToken, refreshToken, profile });
      //   User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //     return cb(err, user);
      //   });
      return cb(null, profile);
    }
  )
);

// These serializeUser & deserializeUser will run when user loggin is successful
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
