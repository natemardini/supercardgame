const Model = require("../db/model");
const Match = require("./match");

class Game extends Model {
    constructor(gameType, deck) {
        super();
        this.gameType = gameType;
        this.deck = deck;
        return this;
    }

    get currentTurn() {
        return this.fetchDbRow()
            .then(r => {
                Match.findOne(r.current_turn);
            });
    }
}

module.exports = Game;
