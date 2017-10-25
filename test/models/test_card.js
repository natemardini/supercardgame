const should = require("chai").should();
const { CardSet, Card } = require("../../models/card");

describe("CardSet Class", () => {

    it("Constructor should return a standard deck", (done) => {
        const newSet = new CardSet();
        newSet.cards.length.should.equal(52);
        newSet.cards[0].should.be.instanceOf(Card);
        done();
    });
});
