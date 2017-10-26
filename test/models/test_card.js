const should = require("chai").should();
const { CardSet, Card } = require("../../models/card");

describe("CardSet Class", () => {

    it("Constructor should return a standard deck", (done) => {
        const newSet = new CardSet();
        newSet.cards.length.should.equal(52);
        newSet.cards[0].should.be.instanceOf(Card);
        done();
    });

    it("Constructor should return a diamond deck of 13 cards", (done) => {
        const newSet = new CardSet({ suits: ["diamond"] });

        newSet.cards.length.should.equal(13);
        newSet.cards[0].should.be.instanceOf(Card);

        const testRange = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"];

        newSet.cards.forEach(c => {
            c.suit.should.equal("diamond");
            c.value.should.equal(testRange.shift());
        });
        done();
    });
});
