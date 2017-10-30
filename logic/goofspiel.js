const _ = require("lodash");
const { Deck } = require("./../logic/card");


function calculate(game, user, input) {

    if (game.status === 3) {
        return game;
    }

    const { bidCard, prizeCard } = input;

    placeBid(user, game, bidCard);
    checkBids(game, prizeCard);

    let winner = null;

    if (game.round === 13) {
        winner = checkScores(game, true);
    } else {
        winner = checkScores(game);
    }

    return [game, winner];
}


function checkBids(game, prize) {
    prize = _.find(game.deck.prize, { valueN: prize.value, suit: prize.suit });

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
        p.bid.forEach(c => {
            Deck.returnCard({
                from: p.bid,
                to: game.deck,
                pile: "discards",
                card: c
            });
        });
    });

    Deck.returnCard({
        from: game.deck.prize,
        to: game.deck,
        pile: "discards",
        card: prize
    });
}

function placeBid(user, game, bid) {
    const currentPlayer = _.find(game.players, { "userId": user._id });
    const bidCard = _.find(currentPlayer.hand, { valueN: bid.value, suit: bid.suit });

    _.pull(currentPlayer.hand, bidCard);
    currentPlayer.bid.push(bidCard);
    currentPlayer.atRound = game.round + 1;
}


module.exports = calculate;



