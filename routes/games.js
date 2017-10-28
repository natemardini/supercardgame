"use strict";

const router = require("express").Router();
const Game = require("../models/games");

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
        Game.findById(req.params.id).then(game => {
            res.json(game);
        });
    });

    /**
     * POST /api/games/[id]
     */
    router.post("/:id", (req, res) => {
        const { bidCard, prizeCard } = req.body;
        res.sendStatus(200);
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
