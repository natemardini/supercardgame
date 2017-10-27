const Model = require("../db/model");
const Match = require("./match");
const { Deck } = require("./card");
const _ = require("lodash");

class Game extends Model {

    constructor() {
        super();
    }

    static create(gameType, status = 1) {
        const game = new Game();
        game.gameType = gameType;
        game.status = status;
        game.turn_sequence = {};
        game.setup();
        return game;
    }

    set gameType(value) {
        this.game_type = Number(value);
    }

    get gameType() {
        return this.game_type;
    }

    get currentTurn() {
    }

    nextRound() {
        const currentPlayer = _.findKey(this.turn_sequence, "active");
        _.set(this.turn_sequence, `${currentPlayer}.active`, false);
        let nextPlayer = currentPlayer + 1;

        if (!_.has(this.turn_sequence, nextPlayer)) {
            nextPlayer = 1;
        }

        _.set(this.turn_sequence, `${nextPlayer}.active`, true);
        this.round++;
    }

    get connectedMatches() {
        return _.map(this.turn_sequence, (m) => m.match_id);
    }

    set addToTurnSequence(matchId) {
        const key = Object.keys(this.turn_sequence).length + 1;
        this.turn_sequence[key] = {
            match_id: matchId,
            active: false
        };
    }


    get cards() {
        if (!(this.deck instanceof Deck)) {
            this.deck = Object.assign(new Deck(), this.deck);
        }


        return this.deck;
    }

    start() {
        const startingPlayer = _.random(1, _.size(this.turn_sequence));
        _.set(this.turn_sequence, `${startingPlayer}.active`, true);
    }

    setup() {
        switch (this.gameType) {
        case 1:
            const deck    = Deck.create({
                extraPiles: [ "prize", "phand1", "phand2", "pbid1", "pbid2" ]
            });

            deck.prize    = deck.giveCards(13, "random");
            deck.phand1   = _.orderBy(deck.giveCards(13, "random"), ["suit", "valueN"]);
            deck.phand2   = _.orderBy(deck.giveCards(13, "random"), ["suit", "valueN"]);
            deck.discards = deck.giveCards();
            this.deck     = deck;
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
