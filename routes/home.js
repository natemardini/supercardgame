"use strict";

const router = require("express").Router();

module.exports = (passport) => {
    /**
     * GET /
     */
    router.get("/", (req, res) => {
        res.render("index");
    });

    /**
     * GET /html
     */
    router.get("/html", (req, res) => {
        res.redirect("/html/game.html");
    });

    return router;
};
