const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { Deck } = require("../logic/card");
const EloRank = require("elo-rank");
const _ = require("lodash");

// SCHEMAS
const cardSchema = new Schema({
    value: String,
    valueN: Number,
    suit: String
});

const deckSchema = new Schema({
    discards: [cardSchema],
    prize: [cardSchema]
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
    atRound: Number,
    hand: [cardSchema]
});

const gameSchema = new Schema({
    gameType: Number,
    round: Number,
    status: Number,
    players: [playerSchema],
    deck: deckSchema,
    date: {
        type: Date,
        default: Date.now
    }
});


/**
 * Set basic game data before save. If pending game (status 1), then check
 * if its start requirements have been met, if so, call setup() method.
 */
gameSchema.pre("save", function (next) {
    if (this.isNew) {
        this.round = 1;
        this.status = 1;
        this.gameType = Number(this.gameType);
    }
    this.status === 1 && this.checkStartRequirements() && this.setup();
    next();
});

/**
 * Method to add a player to a game, and making a ref of that game in player's
 * activeGames property
 */
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

/**
 * When done computing round, advance the round by 1, and change
 * active players (for games that keep track of active players)
 */
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

/**
 * Setup and distribute cards (see Card class for further detail)
 * and change game from status 1 to 2 (active)
 */
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
            player.atRound = 1;
        });
        this.deck.discards = deck.giveCards();
        break;
    }
    default:
        break;
    }

    this.status = 2;
};

/**
 * Depending on game (i.e., 1 = Goofspiel), calls that gametype's logic
 * to mutate the game data, then saves to db.
 * If game is over and there is a winner, calls endGame() first
 */
gameSchema.methods.computeRound = function (user, input, cb) {
    let game, winner;

    switch (this.gameType) {
    case 1:
        [game, winner] = require("./../logic/goofspiel")(this, user, input);
        break;

    default:
        break;
    }

    if (winner) {
        game.endGame().then(() => {
            cb(null, game);
        });
    } else {
        game.save().then((game) => {
            cb(null, game);
        });
    }
};

/**
 * Change game to status 3 (over), and move it from each player's activeGames
 * to pastGames property in db
 */
gameSchema.methods.endGame = function () {
    this.populate({ path: "players.userId", populate: ["activeGames", "pastGames"] }, (err, game) => {
        //const players = [];

        game.players.forEach(p => {
            const gm = p.userId.activeGames.filter(g => {
                return g.id === game.id;
            })[0];
            p.userId.activeGames.pull(gm);
            p.userId.pastGames.push(gm);
        });

        game.status = 3;

        return this.rankPlayers().then(() => {
            game.save();
        });
    });
};

/**
 * Attempt to match a player based on their ELO ranking using a recursive
 * function that looks for games hosted by players within 50 rank points from
 * player, then expands that by 50 for each recursion until a game is found.
 *
 * @param {User} user
 * @param {number} gameType
 * @param cb
 * @return {Game}
 */
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

/**
 * For each game type, see if start requirements have been met (i.e. for
 * Goofspiel, that there are 2 players)
 */
gameSchema.methods.checkStartRequirements = function () {
    switch (this.gameType) {
    case 1:
        return this.players.length === 2;
    default:
        return false;
    }
};

/**
 * After a game is over, rank the players using ELO ranking package,
 * @return {Promise} users save
 */
gameSchema.methods.rankPlayers = function () {
    const elo = new EloRank();

    this.populate("players.userId", (err) => {
        if (err) throw err;

        const winner = _.find(this.players, "win");
        const loser = _.find(this.players, { win: false });

        const expectedScoreW = elo.getExpected(winner.userId.ranking, loser.userId.ranking);
        const expectedScoreL = elo.getExpected(loser.userId.ranking, winner.userId.ranking);

        winner.userId.ranking = elo.updateRating(expectedScoreW, 1, winner.userId.ranking);
        loser.userId.ranking = elo.updateRating(expectedScoreL, 0, loser.userId.ranking);

        return Promise.all([
            winner.userId.save(),
            loser.userId.save()
        ]).catch(e => console.log(e));
    });
};


const Player = mongoose.model("Player", playerSchema);
module.exports = mongoose.model("Game", gameSchema);
