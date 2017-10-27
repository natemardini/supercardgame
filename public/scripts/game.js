
/**
 *
 *
 */
function initializeGame(){
    // $(document).ready(function() {


    //         $("body").on("click", "div.card.diamonds.rank1", (event) => {
    //             // console.log(event.curr)
    //             $(this).find('div.card.diamonds.rank1').css("transform", "translate(0px, 230px)")
    //         });

    //     });

    // Get json object for game 201 (hard-coded for now).
    $.getJSON( "http://localhost:8080/api/games/201", function(data) {
        $.each(data["deck"]["phand1"], function(key, value) {
            console.log(value["suit"] + " " + value["valueN"]);
            displayCard(0, value["suit"], value["valueN"]);
            moveCard(0, value["suit"], value["valueN"]);
        });
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
 * @param {any} rankName
 * @param {any} suitName
 */
function moveCard(x, suitName, rankName) {
    let divName = "div.card." + suitName +".rank" + rankName;

    $("body").on("click", divName, (event) => {
        $(event.currentTarget).css("transform", "translate(0px, 230px)")
    });

}

/**
 *
 *
 * @param {any} i
 */
function displayCard(i, rankName, suitName){
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
    $el.setAttribute("class", "card " + rankName + " rank" + suitName);

    var $container = document.getElementById('container');

    $container.appendChild($el);

    // self = card
    let self = { i: i, rank: rank, suit: suit, pos: i, $el: $el, mount: mount, unmount: unmount };

    //let modules = Deck.modules;
    //let module;

    // add classes
    $face.classList.add("face");
    $back.classList.add("back");

    // add default transform
    $el.style[transform] = translate(-z + "px", -z + "px");

    // add default values
    self.x = -z;
    self.y = -z;
    self.z = z;
    self.rot = 0;


    // add drag/click listeners
    //addListener($el, "mousedown", onMousedown);
    //addListener($el, "touchstart", onMousedown);

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

