"use strict";

const router = require("express").Router();
const User = require("./../models/users");

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
    router.get("/ladder", (req, res) => {
        User.getLadder((err, players) => {
            res.render("users/ladder", { players });
        });
    });

    /**
     * GET /html
     */
    router.get("/game/:id", passport.restricted, (req, res) => {
        res.render("games/show");
    });

    return router;
};
