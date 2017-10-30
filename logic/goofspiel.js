const _ = require("lodash");

/**
 * Main entry point for this game's logic. Locates cards from input
 * then passes them on to other functions for specific calculation.
 *
 * @param {Game} game
 * @param {User} user
 * @param {object} input
 * @returns {array} mutated Game and Winner (user or null)
 */
function calculate(game, user, input) {

    if (game.status === 3) {
        return game;
    }

    const { bidCard, prizeCard } = input;

    const currentPlayer = _.find(game.players, { "userId": user._id });
    let bid = _.find(currentPlayer.hand, { valueN: bidCard.value, suit: bidCard.suit });
    let prize = _.find(game.deck.prize, { valueN: prizeCard.value, suit: prizeCard.suit });

    placeBid(currentPlayer, game, bid);
    checkBids(game, prize);

    let winner = null;

    if (game.round === 13) {
        winner = checkScores(game, true);
    } else {
        winner = checkScores(game);
    }

    return [game, winner];
}

/**
 * Tallies each player's bid, gives score points to the round's winner, and
 * calls cleanUp() and advanceRound()
 *
 * @param {any} game
 * @param {any} prize
 */
function checkBids(game, prize) {

    const currentBids = game.players.reduce((a, p) => a += p.bid.length, 0);

    /**
     *  First see if all players have bid this round
     */
    if (currentBids % game.players.length === 0) {

        const tally = new Map();

        /**
         * Sum up each player's bid values
         */
        game.players.forEach((p, i) => {
            const points = p.bid.reduce((acc, bid) => {
                return acc + bid.valueN;
            }, 0); // fixme
            tally.set(i, points);
        });

        let check = [...new Set(tally.values())];

        /**
         * If statement checks for ties
         */
        if (tally.size === check.length) {

            /**
             * Find highest bid, corresponding bidder, and allocate points
             */
            const highBid = Math.max(...check);
            const winKey = _.find(Array.from(tally), e => e[1] === highBid)[0];
            game.players[winKey].score += prize.valueN;
            game.markModified(`players.${winKey}.score`);

            cleanUp(game, prize);
        }

        game.advanceRound();
    }
}

/**
 * Compare players' scores each round, if either final round or someone is
 * over 45.5 points, declare them the winner
 *
 * @param {any} game
 * @param {boolean} [final=false]
 * @returns {User|Boolean}
 */
function checkScores(game, final = false) {

    let highestScore = 0;
    let winner       = null;

    game.players.forEach(p => {
        if (p.score > highestScore) {
            highestScore = p.score;
            if (final || p.score > 45.5) {
                winner = p;
            }
        }
    });

    if (winner) winner.win = true;

    return winner;
}

/**
 * Returns used bid cards to deck's discard pile,
 * and returns prize to discards pile
 *
 * @param {Game} game
 * @param {object} prize
 */
function cleanUp(game, prize) {
    game.players.forEach(p => {
        game.deck.discards.push(...p.bid);
        p.bid = [];
    });

    game.deck.discards.push(prize);
    game.deck.prize.pop();
    game.deck.discards.set("modified");
}

/**
 * Move a player's bid card from hand to bid stack
 *
 * @param {User} user
 * @param {Game} game
 * @param {object} bid
 */
function placeBid(user, game, bid) {

    user.bid.push(bid);

    user.hand = user.hand.filter(c => {
        return c !== bid;
    });

    user.atRound = game.round + 1;
}

module.exports = calculate;
