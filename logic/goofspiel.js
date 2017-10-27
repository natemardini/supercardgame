/**
 * function: create an array of 13 elements
 */
function createSuit () {
    const suit = [];
    for (let i = 1; i <= 13; i++) {
        suit.push(i);
    }
    return suit;
}

/**
 * function: shuffle an array
 */
function shuffle (input) {
    for (let i = input.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [input[i], input[j]] = [input[j], input[i]];
    }
    return input;
}


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
function startGame(input) {
    const i = input.round;
    let user1Score = input.user1score;
    let user2Score = input.user2score;
    let user1Win = input.user1win;
    let user2Win = input.user2win;
    const prize = input.prize;
    const user1Card = input.user1card;
    const user2Card = input.user2card;

    if (user1Win || user2Win) {
        return 0; //game already finished!
    }
    else if (i === 13) {                 // last round of the game, compare final scores
        if (user1Score > user2Score) {
            user1Win = 1;   //game finished, user1 win
        }
        else if (user1Score < user2Score) {
            user2Win = 1;   //game finished, user2 win
        }
        else {} //game finished, Tie!
    }

    // if a user's score is > 45.5, win the game
    else if (user1Score > user2Score && user1Score >= 45.5) {
        user1Win = 1;       //game finished,  user1 win
    }
    else if (user2Score > user1Score && user2Score >= 45.5) {
        user2Win = 1;      //game finished, user2 win
    }

    else {
        if (user1Card > user2Card) {
            user1Score += prize;
        }
        else if (user1Card < user2Card) {
            user2Score += prize;
        }
        else {}  // console.log(`TIE this round!`);

        if (user1Score > user2Score && user1Score >= 45.5) {
            user1Win = 1;
        }
        else if (user2Score > user1Score && user2Score >= 45.5) {
            user2Win = 1;
        }
        else {}
    }
    return { user1score: user1Score,
        user2score: user2Score,
        user1win: user1Win,
        user2win: user2Win };
}
module.exports = { startGame: startGame };



