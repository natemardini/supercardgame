const _ = require("lodash");
const { Deck } = require("./../logic/card");



/**
 * function: create an array of 13 elements
 */
// function createSuit () {
//     const suit = [];
//     for (let i = 1; i <= 13; i++) {
//         suit.push(i);
//     }
//     return suit;
// }

/**
 * function: shuffle an array
 */
// function shuffle (input) {
//     for (let i = input.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [input[i], input[j]] = [input[j], input[i]];
//     }
//     return input;
// }


// let prizes = createSuit();  // from Game -> cards_in_play
// let user1 = createSuit();   // from Game -> cards_in_play
// let user2 = createSuit();   // from Game -> cards_in_play

// let user1Score = 0; // from db Match -> score
// let user2Score = 0; // from db Match -> score

// prizes = shuffle(prizes);
// user1 = shuffle(user1);
// user2 = shuffle(user2);

// console.log(`prizes: ${prizes}`);
// console.log(`user1: ${user1}`);
// console.log(`user2: ${user2}`);

// prizes: [3,7,10,12,1,11,9,2,5,6,4,13,8];
// user1: [3,8,10,4,11,6,5,13,2,7,12,9,1];
// user2: [1,3,5,4,2,10,12,6,11,9,7,13,8];


// game start

/**
 * function: startGame,
 * input should be an object, ie:
 * input = {round: 12,
    user1score: 43,
    user2score: 4,
    user1win: 1,
    user2win: 0,
    prize: 12,
    user1card: 10,
    user2card: 8 }
 */
function calculate(game, user, input) {

    if (game.status === 3) {
        return game;
    }

    const { bidCard, prizeCard } = input;

    placeBid(user, game, bidCard);
    checkBids(game, prizeCard);

    if (game.round === 13) {
        const winner = checkScores(game, true);
    } else {
        const winner = checkScores(game);
    }

    return game;
}


//     // if a user's score is > 45.5, win the game
//     else if (player1.score > player2.score && player1.score >= 45.5) {
//         player1.win = true;       //game finished,  user1 win
//     }
//     else if (player2.score > player1.score && player2.score >= 45.5) {
//         player2.win = true;      //game finished, user2 win
//     }

//     else {
//         if (user1Card > user2Card) {
//             user1Score += prize;
//         }
//         else if (user1Card < user2Card) {
//             user2Score += prize;
//         }
//         else {}  // console.log(`TIE this round!`);

//         if (user1Score > user2Score && user1Score >= 45.5) {
//             user1Win = 1;
//         }
//         else if (user2Score > user1Score && user2Score >= 45.5) {
//             user2Win = 1;
//         }
//         else {}
//     }

//     return { user1score: user1Score,
//         user2score: user2Score,
//         user1win: user1Win,
//         user2win: user2Win };
// }

function checkBids(game, prize) {
    prize = _.find(game.deck.prize, { valueN: prize.value, suit: prize.suit });

    const currentBids = game.players.reduce((a, p) => a += p.bid.length, 0);

    if (currentBids % game.players.length === 0) {

        const tally = new Map();

        game.players.forEach((p, i) => {
            const points = p.bid.reduce((a, b) => a + b, 0);
            tally.set(i, points);
        });

        const check = [...new Set(tally.values())];

        if (tally.size === check.length) {
            const highBid = Math.max(check);
            const winKey = _.find(Array.from(tally), e => e[1] === highBid)[0];
            game.players[winKey].score += prize.valueN;
            cleanUp(game, prize);
        }
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
    //const currentPlayer = _.find(game.players, { "userId": ObjectId(user) });
    const currentPlayer = _.find(game.players, ["userId", user.id]);
    const bidCard = _.find(currentPlayer.hand, { valueN: bid.value, suit: bid.suit });

    _.pull(currentPlayer.hand, bidCard);
    currentPlayer.bid.push(bidCard);
    currentPlayer.atRound = game.round + 1;
}


module.exports = calculate;



