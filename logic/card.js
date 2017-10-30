const _ = require("lodash");

class Deck {
    static get suits() {
        return ["diamonds", "spades", "hearts", "clubs"];
    }

    static get values() {
        return ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
    }

    static score(value) {
        if (!isNaN(Number(value))) {
            return Number(value);
        } else {
            switch (value) {
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

    /**
     * Creates a deck of cards based on the opts provided. If no opts defined,
     * generates a standard deck of 52 cards including all 4 suits.
     *
     * @static
     * @param {any} [opts={suits, size, cardsPerSuit, decks, extraPiles}]
     * @returns {Deck}
     * @memberof Deck
     */
    static create(opts = {}) {
        const _deck = new Deck();

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

    /**
     * Adds a full standard deck of 52 cards to Deck.cards
     *
     * @param {number} [amountDecks=1]
     * @param {number} [maxSuitSize=13]
     * @param {any} [suits=Deck.suits]
     * @memberof Deck
     */
    _addFullDecks(amountDecks = 1, maxSuitSize = 13, suits = Deck.suits) {
        for (let i = 0; i < amountDecks; i++) {
            suits.forEach(suit => {
                const series = this._addCardsInSuitSeries(suit, maxSuitSize);
                this.cards.push(...series);
            });
        }
    }

    /**
     * Returns new cards of a specific suit
     *
     * @param {any} suit
     * @param {any} max
     * @returns {array} Card objects
     * @memberof Deck
     */
    _addCardsInSuitSeries(suit, max) {
        const result = [];

        for (let i = 0; i < max; i++) {
            result.push(this.newCard(suit, Deck.values[i]));
        }

        return result;
    }

    /**
     * Add additional cards as needed to Deck.cards
     *
     * @param {any} amount
     * @param {any} suits
     * @memberof Deck
     */
    addExtraCards(amount, suits) {
        for (let i = 0; i < amount; i++) {
            this.cards.push(this.newCard(_.sample(suits)));
        }
    }

    /**
     * Creates a new card of a particular suit and value, otherwise
     * randomly generates both
     *
     * @param {any} suit
     * @param {any} value
     * @returns {object} Card
     * @memberof Deck
     */
    newCard(suit, value) {
        suit = suit || _.sample(Deck.suits);
        value = value || _.sample(Deck.values);

        [suit, value] = Deck._validate(suit, value);

        return {
            suit,
            value,
            valueN: Deck.score(value)
        };
    }

    /**
     * Adds Joker cards to Deck.cards as needed
     *
     * @param {any} amount
     * @memberof Deck
     */
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

    /**
     * Returns specific cards and removes them from the deck (i.e. to hand to
     * a player)
     *
     * @param {any} [amount=this.cards.length]
     * @param {string} [suit=""]
     * @returns {array} Cards
     * @memberof Deck
     */
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

    /**
     * Returns a card back to the deck or a particular pile
     * FIXME: Not compatible with MongoDB
     *
     * @static
     * @param {any} transfer
     * @returns {boolean}
     * @memberof Deck
     */
    static returnCard(transfer) {
        _.pull(transfer.from, transfer.card);
        transfer.to[transfer.pile].push(transfer.card);
        return true;
    }

    /**
     * Validates that a card suit/value is allowed
     *
     * @static
     * @param {any} suit
     * @param {any} value
     * @returns {array} Suit/Value
     * @memberof Deck
     */
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
}

module.exports = {
    Deck
};
