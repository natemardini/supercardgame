require("dotenv").config();

const should = require("chai").should();
const Game = require("../../models/games");
const User = require("../../models/users");
const mongoose = require("mongoose");
const { Deck } = require("../../logic/card");
const _ = require("lodash");



describe("Model Game's", () => {

    beforeEach((done) => {
        if (mongoose.connection.db) return done();
        mongoose.connect(process.env.MONGODB_URI, {
            useMongoClient: true
        }, done);
    });

    const testGame = new Game({ gameType: 1 });

    it("save() should return the object ID", (done) => {
        testGame.save((err, game) => {
            if (err) throw err;
            game._id.should.be.a("object");
            done();
        });
    });

    it("addPlayer() should return add player to game", (done) => {
        User.findOne({ handle: "Johnny" }).then((user) => {
            testGame.addPlayer(user, () => {
                testGame.addPlayer(user, done);
            });
        });
    });

    it("addPlayer() should return add player to game", (done) => {
        Game.findById(testGame._id).then((game) => {
            game.setup();
            game.save().then((game) => {
                game.deck.should.be.an("object");
                done();
            });
        });
    });

    it("advanceRound() should change active player and advance round", (done) => {
        Game.findById(testGame._id).then((game) => {
            const currentRound = game.round;
            game.advanceRound();
            let nextPlayer = game.players.filter(p => p.active === true)[0];
            nextPlayer.should.be.an("object");
            game.round.should.equal(currentRound + 1);
            game.advanceRound();
            let furtherPlayer = game.players.filter(p => p.active === true)[0];
            furtherPlayer._id.should.not.equal(nextPlayer._id);
            game.round.should.equal(currentRound + 2);
            game.save((err) => {
                if (err) console.log(err);
                done();
            });
        });
    });
});

