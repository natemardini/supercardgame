const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");

passport.use({
    usernameField: "handle",
    passwordField: "password"
},  new LocalStrategy(
    function (username, password, done) {
        User.findOne({ handle: username }).then(user => {
            if (!user) {
                return done(null, false, { message: "Incorrect handle." });
            } else if (!user.validPassword(password)) {
                return done(null, false, { message: "Incorrect password." });
            } else {
                return done(null, user);
            }
        }).catch(e => done(e));

        // User.findOne({ username: username }, function (err, user) {
        //     if (err) { return done(err); }
        //     if (!user) {
        //         return done(null, false, { message: "Incorrect username." });
        //     }
        //     if (!user.validPassword(password)) {
        //         return done(null, false, { message: "Incorrect password." });
        //     }
        //     return done(null, user);
        // });
    }
));
