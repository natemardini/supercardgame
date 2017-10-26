const should = require("chai").should();
const { Deck } = require("../../models/card");

describe("Deck Class", () => {

    it("Constructor should return a standard deck", (done) => {
        const newSet = new Deck();
        newSet.cards.length.should.equal(52);
        newSet.cards[0].should.be.an("object");
        done();
    });

    it("Constructor should return a diamond deck of 13 cards", (done) => {
        const newSet = new Deck({ suits: ["diamonds"] });

        newSet.cards.length.should.equal(13);
        newSet.cards[0].should.be.an("object");

        const testRange = ["A", "2", "3", "4", "5", "6",
            "7", "8", "9", "10", "J", "Q", "K"];

        newSet.cards.forEach(c => {
            c.suit.should.equal("diamonds");
            c.value.should.equal(testRange.shift());
        });
        done();
    });
});
