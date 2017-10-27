
const should = require("chai").should();
const Game = require("../../models/game");
const { Deck } = require("../../models/card");

describe("Model Game's", () => {

    const testGame = Game.create(1);

    it("save() should return the object ID", (done) => {
        testGame.save().then(() => {
            testGame.id.should.be.a("number");
            done();
        });
    });

    it("findOne() should return a valid object", (done) => {
        Game.findOne(testGame.id).then(game => {
            game.should.be.an.instanceOf(Game);
            game.game_type.should.be.a("number");
            done();
        });
    });

    it("save() on same Game should return the same object ID", (done) => {
        testGame.gameType = 2;
        const currentId = testGame.id;
        testGame.save()
            .then(() => Game.findOne(currentId))
            .then(dbGame => {
                dbGame.id.should.equal(currentId);
                dbGame.should.be.an.instanceOf(Game);
                dbGame.gameType.should.equal(2);
                dbGame.cards.should.be.an.instanceOf(Deck);
                dbGame.cards.prize.should.be.an("array");
                dbGame.cards.prize[1].should.be.an("object");
                done();
            });
    });

    it("findAll() should return a result object", (done) => {
        Game.findAll({}).then(result => {
            result.should.be.an("array");
            result[0].should.be.an.instanceOf(Game);
            done();
        });
    });

    it("total of all cards in standard deck should be 52", (done) => {
        Game.findOne(testGame.id).then(game => {
            const totalCards = game.cards.cards.length +
                game.cards.prize.length +
                game.cards.phand1.length +
                game.cards.phand2.length +
                game.cards.discards.length;

            totalCards.should.equal(52);
            done();
        });
    });

    it("destroy() should delete the object", (done) => {
        testGame.destroy().then(result => {
            result.should.equal(1);
            done();
        });
    });
});

