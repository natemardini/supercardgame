"use strict";

require("dotenv").config();

module.exports = {

};

const PORT       = process.env.PORT || 8080;
const express    = require("express");
const session    = require("express-session");
const passport   = require("./logic/passport");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const app        = express();
const morgan     = require("morgan");
const DBConn     = require("./db/model").dbConnection;
const knexLogger = require("knex-logger");

// LOGGERS
app.use(morgan("dev"));
app.use(knexLogger(DBConn));

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
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
    src: `${__dirname  }/styles`,
    dest: `${__dirname  }/public/styles`,
    debug: true,
    outputStyle: "expanded"
}));
app.use(express.static("public"));

// Mount all resource routes
app.use("/api/users", require("./routes/users")(passport));
app.use("/api/games", require("./routes/games")(passport));

// Home page
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/html", (req, res) => {
    res.redirect("/html/game.html");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${  PORT}`);
});

