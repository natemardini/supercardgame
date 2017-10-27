const mongoose = require("mongoose");
const Schema   = mongoose.Schema;
const Deck     = require("../logic/card");
const _        = require("lodash");

// SCHEMAS

const gameSchema = new Schema({
    gameType: Number,
    round:    Number,
    status:   Number,
    players:  [ playerSchema ],
    deck:     Schema.Types.Mixed,
    comments: [{ body: String, date:  Date }],
    date:     { type:  Date, default: Date.now }
});

const playerSchema = new Schema({
    userId:   { type: Schema.Types.ObjectId, ref: "User" },
    playerNo: Number,
    active:   Boolean,
    win:      Boolean,
    score:    Number,
    hand:     [ cardSchema ]
});

const cardSchema = new Schema({
    deck:   String,
    value:  String,
    valueN: Number,
    suit:   String
});

// GAME METHODS
gameSchema.pre("save", function (next) {
    if (this.isNew) {
        this.setup();
    }
    next();
});

gameSchema.method.setup = function () {
    switch (this.gameType) {
    case 1:
        const deck = Deck.create();

        this.deck = {};
        this.deck.prize = deck.giveCards(13, "random");

        this.players.forEach((player, index) => {
            player.hand     = _.orderBy(deck.giveCards(13, "random"),
                ["suit", "valueN"]);
            player.score    = 0;
            player.win      = false;
            player.playerNo = index + 1;
            player.bid      = [];
        });
        this.deck.discards = deck.giveCards();
        break;
    default:
        break;
    }
};


module.exports = mongoose.model("Game", gameSchema);
