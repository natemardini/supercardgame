"use strict";

const router = require("express").Router();

module.exports = (passport) => {
    /**
     * GET /
     */
    router.get("/", (req, res) => {
        if (req.isAuthenticated()) {
            res.redirect("/users/lobby");
        } else {
            res.redirect("/users/login");
        }
    });

    /**
     * GET /html
     */
    router.get("/game/:id", passport.restricted, (req, res) => {
        res.render("games/show");
    });

    return router;
};
