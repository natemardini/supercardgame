// function creat an array of 13 elements
function createSuit () {
    const suit = [];
    for (let i = 1; i <= 13; i++) {
        suit.push(i);
    }
    return suit;
}


// function: shuffle an array
function shuffle (input) {
    for (let i = input.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [input[i], input[j]] = [input[j], input[i]];
    }
    return input;
}


let prizes = createSuit();
let user1 = createSuit();
let user2 = createSuit();

let user1Score = 0;
let user2Score = 0;

prizes = shuffle(prizes);
user1 = shuffle(user1);
user2 = shuffle(user2);

console.log(`prizes: ${prizes}`);
console.log(`user1: ${user1}`);
console.log(`user2: ${user2}`);

// prizes: [3,7,10,12,1,11,9,2,5,6,4,13,8];
// user1: [3,8,10,4,11,6,5,13,2,7,12,9,1];
// user2: [1,3,5,4,2,10,12,6,11,9,7,13,8];


// game start


for(let i = 0; i <= 13; i++) {

    if (i === 13) {
        if (user1Score > user2Score) {
            console.log(`user1 wins!, the socre is ${user1Score}:${user2Score}`);
        }
        else if (user1Score < user2Score) {
            console.log(`user2 wins!, the score is ${user1Score}:${user2Score}`);
        }
        else {
            console.log(`Tie! ${user1Score}:${user2Score}`);
        }
        break;
    }


    else if (user1Score > user2Score && user1Score >= 45.5) {
        console.log(`user1 wins!, the final score is ${user1Score}:${user2Score}`);
        break;
      }
      else if (user2Score > user1Score && user2Score >= 45.5) {
        console.log(`user2 wins!, the final score is ${user1Score}:${user2Score}`);
        break;
      }
      else {
        console.log(`\n ${i+1}th round:`)
        if (user1[i] > user2[i]) {
          user1Score += prizes[i];
        }
        else if (user1[i] < user2[i]) {
          user2Score += prizes[i];
        }
        else {
          console.log(`TIE this round!`);
        }
        console.log(`prize is ${prizes[i]}, user1 bet ${user1[i]}, user2 bet ${user2[i]}
          user1 score: ${user1Score}, user2 score: ${user2Score}`);

      }

}






