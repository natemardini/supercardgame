const Model = require("../db/model");
const Game = require("./game");
const Match = require("./match");
const bcrypt = require("bcryptjs");

class User extends Model {

    static create(handle, email, password) {
        const user    = new User();
        user.handle   = handle;
        user.email    = email;
        user.password = bcrypt.hashSync(password, 10);
        return user;
    }

    validatePassword(password) {
        return bcrypt.compareSync(password, this.password);
    }

    get games() {
        return User.dbConnection("games")
            .join("matches", "matches.game_id", "games.id")
            .where({ "matches.user_id": this.id })
            .select();
    }

    get matches() {
        return User.dbConnection("matches")
            .where({ "matches.user_id": this.id })
            .select();
    }

    createNewGame(gameType) {
        const game = Game.create(gameType);
        const self = this;

        return game.save.then((gameId) => {
            const userMatch = new Match();
            userMatch.user = self.id;
            userMatch.game = gameId;
            return userMatch.save;

        }).then((matchId) => {
            game.addToTurnSequence = matchId;
            return game.save;

        }).catch(e => console.log(e));
    }

    findAllPendingGames(gameType) {
        return Game.findAll({ game_type: gameType, status: 1 });
    }

    joinGame(game) {
        const userMatch = new Match({
            user: this.id,
            game: game
        });

        return userMatch.save.then(() => {
            game.status = 2;
            game.turnSequence = userMatch.id;
            return game.save;
        }).catch(e => console.log(e));
    }
}

module.exports = User;
