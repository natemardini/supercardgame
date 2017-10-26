const _ = require("lodash");

class Deck {
    static get suits() {
        return ["diamonds", "spades", "hearts", "clubs"];
    }

    static get values() {
        return [
            "A",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "J",
            "Q",
            "K"
        ];
    }

    constructor(options = {}) {
        options = {
            cardsPerSuit: options.cardsPerSuit || 13,
            suits: options.suits || Deck.suits
        };

        this.createDeckID();
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
            for (let i = 0; i < max; i++) {
                result.push(this.newCard(suit, Deck.values[i]));
            }
        }

        return result;
    }

    newCard(suit, value) {
        if (suit || value) {
            [suit, value] = this.constructor._validate(suit, value);
            return {
                suit,
                value,
                deck: this.id
            };
        }
    }

    static _validate(suit, value) {
        if (!this.suits.includes(suit)) {
            suit = null;
        }

        value = value.toString();

        if (!this.values.includes(value)) {
            value = null;
        } else if (["0", "11", "12", "13"].includes(value)) {
            switch (value) {
            case "0":
                value = "Joker";
                break;
            case "11":
                value = "J";
                break;
            case "12":
                value = "Q";
                break;
            case "13":
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

    createDeckID(a, b) {
        for (b = a = ""; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : "-");
        this.id = b;
    }
}

module.exports = {
    Deck
};
