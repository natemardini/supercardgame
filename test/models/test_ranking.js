require("dotenv").config();

const should = require("chai").should();
const Game = require("../../models/games");
const User = require("../../models/users");
const _ = require("lodash");
const mongoose = require("mongoose");



describe("Model Game's", () => {

    beforeEach((done) => {
        if (mongoose.connection.db) return done();
        mongoose.connect(process.env.MONGODB_URI, {
            useMongoClient: true
        }, done);
    });

    const testGame = new Game({ gameType: 1 });

    it("computeRound() should change active player and advance round", (done) => {
        Game.findById("59f5577e2992696a80ab8f86").populate("players.userId")
            .then((game) => {

                const winner = _.find(game.players, "win") || _.sample(game.players);
                winner.win = true;

                const oldRanks = game.players.map(e => e.userId.ranking);

                game.rankPlayers(() => {
                    const newRanks = game.players.map(e => e.userId.ranking);
                    newRanks.should.not.equal(oldRanks);
                    done();
                });

            });
    });
});

