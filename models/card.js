const _ = require("lodash");

class Deck {
    static get suits() {
        return ["diamonds", "spades", "hearts", "clubs"];
    }

    static get values() {
        return ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
    }

    constructor(options = {}) {
        options = {
            cardsPerSuit: Math.min((options.cardsPerSuit || 13), 13),
            suits: options.suits || Deck.suits,
            size: options.size || 52
        };

        this.createDeckID();
        this.cards = [];
        this.discards = [];

        options.suits.forEach(s => {
            const cards = this.addCardsInSuit(s, options.cardsPerSuit);
            this.cards.push(...cards);
        });

        this.cards = _.sampleSize(this.cards, options.size);

        return this;
    }

    addCardsInSuit(suit, max) {
        const result = [];

        for (let i = 0; i < max; i++) {
            result.push(this.newCard(suit, Deck.values[i]));
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

    addJokers(amount) {
        for (let i = 0; i < amount; i++) {
            this.cards.push({
                suit: "Joker",
                value: "Joker",
                deck: this.id
            });
        }
    }

    shuffle() {
        this.cards = _.shuffle(this.cards);
    }

    static returnCard(transfer) {
        if (transfer.card.deck === transfer.to.id) {
            _.pull(transfer.from, transfer.card);
            transfer.to[transfer.pile].push(transfer.card);
            return true;
        } else {
            return false;
        }
    }

    giveHand(cards, suit = "") {
        let _arr = [];

        if (suit) {
            _arr = this.cards.filter(c => c.suit === suit);
        } else {
            _arr = this.cards;
        }

        cards = Math.min(cards, _arr.length);
        const hand = _.sampleSize(_arr, cards);
        _.pullAll(this.cards, hand);

        return hand;
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
