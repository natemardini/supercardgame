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
    router.get("/game/:id", passport.restricted, (req, res) => {
        res.render("games/show");
    });

    return router;
};
