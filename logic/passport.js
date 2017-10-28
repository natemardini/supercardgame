const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/users");

passport.use(new LocalStrategy({ usernameField: "handle" },
    (username, password, done) => {
        User.findOne({ handle: username }).then(user => {
            if (!user) {
                return done(null, false, { message: "Incorrect handle." });
            } else if (!user.validatePassword(password)) {
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
    User.findById(id, (err, user) => {
        if (err) cb(err);
        cb(null, user);
    });
});

passport.restricted = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect(303, "/");
    }
};

module.exports = passport;
