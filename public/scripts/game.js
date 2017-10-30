// console.log(window.location.split("/").reverse()[0]);
//console.log(window.location.search.substr(-24));

$(document).ready(function () {
    // REMOVE THIS and replace with call event on click.
    initializeGame(window.location.search.substr(-24));
});


let zIndex = 100;
let prizeCard = {};
let gameID;
let currentRound;
let gameData;
let userPlayer;
let userPlayer1;
/**
 * This function pulls in the game data then 'deals' the cards.
 *
 */
function initializeGame(gID){
    gameID = gID;
    // $("#Start").click(function() {
        // $( ".card" ).remove(); // remove all the cards on the screen and start a new game
    $.getJSON(`/api/games/${gameID}`, function(data) {
        // Initial position for Player1 hand.
        let x = -500;
        const y = 400;

        userPlayer = data.game.players.filter(p => {
            return p.userId === data.player;
        })[0];

        userPlayer1 = data.game.players.filter(p => {
            return p.userId != data.player;
        })[0];


        // Set the current round and stash the current game data (global variables).
        currentRound = data.game.round;
        gameData = data;

        const canPlay = userPlayer.atRound <= currentRound;


        // debugger;
        $("#Score").find(".current-player-score").text(`${userPlayer.score} `);
        $("#Score").find(".other-player-score").text(` ${userPlayer1.score}`);

        //$("#Score").html(`<a class="nav-link">The score is ${userPlayer.score} : ${userPlayer1.score}</a>`);
        // Create player1 hand and deal cards.
        $.each(userPlayer["hand"], function(key, value) {
            createCard(0, value["suit"], value["valueN"], -600, 400);
            delayCard(value["suit"], value["valueN"], x, y);

            // If there's more cards, the next one should be shifted +90.
            x += 90;

            canPlay && addCardClick(0, value["suit"], value["valueN"], -50, 230);
        });

        // create prize cards
        $.each(data["game"]["deck"]["prize"], function(key, value) {
            createCard(0, value["suit"], value["valueN"], 40, 80);
            //addCardClick(0, value["suit"], value["valueN"], 40, 230);
            prizeCard = {
                "suit": value["suit"],
                "value": value["valueN"]
            };
        });
    });

    // });
}

/**
 * test card function
 */
function delayCard (suit, rank, x, y){
    // let transform = prefix("transform");

    let $changePoz = document.getElementById(`card_${suit}_rank${rank}`);
    setTimeout(function(){ $changePoz.style.transform = `translate(${x  }px, ${y  }px)`;}, 100);
}


/**
 * addCardClick
 * @param {*} x
 * @param {*} suitName
 * @param {*} rankName
 * @param {*} x
 * @param {*} y
 * @param {*} z
 */
function addCardClick(i, suitName, rankName, x, y) {
    const divName = `div.card.${  suitName }.rank${  rankName}`;
    $("body").on("click", divName, (event) => {
        const bidCardPosition = $(event.currentTarget).css("transform");
        zIndex += 2;
        $(event.currentTarget).css("transform", `translate(${x}px, ${y}px)`).css("z-index", zIndex).addClass("played");
        bid(rankName, suitName);
        moveCard(divName, bidCardPosition);
    });

}

/**
 *
 * @param {any} bidCard
 * @param {any} prizeCard
 */
function bid(bidCard, suitName){
    const bidCards = {
        bidCard: {
            // "deck": prizeCard["deck"],
            "suit": suitName,
            "value": bidCard
        },
        prizeCard
    };

    $.ajax({
        type: "POST",
        url: `/api/games/${gameID}`,
        data: JSON.stringify(bidCards),//JSON.stringify(bidCards),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function () {
            location.reload();
        }    ,
        failure: function(errMsg) {
            alert(errMsg);
        }
    });

}

/**
 *  This function will receive a json object which lists the current round.
 *  If the round has increased, we can end the turn otherwise redirect user back to lobby.
 *
 */
function processBid(objJSON){
    console.log(objJSON);
    // The round is the same if we're waiting for the opponent to bid.
    if (objJSON["round"] === currentRound){
        window.location = "/users/lobby";
    } else {

        // Create array of old prizes (to be removed from the board).
        let prizeDiff = deepDiffMapper.map(gameData["game"]["deck"]["prize"], objJSON["deck"]["prize"]);

        // Find the "deleted" record based on type.
        for (let prize in prizeDiff){
            if(prizeDiff[prize]["type"]){
                $(`div.card.${prizeDiff[prize]["data"]["suit"]}.rank${prizeDiff[prize]["data"]["valueN"]}`).detach();
                //console.log(prizeDiff[prize]["data"]["suit"] + " " + prizeDiff[prize]["data"]["valueN"]);

                // Need to update prize card or refresh/reload the gameboard?
                prizeCard = {
                    "suit": prizeDiff[prize - 1]["suit"],
                    "value": prizeDiff[prize - 1]["valueN"]
                };
            }
        }
        const player0 = objJSON["players"][0];
        const player1 = objJSON["players"][1];

        // FOR FUTURE REF, objJSON["players"][0]["_id"] is the user id.
        let strMsg = "You are ";
        if (player0["active"]){
            if (player0["score"] > player1["score"]){
                strMsg += "winning ";
            } else {
                strMsg += "losing ";
            }
            strMsg += player0["score"] + " to " + player1["score"];
            // $("#Score").text(strMsg);
        } else {
            if (player1["score"] > player0["score"]){
                strMsg += "winning ";
            } else {
                strMsg += "losing ";
            }
            strMsg += player1["score"] + " to " + player0["score"];
            // $("#Score").text(strMsg);
        }

        // Alert the current score (change to display on screen).
        //let strMsg = `${objJSON["players"][0]["score"]} to ${objJSON["players"][1]["score"]}`;
        alert(strMsg);
    }

}

/**
 *  This function is used to shift the players hand cards as bids are made.
 * @param {string} oldCard
 * @param {string} bidPosition
 */
function moveCard(oldCard, bidPosition){
    // Get the card right of the bid card.
    let rightCard = $(oldCard).next();

    // This loop ensures the card we want to shift hasn't already been used as a bid (i.e. played).
    while (rightCard.hasClass("played")){
        rightCard = $(rightCard).next();
    }

    // Get the suit from the class and only move cards from the same hand/pile.
    const oldCardClass = $(oldCard).attr("class").replace("card ", "").replace(" rank", "").substr(0, 4);
    const rightCardClass = rightCard.attr("class").replace("card ", "").replace(" rank", "").substr(0, 4);

    // Get the bid card position so we can shift all the cards to that position
    const bidCardPosition = rightCard.css("transform");

    // If the card to the right of the bid card is the same suit, move it to that position, then repeat for the rest of the hand.
    if (oldCardClass === rightCardClass){
        $(rightCard).css("transform", bidPosition);
        moveCard(rightCard, bidCardPosition);
    }
}

/**
 *
 * @param {any} type
 * @returns
 */
function createElement(type) {
    return document.createElement(type);
}

// function addListener(target, name, listener) {
//     target.addEventListener(name, listener);
// }

/**
 *
 *
 * @returns
 */
function check3d() {
    // I admit, this line is stealed from the great Velocity.js!
    // http://julian.com/research/velocity/
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!isMobile) {
        return false;
    }

    const transform = prefix("transform");
    const $p = document.createElement("p");

    document.body.appendChild($p);
    $p.style[transform] = "translate3d(1px,1px,1px)";

    has3d = $p.style[transform];
    has3d = has3d != null && has3d.length && has3d !== "none";

    document.body.removeChild($p);

    return has3d;
}

/**
 *
 * @param {any} a
 * @param {any} b
 * @param {any} c
 * @returns
 */
function translate(a, b, c) {
    typeof has3d !== "undefined" || (has3d = check3d());

    c = c || 0;

    if (has3d) {
        return `translate3d(${  a  }, ${  b  }, ${  c  })`;
    } else {
        return `translate(${  a  }, ${  b  })`;
    }
}

const style = document.createElement("p").style;
const memoized = {};

/**
 *
 *
 * @param {any} param
 * @returns
 */
function prefix(param) {
    if (typeof memoized[param] !== "undefined") {
        return memoized[param];
    }

    if (typeof style[param] !== "undefined") {
        memoized[param] = param;
        return param;
    }

    const camelCase = param[0].toUpperCase() + param.slice(1);
    const prefixes = ["webkit", "moz", "Moz", "ms", "o"];
    let test;

    for (let i = 0, len = prefixes.length; i < len; i++) {
        test = prefixes[i] + camelCase;
        if (typeof style[test] !== "undefined") {
            memoized[param] = test;
            return test;
        }
    }
}

/**
 *
 *
 * @param {any} i
 */
function createCard(i, suitName, rankName, x, y){
    const transform = prefix("transform");

    // calculate rank/suit, etc..
    const rank = i % 13 + 1;
    const suit = i / 13 | 0;
    const z = (52 - i) / 4;

    // create elements
    const $el = createElement("div");
    const $face = createElement("div");
    const $back = createElement("div");

    // Set the suit/rank.
    $el.setAttribute("class", `card ${  suitName  } rank${  rankName}`);
    $el.setAttribute("id", `card_${suitName}_rank${rankName}`);

    const $container = document.getElementById("container");

    $container.appendChild($el);

    // self = card
    // const self = { i: i, rank: rank, suit: suit, pos: i, $el: $el, mount: mount, unmount: unmount };

    //let modules = Deck.modules;
    //let module;

    // add classes
    $face.classList.add("face");
    $back.classList.add("back");

    // add default transform
    //$el.style[transform] = translate(-z + "px", -z + "px");
    // $el.style[transform] = translate(`${-50  }px`, `${80  }px`);
    $el.style[transform] = translate(`${x  }px`, `${y  }px`);
    // $el.style.visibility = 'hidden';

    // add default values
    // self.x = -z;
    // self.y = -z;
    // self.z = z;
    // self.rot = 0;

    $el.appendChild($face);

    // add drag/click listeners
    // addListener($el, "mousedown", onMousedown);
    // addListener($el, "touchstart", onMousedown);

    // load modules
    // for (module in modules) {
    //     addModule(modules[module]);
    // }

    // function addModule(module) {f
    //     // add card module
    //     module.card && module.card(self);
    // }

    // function mount(target) {
    //     // mount card to target (deck)
    //     target.appendChild($el);

    //     self.$root = target;
    // }

    // function unmount() {
    //     // unmount from root (deck)
    //     self.$root && self.$root.removeChild($el);
    //     self.$root = null;
    // }

}

//https://stackoverflow.com/questions/8572826/generic-deep-diff-between-two-objects
let deepDiffMapper = function() {
    return {
        VALUE_CREATED: 'created',
        VALUE_UPDATED: 'updated',
        VALUE_DELETED: 'deleted',
        VALUE_UNCHANGED: 'unchanged',
        map: function(obj1, obj2) {
            if (this.isFunction(obj1) || this.isFunction(obj2)) {
                throw 'Invalid argument. Function given, object expected.';
            }
            if (this.isValue(obj1) || this.isValue(obj2)) {
                return {
                    type: this.compareValues(obj1, obj2),
                    data: (obj1 === undefined) ? obj2 : obj1
                };
            }

            var diff = {};
            for (var key in obj1) {
                if (this.isFunction(obj1[key])) {
                    continue;
                }

                var value2 = undefined;
                if ('undefined' != typeof(obj2[key])) {
                    value2 = obj2[key];
                }

                diff[key] = this.map(obj1[key], value2);
            }
            for (var key in obj2) {
                if (this.isFunction(obj2[key]) || ('undefined' != typeof(diff[key]))) {
                    continue;
                }

                diff[key] = this.map(undefined, obj2[key]);
            }

            return diff;

        },
        compareValues: function(value1, value2) {
            if (value1 === value2) {
                return this.VALUE_UNCHANGED;
            }
            if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
                return this.VALUE_UNCHANGED;
            }
            if ('undefined' == typeof(value1)) {
                return this.VALUE_CREATED;
            }
            if ('undefined' == typeof(value2)) {
                return this.VALUE_DELETED;
            }

            return this.VALUE_UPDATED;
        },
        isFunction: function(obj) {
            return {}.toString.apply(obj) === '[object Function]';
        },
        isArray: function(obj) {
            return {}.toString.apply(obj) === '[object Array]';
        },
        isDate: function(obj) {
            return {}.toString.apply(obj) === '[object Date]';
        },
        isObject: function(obj) {
            return {}.toString.apply(obj) === '[object Object]';
        },
        isValue: function(obj) {
            return !this.isObject(obj) && !this.isArray(obj);
        }
    }
}();
