require("dotenv").config();

const should = require("chai").should();
const Game = require("../../models/games");
const mongoose = require("mongoose");
const { Deck } = require("../../logic/card");



describe("Model Game's", () => {

    beforeEach((done) => {
        if (mongoose.connection.db) return done();
        mongoose.connect(process.env.MONGODB_URI, done);
    });

    const testGame = new Game({ gameType: 1 });

    it("save() should return the object ID", (done) => {
        testGame.save((err, game) => {
            if (err) throw err;
            game._id.should.be.a("object");
            done();
        });
    });

    // it("destroy() should delete the object", (done) => {
    //     testGame.destroy().then(result => {
    //         result.should.equal(1);
    //         done();
    //     });
    // });
});

