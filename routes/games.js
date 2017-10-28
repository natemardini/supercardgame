"use strict";

const router = require("express").Router();
const Game = require("../models/games");
const User = require("../models/users");

module.exports = (passport) => {
    /**
     * GET /api/games
     */
    router.get("/",
        (req, res) => {
            Game.findAll({}).then(games => {
                res.json(games);
            });
        }
    );

    /**
    * GET /api/games
    */
    router.get("/pending", passport.restricted, (req, res) => {
        Game.find({ status: 1 }).populate("userID", "handle").then(games => {
            res.json(games);
        }).catch(e => res.json(e));
    });

    /**
     * PUT /api/games
     */
    router.put("/", passport.restricted, (req, res) => {
        const game = new Game();

        User.findById(req.session.passport.user).then(user => {
            game.addPlayer(user, (err, game) => {
                if (err) throw err;
                res.json(game);
            });
        });
    });

    /**
     * GET /api/games/[id]
     */
    router.get("/:id", (req, res) => {
        Game.findById(req.params.id).then(game => {
            res.json(game);
        });
    });

    /**
     * POST /api/games/[id]
     */
    router.post("/:id", (req, res) => {
        const userID = "59f3c6e0ff0285431851b6f5"; // hard coded for testing
        Game.findById(req.params.id).then(game => {
            game.computeRound(userID, req.body);
            res.json(game);
        }).catch(e => res.status(500).json(e));
    });

    /**
     * DELETE /api/games/[id]
     */
    router.delete("/:id",
        passport.authenticate("local"),
        (req, res) => {

        }
    );

    return router;
};
