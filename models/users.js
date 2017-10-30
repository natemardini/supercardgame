const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
const _ = require("lodash");

const userSchema = new Schema({
    handle:      String,
    email:       String,
    ranking:     { type: Number, default: 1000 },
    password:    String,
    activeGames: [{ type: Schema.Types.ObjectId, ref: "Game" }],
    pastGames:   [{ type: Schema.Types.ObjectId, ref: "Game" }]
});

userSchema.pre("save", function (next) {
    if (this.isNew) {
        bcrypt.hash(this.password, 10).then((digest) => {
            this.password = digest;
            next();
        });
    } else {
        next();
    }
});

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.getRanking = function (cb) {
    const ratings = {
        wins: 0,
        losses: 0,
        ranking: this.ranking
    };

    this.populate("pastGames", (err, user) => {
        if (err) cb(err);

        user.pastGames.forEach(function (game) {
            const player = _.find(game.players, { userId: user._id });
            player.win ? ratings.wins++ : ratings.losses++;
        });

        cb(null, ratings);
    });
};

userSchema.methods.getHistory = function (cb) {
    const ranking = [];

    this.populate({ path: "pastGames", populate: "players.userId" }, (err, user) => {
        if (err) cb(err);

        user.pastGames.forEach(function (game) {
            const player = _.find(game.players, ["userId._id", user._id]);

            ranking.push({
                gameId: game.id,
                win: player.win,
                opp: game.players.filter(e => {
                    e.userId._id !== user._id;
                })[0].handle
            });
        });

        cb(null, ranking);
    });
};

userSchema.statics.getLadder = function (cb) {

    this.find().then((users) => {
        const players = [];

        users.forEach(p => {
            players.push({
                handle: p.handle,
                ranking: p.ranking
            });
        });

        cb(null, players);
    });

};

module.exports = mongoose.model("User", userSchema);


