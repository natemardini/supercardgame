const Model = require("../db/model");
const Match = require("./match");

class Game extends Model {
    static create(gameType, deck) {
        const game = new Game();
        game.gameType = gameType;
        game.deck = deck;
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
}

module.exports = Game;
