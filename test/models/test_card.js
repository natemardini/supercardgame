const should = require("chai").should();
const { Deck } = require("../../models/card");
const _ = require("lodash");

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
            "7", "8", "9", "10", "J", "Q", "K"]

        newSet.cards.forEach(c => {
            c.suit.should.equal("diamonds");
            testRange.should.include(c.value);
        });
        done();
    });

    it("Can give out a valid hand with giveHand()", (done) => {
        const testDeck = new Deck();

        const hand = testDeck.giveCards(12);

        hand.length.should.equal(12);
        hand[4].should.be.an("object");
        hand[6].suit.should.be.a("string");
        hand[8].value.should.be.a("string");
        hand[3].deck.should.be.a("string");
        done();
    });

    it("Can give out a valid one-suit hand with giveHand()", (done) => {
        const testDeck = new Deck();

        const hand = testDeck.giveCards(19, "hearts");
        hand.length.should.equal(13);
        hand[4].should.be.an("object");
        hand[6].suit.should.equal("hearts");
        hand[8].value.should.be.a("string");
        hand[3].deck.should.be.a("string");
        done();
    });

    it("Reduces its deck-size when handing out cards", (done) => {
        const testDeck = new Deck();

        const hand = testDeck.giveCards(10);
        const join = _.intersection(hand, testDeck.cards);

        testDeck.cards.length.should.equal(42);
        join.should.be.an("array").that.is.empty;
        done();
    });

    it("Putting card back in Deck works", (done) => {
        let testDeck = new Deck();
        let hand = testDeck.giveCards(7);
        let card = hand[3];

        const statusCode = Deck.returnCard({
            from: hand,
            to: testDeck,
            pile: "cards",
            card: card
        });

        statusCode.should.be.true;
        hand.should.not.include(card);
        testDeck.cards.should.include(card);
        done();
    });

    it("Putting card back in Deck discards works", (done) => {
        let testDeck = new Deck();
        let hand = testDeck.giveCards(7);
        let card = hand[3];

        const statusCode = Deck.returnCard({
            from: hand,
            to: testDeck,
            pile: "discards",
            card: card
        });

        statusCode.should.be.true;
        hand.should.not.include(card);
        testDeck.discards.should.include(card);
        done();
    });
});
