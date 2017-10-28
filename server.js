"use strict";

require("dotenv").config();

const PORT       = process.env.PORT || 8080;
const express    = require("express");
const session    = require("express-session");
const passport   = require("./logic/passport");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const app        = express();
const morgan     = require("morgan");
const mongoose   = require("mongoose");

// DATABASE
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });
mongoose.set("debug", true);

// LOGGERS
app.use(morgan("dev"));

// SESSIONS
app.use(session({
    secret: "the sky is falling",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

// MISC
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/styles", sass({
    src: `${__dirname}/styles`,
    dest: `${__dirname}/public/styles`,
    debug: true,
    outputStyle: "expanded"
}));

// Mount all resource routes
app.use("/users", require("./routes/users")(passport));
app.use("/api/games", require("./routes/games")(passport));
app.use("/", require("./routes/home")(passport));

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});

