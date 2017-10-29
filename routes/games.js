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
        Game.find({ status: 1 }).populate("players.userId", "handle").then(games => {
            res.json(games);
        }).catch(e => res.json(e));
    });

    /**
     * PUT /api/games
     */
    router.put("/", passport.restricted, (req, res) => {
        const game = new Game({ gameType: req.body.type });

        game.addPlayer(req.user, (err, game) => {
            game.populate({ path: "players.userId", select: "handle" },
                (err, game) => {
                    if (err) throw err;
                    res.json(game);
                }
            );
        });
    });

    /**
     * PUT /api/games/match
     */
    router.put("/match", passport.restricted, (req, res) => {
        Game.findMatch(req.user, req.body.type, (err, game) => {
            if (err) throw err;
            res.json(game);
        });
    });

    /**
    *  POST /api/games/[id]
    */
    router.put("/join", passport.restricted, (req, res) => {
        Game.findById(req.body.id).then(game => {
            game.addPlayer(req.user, (err, game) => {
                if (err) throw err;
                res.sendStatus(200);
            });
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
