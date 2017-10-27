const Model = require("../db/model");
const User = require("./user");
const Game = require("./game");

class Match extends Model {
    set user(user) {

        if (typeof user === "number") {
            this.user_id = user;
        } else if (typeof user === "object") {
            this.user_id = user.id;
        } else {
            throw Error("Invalid user entry");
        }
    }

    get user() {
        return User.findOne(this.user_id);
    }

    set game(game) {

        if (typeof game === "number") {
            this.game_id = game;
        } else if (typeof game === "object") {
            this.game_id = game.id;
        } else {
            throw Error("Invalid game entry");
        }
    }

    get game() {
        return Game.findOne(this.game_id);
    }
}

module.exports = Match;
