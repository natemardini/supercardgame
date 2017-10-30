"use strict";

const router = require("express").Router();
const Game = require("../models/games");

module.exports = (passport) => {

    /**
     * GET /api/games
     * @return {json} current player and active games list
     */
    router.get("/", passport.restricted, (req, res) => {
        req.user.populate({
            path: "activeGames",
            select: "-deck",
            populate: {
                path: "players.userId",
                select: "handle"
            }
        }, (err, user) => {
            const data = {
                currentPlayer: req.user.id,
                activeGames: user.activeGames
            };
            res.json(data);
        });
    });

    /**
     * GET /api/games/pending
     * @return {json} current player and pending games list
     */
    router.get("/pending", passport.restricted, (req, res) => {
        Game.find({ status: 1 }).populate({ path: "players.userId", select: "handle" }).then(games => {
            res.json({games, user: req.user.id });
        }).catch(e => res.json(e));
    });

    /**
     * PUT /api/games
     * Add player to pending game and
     * @return {json} new games list
     */
    router.put("/", passport.restricted, (req, res) => {
        const game = new Game({ gameType: req.body.type });

        game.addPlayer(req.user, (err, game) => {
            game.populate({ path: "players.userId", select: "handle" },
                (err, game) => {
                    if (err) throw err;
                    res.json({ games: game, user: req.user.id });
                }
            );
        });
    });

    /**
     * PUT /api/games/match
     * Use the Game#findmatch method to attempt and match
     * the user to existing match
     * @return {json} matched game
     */
    router.put("/match", passport.restricted, (req, res) => {
        Game.findMatch(req.user, req.body.type, (err, game) => {
            if (err) throw err;
            res.json(game);
        });
    });

    /**
    *  PUT /api/games/join
    *  Join a specific pending game
    *  Sends a 200 OK response if successful
    */
    router.put("/join", passport.restricted, (req, res) => {
        Game.findById(req.body.id).then(game => {
            game.addPlayer(req.user, (err, game) => {
                if (err) {
                    res.status(403).send(err.message);
                } else {
                    res.sendStatus(200);
                }
            });
        });
    });

    /**
     * POST /api/games/[id]
     * Receive player's game input, and send to Game model for computation
     * @return {json} [game] new game state
     */
    router.post("/:id", passport.restricted, (req, res) => {
        Game.findById(req.params.id).then(game => {
            game.computeRound(req.user, req.body, (err, uGame) => {
                if (err) throw err;
                res.json(uGame);
            });
        }).catch(e => res.status(500).json(e));
    });


    /**
    * GET /api/games/[id]
    * Get game state for initial board set-up
    * @return {json} {game, current player}
    */
    router.get("/:id", passport.restricted, (req, res) => {
        Game.findById(req.params.id).then(game => {
            const data = {
                player: req.user.id,
                game
            };
            res.json(data);
        }).catch(e => res.status(500).json(e));
    });

    return router;
};
