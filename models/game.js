const Model = require("../db/model");
const Match = require("./match");
const { Deck } = require("./card");

class Game extends Model {

    constructor() {
        super();
    }

    static create(gameType) {
        const game = new Game();
        game.gameType = gameType;
        game.setup();
        return game;
    }

    set gameType(value) {
        this.game_type = value;
    }

    get gameType() {
        return this.game_type;
    }

    get currentTurn() {
        return this.fetchDbRow()
            .then(r => {
                Match.findOne(r.current_turn);
            });
    }

    get cards() {
        if (!(this.deck instanceof Deck)) {
            this.deck = Object.assign(new Deck(), this.deck);
        }

        return this.deck;
    }

    setup() {
        switch (this.game_type) {
        case 1:
            const deck = Deck.create({
                extraPiles: [ "prize", "phand1", "phand2", "pbid1", "pbid2" ]
            });

            deck.prize = deck.giveCards(13, "random");
            deck.phand1 = deck.giveCards(13, "random");
            deck.phand2 = deck.giveCards(13, "random");
            deck.discards = deck.giveCards();

            this.deck = deck;
            break;

        default:
            break;
        }
    }
}

// const deckTemplate = {
//     round: 13,      // Game Direct
//     user1score: 42, // Match
//     user2score: 4,  // Match
//     user1win:   1,  // Match
//     user2win:   0,  // Match
//     prize:      12,
//     user1card:  10,
//     user2card:   8
// };




module.exports = Game;
