"use strict";

const router = require("express").Router();
const User = require("./../models/users");

module.exports = (passport) => {

    /**
     * GET /
     * If auth'ed, redirect to lobby
     */
    router.get("/", passport.restricted, (req, res) => {
        res.redirect("/users/lobby");
    });

    /**
     * GET /ladder
     * Go to the ladder page
     */
    router.get("/ladder", (req, res) => {
        User.getLadder((err, players) => {
            res.render("users/ladder", { players });
        });
    });

    /**
     * GET /game/[id]
     * Go to the specific page of an active game
     * Note: Game data handled by /api/games router
     */
    router.get("/game/:id", passport.restricted, (req, res) => {
        res.render("games/show");
    });

    return router;
};
