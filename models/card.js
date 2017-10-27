const _ = require("lodash");

class Deck {
    static get suits() {
        return ["diamonds", "spades", "hearts", "clubs"];
    }

    static get values() {
        return ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
    }

    static score(card) {
        if (!isNaN(Number(card.value))) {
            return Number(card.value);
        } else {
            switch (card.value) {
            case "A":
                return 1;
            case "J":
                return 11;
            case "Q":
                return 12;
            case "K":
                return 13;
            default:
                return 0;
            }
        }
    }

    static create(opts = {}) {
        const _deck = new Deck();
        _deck._createDeckID();

        opts.suits = opts.suits || Deck.suits;
        opts.cardsPerSuit = Math.min((opts.cardsPerSuit || 13), 13);
        opts.size = opts.size || opts.suits.length * opts.cardsPerSuit;
        opts.decks = opts.decks || 1;
        opts.extraPiles = opts.extraPiles || [];

        _deck.cards = [];
        _deck.discards = [];
        opts.extraPiles.forEach(pile => _deck[pile] = []);

        _deck._addFullDecks(opts.decks, opts.maxSuitSize, opts.suits);

        if (_deck.cards.length < opts.size) {
            _deck.addExtraCards(opts.size - _deck.cards.length, opts.suits);
        }

        _deck.cards = _.sampleSize(_deck.cards, opts.size);

        return _deck;
    }

    _addFullDecks(amountDecks = 1, maxSuitSize = 13, suits = Deck.suits) {
        for (let i = 0; i < amountDecks; i++) {
            suits.forEach(suit => {
                const series = this._addCardsInSuitSeries(suit, maxSuitSize);
                this.cards.push(...series);
            });
        }
    }

    _addCardsInSuitSeries(suit, max) {
        const result = [];

        for (let i = 0; i < max; i++) {
            result.push(this.newCard(suit, Deck.values[i]));
        }

        return result;
    }

    addExtraCards(amount, suits) {
        for (let i = 0; i < amount; i++) {
            this.cards.push(this.newCard(_.sample(suits)));
        }
    }

    newCard(suit, value) {
        suit = suit || _.sample(Deck.suits);
        value = value || _.sample(Deck.values);

        [suit, value] = Deck._validate(suit, value);

        return {
            suit,
            value,
            deck: this.id
        };
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

    static shuffle(cards) {
        return _.shuffle(cards);
    }

    giveCards(amount = this.cards.length, suit = "") {
        let _arr = [];

        if (suit === "random") {
            suit = _.sample(_.uniq(this.cards.map(c => c.suit)));
            _arr = this.cards.filter(c => c.suit === suit);
        } else if (suit) {
            _arr = this.cards.filter(c => c.suit === suit);
        } else {
            _arr = this.cards;
        }

        amount = Math.min(amount, _arr.length);
        const hand = _.sampleSize(_arr, amount);
        _.pullAll(this.cards, hand);

        return hand;
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

    static _validate(suit, value) {
        if (!this.suits.includes(suit)) {
            suit = null;
        }

        value = value.toString();

        if (!this.values.concat(["0", "11", "12", "13"]).includes(value)) {
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

    _createDeckID(a, b) {
        for (b = a = ""; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : "-");
        this.id = b;
    }
}

module.exports = {
    Deck
};
