const _ = require("lodash");
const suits = ["diamond", "spade", "heart", "clubs"];

class CardSet {
    constructor(options = {}) {
        options = {
            cardsPerSuit: options.cardsPerSuit || 13,
            suits: options.suits || suits
        };

        this.cards = [];

        options.cardsPerSuit > 13 ? options.cardsPerSuit = 13 : options.cardsPerSuit;

        options.suits.forEach(s => {
            const cards = this.addCardsInSuit(s, options.cardsPerSuit);
            this.cards.push(...cards);
        });

        return this;
    }

    addCardsInSuit(suit, max, options = {}) {
        const result = [];

        if (!options.random) {
            for (let i = 1; i <= max; i++) {
                result.push(new Card(suit, i));
            }
        }

        return result;
    }
}

class Card {
    constructor(suit, value) {
        [this.suit, this.value] = Card._validate(suit, value);
        return this;
    }

    static _validate(suit, value) {
        if (!suits.includes(suit)) {
            suit = null;
        }

        const cardValues = _.range(1, 14).concat(["A", "Q", "J", "K", "Joker"]);
        if (!cardValues.includes(value)) {
            value = null;
        } else if ([0, 11, 12, 13].includes(value)) {
            switch (value) {
            case 0:
                value = "Joker";
                break;
            case 11:
                value = "J";
                break;
            case 12:
                value = "Q";
                break;
            case 13:
                value = "K";
                break;
            default:
                break;
            }
        }

        if (!suit && !value) {
            throw Error("Not a proper card object");
        } else {
            return [suit, value];
        }
    }
}

module.exports = {
    CardSet,
    Card
};
