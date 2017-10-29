const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { Deck } = require("../logic/card");
const EloRank = require("elo-rank");
const _ = require("lodash");

// SCHEMAS
const cardSchema = new Schema({
    deck: String,
    value: String,
    valueN: Number,
    suit: String
});

const playerSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    playerNo: Number,
    active: Boolean,
    win: Boolean,
    bid: [cardSchema],
    score: Number,
    hand: [cardSchema]
});

const gameSchema = new Schema({
    gameType: Number,
    round: Number,
    status: Number,
    players: [playerSchema],
    deck: Schema.Types.Mixed,
    date: {
        type: Date,
        default: Date.now
    }
});


// GAME METHODS
gameSchema.pre("save", function (next) {
    if (this.isNew) {
        this.round = 1;
        this.status = 1;
        this.gameType = Number(this.gameType);
    }
    this.status === 1 && this.checkStartRequirements() && this.setup();
    next();
});

gameSchema.methods.addPlayer = function (player, cb) {
    const that = this;

    const exist = _.find(that.players, { userId: player._id });
    if (exist) {
        return cb(new Error("Already in this game"));
    }

    const _player = new Player({
        userId: player._id,
        playerNo: this.players.length + 1,
        active: false,
        win: false,
        score: 0,
        hand: []
    });

    this.players.push(_player);

    this.save((err) => {
        if (err) throw err;
        player.activeGames.push(that._id);
        player.save((err) => {
            if (err) {
                cb(err);
            } else {
                cb(null, that);
            }
        });
    });
};

gameSchema.methods.advanceRound = function () {
    let index = _.findIndex(this.players, "active");
    index === -1 ? index = _.random(0, this.players.length - 1) : index;
    this.players[index]["active"] = false;

    let nextPlayer;
    if (index + 1 <= this.players.length - 1) {
        nextPlayer = index + 1;
    } else {
        nextPlayer = 0;
    }

    this.players[nextPlayer].active = true;
    this.round++;
};

gameSchema.methods.setup = function () {
    switch (this.gameType) {
    case 1:
    {
        const deck = Deck.create();

        this.deck = {};
        this.deck.prize = deck.giveCards(13, "random");

        this.players.forEach((player, index) => {
            player.hand = _.orderBy(deck.giveCards(13, "random"), ["suit", "valueN"]);
            player.score = 0;
            player.win = false;
            player.playerNo = index + 1;
            player.bid = [];
        });
        this.deck.discards = deck.giveCards();
        break;
    }
    default:
        break;
    }

    //TODO: Add email to users notifying them of new game.
    this.status = 2;
};

gameSchema.methods.computeRound = function (user, input) {
    switch (this.gameType) {
    case 1:
        require("./../logic/goofspiel")(this, user, input);
        return;

    default:
        return;
    }
};

gameSchema.statics.findMatch = function (user, gameType, cb) {
    let game = null;

    this.find({ status: 1, gameType }).populate("players.userId" , "ranking").then(games => {
        findBestRankingGame(user, games);
        if (game) {
            game.addPlayer(user, cb);
        } else {
            cb(new Error("No games available"));
        }
    }).catch(e => cb(e));

    function findBestRankingGame(user, games, delta = 50, i = 0) {
        if (games.length === 0 || i === 10) return;

        const minLimit = user.ranking - delta;
        const maxLimit = user.ranking + delta;

        const eligibleGames = _.filter(games, g => {
            const ownGame = _.find(g.players, ["userId._id", user._id]);
            const creatorRank = g.players[0].ranking || 1000;

            return !ownGame && (creatorRank >= minLimit && creatorRank <= maxLimit);
        });

        if (eligibleGames.length > 0) {
            game = _.sample(eligibleGames);
            return;
        } else {
            findBestRankingGame(user, games, delta + 50, i + 1);
        }
    }
};

gameSchema.methods.checkStartRequirements = function () {
    switch (this.gameType) {
    case 1:
        return this.players.length === 2;
    default:
        return false;
    }
};

gameSchema.methods.rankPlayers = function (cb) {
    const elo = new EloRank();

    this.populate("players.userId", (err) => {
        if (err) throw err;

        const winner = _.find(this.players, "win");
        const loser = _.find(this.players, { win: false });

        const expectedScoreW = elo.getExpected(winner.userId.ranking, loser.userId.ranking);
        const expectedScoreL = elo.getExpected(loser.userId.ranking, winner.userId.ranking);

        winner.userId.ranking = elo.updateRating(expectedScoreW, 1, winner.userId.ranking);
        loser.userId.ranking = elo.updateRating(expectedScoreL, 0, loser.userId.ranking);

        Promise.all([
            winner.userId.save(),
            loser.userId.save()
        ]).then(cb)
        .catch(e => console.log(e));
    });
};


const Player = mongoose.model("Player", playerSchema);
module.exports = mongoose.model("Game", gameSchema);
