const Model = require("../db/model");
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

    set game(game) {
        const match = new Match();
        match.user  = this;
        match.game  = game;
        match.score = 0;

        match.save().then(() => {
            return true;
        }).catch(e => console.log(e));
    }
}

module.exports = User;
