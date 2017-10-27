"use strict";

const router = require("express").Router();
const Game = require("../models/game");

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
     * PUT /api/games
     */
    router.put("/", (req, res) => {
        const game = Game.create(req.body.type);

        game.save.then(() => {
            res.json(game);
        });
    });

    /**
     * GET /api/games/[id]
     */
    router.get("/:id", (req, res) => {
        Game.findOne(req.params.id).then(game => {
            res.json(game);
        });
    });

    /**
     * PATCH /api/games/[id]
     */
    router.patch("/:id",
        passport.authenticate("local"),
        (req, res) => {

        }
    );

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
