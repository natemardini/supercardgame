const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { Deck } = require("../logic/card");
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
        this.status = Number(this.status);
        this.round = 1;
        this.status = 1;
    }
    this.status === 1 && this.checkStartRequirements() && this.setup();
    next();
});

gameSchema.methods.addPlayer = function (player, cb) {
    const that = this;

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
    this.find({ status: 1, gameType }).then(games => {
        // TODO: Add functionality when no games found
        const game = _.sample(games);
        game.addPlayer(user, cb);
    }).catch(e => cb(e));
};

gameSchema.methods.checkStartRequirements = function () {
    switch (this.gameType) {
    case 1:
        return this.players.length === 2;
    default:
        return false;
    }
};

const Player = mongoose.model("Player", playerSchema);
module.exports = mongoose.model("Game", gameSchema);
