const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");

passport.use(new LocalStrategy({ usernameField: "handle" },
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
    }
));

passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
    User.findOne(id)
        .then(user => cb(null, user))
        .catch(err => cb(err));
});

module.exports = passport;
