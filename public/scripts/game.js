let zIndex = 100;
let prizeCard = {};
//bid card and prize card
//   send to router/
/**
 *
 *
 */
function initializeGame(){
    // Get json object for game 201 (hard-coded for now).
    $.getJSON( "http://localhost:8080/api/games/240", function(data) {

        // Initial position for Player1 hand.
        let x = -500;
        let y = 400;

        // Create player1 hand and deal cards.
        $.each(data["deck"]["phand1"], function(key, value) {
            createCard(0, value["suit"], value["valueN"], x, y);
            // If there's more cards, the next one should be shifted +90.
            x +=90;
            addCardClick(0, value["suit"], value["valueN"], -50, 230);
        });

        // create prize cards
        $.each(data["deck"]["prize"], function(key, value) {
            createCard(0, value["suit"], value["valueN"], 40, 80);
            addCardClick(0, value["suit"], value["valueN"], 40, 230);
            prizeCard = {"deck": data["deck"]["id"] ,
                        "suit": value["suit"],
                        "value": value["valueN"]
        }
        });

        // Create player2 hand.
        $.each(data["deck"]["phand2"], function(key, value) {
            createCard(0, value["suit"], value["valueN"], 200, 80);
            addCardClick(0, value["suit"], value["valueN"], 130, 230);
        });
    });
}

/**
 * movecard
 * @param {*} x
 * @param {*} suitName
 * @param {*} rankName
 * @param {*} x
 * @param {*} y
 * @param {*} z
 */
function addCardClick(i, suitName, rankName, x, y) {
    let divName = "div.card." + suitName +".rank" + rankName;
    $("body").on("click", divName, (event) => {
        zIndex += 2;
        $(event.currentTarget).css("transform", `translate(${x}px, ${y}px)`).css("z-index", zIndex);
        bid(rankName, suitName)
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
            "deck": prizeCard["deck"],
            "suit": suitName,
            "value": bidCard
        },
        prizeCard
    };

    console.log(bidCards);
    $.ajax({
        type: "POST",
        url: "/api/games/240",
        data: JSON.stringify(bidCards),//JSON.stringify(bidCards),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data){alert(data);},
        failure: function(errMsg) {
            alert(errMsg);
        }
  });

}

/**
 *
 * @param {any} type
 * @returns
 */
function createElement(type) {
    return document.createElement(type);
}

/**
 *
 *
 * @param {any} target
 * @param {any} name
 * @param {any} listener
 */
function addListener(target, name, listener) {
    target.addEventListener(name, listener);
}

/**
 *
 *
 * @returns
 */
function check3d() {
    // I admit, this line is stealed from the great Velocity.js!
    // http://julian.com/research/velocity/
    let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!isMobile) {
        return false;
    }

    let transform = prefix("transform");
    let $p = document.createElement("p");

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
        return "translate3d(" + a + ", " + b + ", " + c + ")";
    } else {
        return "translate(" + a + ", " + b + ")";
    }
}

let style = document.createElement("p").style;
let memoized = {};

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

    let camelCase = param[0].toUpperCase() + param.slice(1);
    let prefixes = ["webkit", "moz", "Moz", "ms", "o"];
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
    let transform = prefix("transform");

    // calculate rank/suit, etc..
    let rank = i % 13 + 1;
    let suit = i / 13 | 0;
    let z = (52 - i) / 4;

    // create elements
    let $el = createElement("div");
    let $face = createElement("div");
    let $back = createElement("div");

    // Set the suit/rank.
    $el.setAttribute("class", "card " + suitName + " rank" + rankName);

    let $container = document.getElementById('container');

    $container.appendChild($el);

    // self = card
    let self = { i: i, rank: rank, suit: suit, pos: i, $el: $el, mount: mount, unmount: unmount };

    //let modules = Deck.modules;
    //let module;

    // add classes
    $face.classList.add("face");
    $back.classList.add("back");

    // add default transform
    //$el.style[transform] = translate(-z + "px", -z + "px");
    $el.style[transform] = translate(x + "px", y + "px");

    // add default values
    self.x = -z;
    self.y = -z;
    self.z = z;
    self.rot = 0;

    // add drag/click listeners
    // addListener($el, "mousedown", onMousedown);
    // addListener($el, "touchstart", onMousedown);

    // load modules
    // for (module in modules) {
    //     addModule(modules[module]);
    // }

    function addModule(module) {
        // add card module
        module.card && module.card(self);
    }

    function mount(target) {
        // mount card to target (deck)
        target.appendChild($el);

        self.$root = target;
    }

    function unmount() {
        // unmount from root (deck)
        self.$root && self.$root.removeChild($el);
        self.$root = null;
    }

}

