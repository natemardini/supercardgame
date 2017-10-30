const _ = require("lodash");
const { Deck } = require("./../logic/card");


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


function checkBids(game, prize) {

    const currentBids = game.players.reduce((a, p) => a += p.bid.length, 0);

    if (currentBids % game.players.length === 0) {

        const tally = new Map();

        game.players.forEach((p, i) => {
            const points = p.bid.reduce((acc, bid) => {
                return acc + bid.valueN;
            }, 0); // fixme
            tally.set(i, points);
        });

        let check = [...new Set(tally.values())];

        if (tally.size === check.length) {
            const highBid = Math.max(...check);
            const winKey = _.find(Array.from(tally), e => e[1] === highBid)[0];
            game.players[winKey].score += prize.valueN;
            cleanUp(game, prize);
        }

        game.advanceRound();
    }
}

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

function cleanUp(game, prize) {
    game.players.forEach(p => {
        game.deck.discards.push(...p.bid);
        p.bid = [];
    });

    game.deck.discards.push(prize);
    game.deck.prize.pop();
    game.deck.discards.set("modified");
    // game.deck.prize = game.deck.prize.filter(c => {
    //     return !(c.suit === prize.suit && c.valueN === prize.valueN);
    // });
    //_.pull(game.deck.prize, prize);
    //_.pull(prize, game.deck.prize);

}

function placeBid(user, game, bid) {

    user.bid.push(bid);

    user.hand = user.hand.filter(c => {
        return c !== bid;
    });

    user.atRound = game.round + 1;
}


module.exports = calculate;



