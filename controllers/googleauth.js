const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    
    function (request, accessToken, refreshToken, profile, done) {
      const user = new User({
        id: profile.id,
        name: profile.displayName,
        // image: profile.photos[0].value,
        email: profile.emails[0].value,
        source: "google",
      });
      const token = jwt.sign({ userId: user._id, user }, process.env.TOKEN, {
        expiresIn: "1d",
      });
      user.token = token;
      User.findOne({ email: user.email })
        .then((data) => {
          if (data) {
            User.updateOne({}, { token: token, source: "google" }).then(
              (info) => {}
            );
            done(null, data);
          } else {
            data = User.create(user);
            done(null, data);
          }
        })
        .catch((error) => {
          res.status(500).json({ err: error });
        });
    }
  )
);
// passport.serializeUser(function (user, done) {
//   done(null, user.id);
// });

// passport.deserializeUser(function (id, done) {
//   User.findById(id, function (err, user) {
//     done(err, user);
//   });
// });
