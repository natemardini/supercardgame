const should = require("chai").should();
const Logic = require("../../logic/goofspiel");

describe("Test Game Logic ", () => {

    it("should know a game is already finished", function() {
        const input =
            {
                round:      13,
                user1score: 42,
                user2score: 4,
                user1win:   1,
                user2win:   0,
                prize:      12,
                user1card:  10,
                user2card:   8
            };

        const testLogic = Logic.startGame(input);

        testLogic.should.equal(0);
    });

    it("should be able to update the score", function() {
        const input =
            {
                round:      5,
                user1score: 5,
                user2score: 4,
                user1win:   0,
                user2win:   0,
                prize:      12,
                user1card:  10,
                user2card:  8
            };

        const testLogic = Logic.startGame(input);

        testLogic["user1score"].should.equal(17);
    });

    it("should be able to find the winner", function() {
        const input =
            {
                round:      2,
                user1score: 4,
                user2score: 43,
                user1win:   0,
                user2win:   0,
                prize:      12,
                user1card:  10,
                user2card:  13
            };

        const testLogic = Logic.startGame(input);

        testLogic["user2win"].should.equal(1);
    });
});
