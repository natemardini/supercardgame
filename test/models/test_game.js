
const should = require("chai").should();
const Game = require("../../models/game");

describe("Model Game's", () => {

    const testGame = Game.create(1, {
        player1: [
            1, 5, 7, 52
        ],
        player2: [
            6, 3, 2, 51
        ],
        prize: [
            10, 11, 12, 45
        ]
    });

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
                dbGame.deck.should.be.an("object");
                dbGame.deck.prize.should.be.an("array");
                dbGame.deck.prize[1].should.be.equal(11);
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

    it("destroy() should delete the object", (done) => {
        testGame.destroy().then(result => {
            result.should.equal(1);
            done();
        });
    });

    after((done) => {
        process.exit();
        done();
    });
});

