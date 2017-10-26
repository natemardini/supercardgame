"use strict";

let Deck = (function () {
    "use strict";

    let ticking;
    let animations = [];

    function animationFrames(delay, duration) {
        let now = Date.now();

        // calculate animation start/end times
        let start = now + delay;
        let end = start + duration;

        let animation = {
            start: start,
            end: end
        };

        // add animation
        animations.push(animation);

        if (!ticking) {
            // start ticking
            ticking = true;
            requestAnimationFrame(tick);
        }
        let self = {
            start: function start(cb) {
                // add start callback (just one)
                animation.startcb = cb;
                return self;
            },
            progress: function progress(cb) {
                // add progress callback (just one)
                animation.progresscb = cb;
                return self;
            },
            end: function end(cb) {
                // add end callback (just one)
                animation.endcb = cb;
                return self;
            }
        };
        return self;
    }

    function tick() {
        let now = Date.now();

        if (!animations.length) {
            // stop ticking
            ticking = false;
            return;
        }

        for (let i = 0, animation; i < animations.length; i++) {
            animation = animations[i];
            if (now < animation.start) {
                // animation not yet started..
                continue;
            }
            if (!animation.started) {
                // animation starts
                animation.started = true;
                animation.startcb && animation.startcb();
            }
            // animation progress
            let t = (now - animation.start) / (animation.end - animation.start);
            animation.progresscb && animation.progresscb(t < 1 ? t : 1);
            if (now > animation.end) {
                // animation ended
                animation.endcb && animation.endcb();
                animations.splice(i--, 1);
                continue;
            }
        }
        requestAnimationFrame(tick);
    }

    // fallback
    window.requestAnimationFrame || (window.requestAnimationFrame = function (cb) {
        setTimeout(cb, 0);
    });

    let style = document.createElement("p").style;
    let memoized = {};

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

    let has3d;

    function translate(a, b, c) {
        typeof has3d !== "undefined" || (has3d = check3d());

        c = c || 0;

        if (has3d) {
            return "translate3d(" + a + ", " + b + ", " + c + ")";
        } else {
            return "translate(" + a + ", " + b + ")";
        }
    }

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

    function createElement(type) {
        return document.createElement(type);
    }

    let maxZ = 52;

    function _card(i) {
        let transform = prefix("transform");

        // calculate rank/suit, etc..
        let rank = i % 13 + 1;
        let suit = i / 13 | 0;
        let z = (52 - i) / 4;

        // create elements
        let $el = createElement("div");
        let $face = createElement("div");
        let $back = createElement("div");

        // states
        let isDraggable = false;
        let isFlippable = false;

        // self = card
        let self = { i: i, rank: rank, suit: suit, pos: i, $el: $el, mount: mount, unmount: unmount, setSide: setSide };

        let modules = Deck.modules;
        let module;

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

        // set default side to back
        self.setSide("back");

        // add drag/click listeners
        addListener($el, "mousedown", onMousedown);
        addListener($el, "touchstart", onMousedown);

        // load modules
        for (module in modules) {
            addModule(modules[module]);
        }

        self.animateTo = function (params) {
            let delay = params.delay;
            let duration = params.duration;
            let _params$x = params.x;
            let x = _params$x === undefined ? self.x : _params$x;
            let _params$y = params.y;
            let y = _params$y === undefined ? self.y : _params$y;
            let _params$rot = params.rot;
            let rot = _params$rot === undefined ? self.rot : _params$rot;
            let ease$$ = params.ease;
            let onStart = params.onStart;
            let onProgress = params.onProgress;
            let onComplete = params.onComplete;

            let startX, startY, startRot;
            let diffX, diffY, diffRot;

            animationFrames(delay, duration).start(function () {
                startX = self.x || 0;
                startY = self.y || 0;
                startRot = self.rot || 0;
                onStart && onStart();
            }).progress(function (t) {
                let et = ease[ease$$ || "cubicInOut"](t);

                diffX = x - startX;
                diffY = y - startY;
                diffRot = rot - startRot;

                onProgress && onProgress(t, et);

                self.x = startX + diffX * et;
                self.y = startY + diffY * et;
                self.rot = startRot + diffRot * et;

                $el.style[transform] = translate(self.x + "px", self.y + "px") + (diffRot ? "rotate(" + self.rot + "deg)" : "");
            }).end(function () {
                onComplete && onComplete();
            });
        };

        // set rank & suit
        self.setRankSuit = function (rank, suit) {
            let suitName = SuitName(suit);
            $el.setAttribute("class", "card " + suitName + " rank" + rank);
        };

        self.setRankSuit(rank, suit);

        self.enableDragging = function () {
            // this activates dragging
            if (isDraggable) {
                // already is draggable, do nothing
                return;
            }
            isDraggable = true;
            $el.style.cursor = "move";
        };

        self.enableFlipping = function () {
            if (isFlippable) {
                // already is flippable, do nothing
                return;
            }
            isFlippable = true;
        };

        self.disableFlipping = function () {
            if (!isFlippable) {
                // already disabled flipping, do nothing
                return;
            }
            isFlippable = false;
        };

        self.disableDragging = function () {
            if (!isDraggable) {
                // already disabled dragging, do nothing
                return;
            }
            isDraggable = false;
            $el.style.cursor = "";
        };

        return self;

        function addModule(module) {
            // add card module
            module.card && module.card(self);
        }

        function onMousedown(e) {
            let startPos = {};
            let pos = {};
            let starttime = Date.now();

            e.preventDefault();

            // get start coordinates and start listening window events
            if (e.type === "mousedown") {
                startPos.x = pos.x = e.clientX;
                startPos.y = pos.y = e.clientY;
                addListener(window, "mousemove", onMousemove);
                addListener(window, "mouseup", onMouseup);
            } else {
                startPos.x = pos.x = e.touches[0].clientX;
                startPos.y = pos.y = e.touches[0].clientY;
                addListener(window, "touchmove", onMousemove);
                addListener(window, "touchend", onMouseup);
            }

            if (!isDraggable) {
                // is not draggable, do nothing
                return;
            }

            // move card
            $el.style[transform] = translate(self.x + "px", self.y + "px") + (self.rot ? " rotate(" + self.rot + "deg)" : "");
            $el.style.zIndex = maxZ++;

            function onMousemove(e) {
                if (!isDraggable) {
                    // is not draggable, do nothing
                    return;
                }
                if (e.type === "mousemove") {
                    pos.x = e.clientX;
                    pos.y = e.clientY;
                } else {
                    pos.x = e.touches[0].clientX;
                    pos.y = e.touches[0].clientY;
                }

                // move card
                $el.style[transform] = translate(Math.round(self.x + pos.x - startPos.x) + "px", Math.round(self.y + pos.y - startPos.y) + "px") + (self.rot ? " rotate(" + self.rot + "deg)" : "");
            }

            function onMouseup(e) {
                if (isFlippable && Date.now() - starttime < 200) {
                    // flip sides
                    self.setSide(self.side === "front" ? "back" : "front");
                }
                if (e.type === "mouseup") {
                    removeListener(window, "mousemove", onMousemove);
                    removeListener(window, "mouseup", onMouseup);
                } else {
                    removeListener(window, "touchmove", onMousemove);
                    removeListener(window, "touchend", onMouseup);
                }
                if (!isDraggable) {
                    // is not draggable, do nothing
                    return;
                }

                // set current position
                self.x = self.x + pos.x - startPos.x;
                self.y = self.y + pos.y - startPos.y;
            }
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

        function setSide(newSide) {
            // flip sides
            if (newSide === "front") {
                if (self.side === "back") {
                    $el.removeChild($back);
                }
                self.side = "front";
                $el.appendChild($face);
                self.setRankSuit(self.rank, self.suit);
            } else {
                if (self.side === "front") {
                    $el.removeChild($face);
                }
                self.side = "back";
                $el.appendChild($back);
                $el.setAttribute("class", "card");
            }
        }
    }

    function SuitName(suit) {
    // return suit name from suit value
        return suit === 0 ? "spades" : suit === 1 ? "hearts" : suit === 2 ? "clubs" : suit === 3 ? "diamonds" : "joker";
    }

    function addListener(target, name, listener) {
        target.addEventListener(name, listener);
    }

    function removeListener(target, name, listener) {
        target.removeEventListener(name, listener);
    }

    let ease = {
        linear: function linear(t) {
            return t;
        },
        quadIn: function quadIn(t) {
            return t * t;
        },
        quadOut: function quadOut(t) {
            return t * (2 - t);
        },
        quadInOut: function quadInOut(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        },
        cubicIn: function cubicIn(t) {
            return t * t * t;
        },
        cubicOut: function cubicOut(t) {
            return --t * t * t + 1;
        },
        cubicInOut: function cubicInOut(t) {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        },
        quartIn: function quartIn(t) {
            return t * t * t * t;
        },
        quartOut: function quartOut(t) {
            return 1 - --t * t * t * t;
        },
        quartInOut: function quartInOut(t) {
            return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
        },
        quintIn: function quintIn(t) {
            return t * t * t * t * t;
        },
        quintOut: function quintOut(t) {
            return 1 + --t * t * t * t * t;
        },
        quintInOut: function quintInOut(t) {
            return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
        }
    };

    let flip = {
        deck: function deck(_deck) {
            _deck.flip = _deck.queued(flip);

            function flip(next, side) {
                let flipped = _deck.cards.filter(function (card) {
                    return card.side === "front";
                }).length / _deck.cards.length;

                _deck.cards.forEach(function (card, i) {
                    card.setSide(side ? side : flipped > 0.5 ? "back" : "front");
                });
                next();
            }
        }
    };

    let sort = {
        deck: function deck(_deck2) {
            _deck2.sort = _deck2.queued(sort);

            function sort(next, reverse) {
                let cards = _deck2.cards;

                cards.sort(function (a, b) {
                    if (reverse) {
                        return a.i - b.i;
                    } else {
                        return b.i - a.i;
                    }
                });

                cards.forEach(function (card, i) {
                    card.sort(i, cards.length, function (i) {
                        if (i === cards.length - 1) {
                            next();
                        }
                    }, reverse);
                });
            }
        },
        card: function card(_card2) {
            let $el = _card2.$el;

            _card2.sort = function (i, len, cb, reverse) {
                let z = i / 4;
                let delay = i * 10;

                _card2.animateTo({
                    delay: delay,
                    duration: 400,

                    x: -z,
                    y: -150,
                    rot: 0,

                    onComplete: function onComplete() {
                        $el.style.zIndex = i;
                    }
                });

                _card2.animateTo({
                    delay: delay + 500,
                    duration: 400,

                    x: -z,
                    y: -z,
                    rot: 0,

                    onComplete: function onComplete() {
                        cb(i);
                    }
                });
            };
        }
    };

    function plusminus(value) {
        let plusminus = Math.round(Math.random()) ? -1 : 1;

        return plusminus * value;
    }

    function fisherYates(array) {
        let rnd, temp;

        for (let i = array.length - 1; i; i--) {
            rnd = Math.random() * i | 0;
            temp = array[i];
            array[i] = array[rnd];
            array[rnd] = temp;
        }

        return array;
    }

    function fontSize() {
        return window.getComputedStyle(document.body).getPropertyValue("font-size").slice(0, -2);
    }

    let ____fontSize;

    let shuffle = {
        deck: function deck(_deck3) {
            _deck3.shuffle = _deck3.queued(shuffle);

            function shuffle(next) {
                let cards = _deck3.cards;

                ____fontSize = fontSize();

                fisherYates(cards);

                cards.forEach(function (card, i) {
                    card.pos = i;

                    card.shuffle(function (i) {
                        if (i === cards.length - 1) {
                            next();
                        }
                    });
                });
                return;
            }
        },

        card: function card(_card3) {
            let $el = _card3.$el;

            _card3.shuffle = function (cb) {
                let i = _card3.pos;
                let z = i / 4;
                let delay = i * 2;

                _card3.animateTo({
                    delay: delay,
                    duration: 200,

                    x: plusminus(Math.random() * 40 + 20) * ____fontSize / 16,
                    y: -z,
                    rot: 0
                });
                _card3.animateTo({
                    delay: 200 + delay,
                    duration: 200,

                    x: -z,
                    y: -z,
                    rot: 0,

                    onStart: function onStart() {
                        $el.style.zIndex = i;
                    },

                    onComplete: function onComplete() {
                        cb(i);
                    }
                });
            };
        }
    };

    let __fontSize;

    let poker = {
        deck: function deck(_deck4) {
            _deck4.poker = _deck4.queued(poker);

            function poker(next) {
                let cards = _deck4.cards;
                let len = cards.length;

                __fontSize = fontSize();

                cards.slice(-5).reverse().forEach(function (card, i) {
                    card.poker(i, len, function (i) {
                        card.setSide("front");
                        if (i === 4) {
                            next();
                        }
                    });
                });
            }
        },
        card: function card(_card4) {
            let $el = _card4.$el;

            _card4.poker = function (i, len, cb) {
                let delay = i * 250;

                _card4.animateTo({
                    delay: delay,
                    duration: 250,

                    x: Math.round((i - 2.05) * 70 * __fontSize / 16),
                    y: Math.round(-110 * __fontSize / 16),
                    rot: 0,

                    onStart: function onStart() {
                        $el.style.zIndex = len - 1 + i;
                    },
                    onComplete: function onComplete() {
                        cb(i);
                    }
                });
            };
        }
    };

    let intro = {
        deck: function deck(_deck5) {
            _deck5.intro = _deck5.queued(intro);

            function intro(next) {
                let cards = _deck5.cards;

                cards.forEach(function (card, i) {
                    card.setSide("front");
                    card.intro(i, function (i) {
                        animationFrames(250, 0).start(function () {
                            card.setSide("back");
                        });
                        if (i === cards.length - 1) {
                            next();
                        }
                    });
                });
            }
        },
        card: function card(_card5) {
            let transform = prefix("transform");

            let $el = _card5.$el;

            _card5.intro = function (i, cb) {
                let delay = 500 + i * 10;
                let z = i / 4;

                $el.style[transform] = translate(-z + "px", "-250px");
                $el.style.opacity = 0;

                _card5.x = -z;
                _card5.y = -250 - z;
                _card5.rot = 0;

                _card5.animateTo({
                    delay: delay,
                    duration: 1000,

                    x: -z,
                    y: -z,

                    onStart: function onStart() {
                        $el.style.zIndex = i;
                    },
                    onProgress: function onProgress(t) {
                        $el.style.opacity = t;
                    },
                    onComplete: function onComplete() {
                        $el.style.opacity = "";
                        cb && cb(i);
                    }
                });
            };
        }
    };

    let _fontSize;

    let fan = {
        deck: function deck(_deck6) {
            _deck6.fan = _deck6.queued(fan);

            function fan(next) {
                let cards = _deck6.cards;
                let len = cards.length;

                _fontSize = fontSize();

                cards.forEach(function (card, i) {
                    card.fan(i, len, function (i) {
                        if (i === cards.length - 1) {
                            next();
                        }
                    });
                });
            }
        },
        card: function card(_card6) {
            let $el = _card6.$el;

            _card6.fan = function (i, len, cb) {
                let z = i / 4;
                let delay = i * 10;
                let rot = i / (len - 1) * 260 - 130;

                _card6.animateTo({
                    delay: delay,
                    duration: 300,

                    x: -z,
                    y: -z,
                    rot: 0
                });
                _card6.animateTo({
                    delay: 300 + delay,
                    duration: 300,

                    x: Math.cos(deg2rad(rot - 90)) * 55 * _fontSize / 16,
                    y: Math.sin(deg2rad(rot - 90)) * 55 * _fontSize / 16,
                    rot: rot,

                    onStart: function onStart() {
                        $el.style.zIndex = i;
                    },

                    onComplete: function onComplete() {
                        cb(i);
                    }
                });
            };
        }
    };

    function deg2rad(degrees) {
        return degrees * Math.PI / 180;
    }

    let ___fontSize;

    let bysuit = {
        deck: function deck(_deck7) {
            _deck7.bysuit = _deck7.queued(bysuit);

            function bysuit(next) {
                let cards = _deck7.cards;

                ___fontSize = fontSize();

                cards.forEach(function (card) {
                    card.bysuit(function (i) {
                        if (i === cards.length - 1) {
                            next();
                        }
                    });
                });
            }
        },
        card: function card(_card7) {
            let rank = _card7.rank;
            let suit = _card7.suit;

            _card7.bysuit = function (cb) {
                let i = _card7.i;
                let delay = i * 10;

                _card7.animateTo({
                    delay: delay,
                    duration: 400,

                    x: -Math.round((6.75 - rank) * 8 * ___fontSize / 16),
                    y: -Math.round((1.5 - suit) * 92 * ___fontSize / 16),
                    rot: 0,

                    onComplete: function onComplete() {
                        cb(i);
                    }
                });
            };
        }
    };

    //let ___fontSize;
    
        let dealhand = {
            deck: function deck(_deck9) {
                _deck9.dealhand = _deck9.queued(dealhand);
    
                function dealhand(next) {
                    let cards = _deck9.cards;
    
                    ___fontSize = fontSize();
    
                    cards.forEach(function (card) {
                        card.dealhand(function (i) {
                            if (card.suit !== 0 && card.suit !==1){
                                if (i === cards.length - 1) {
                                    next();
                                }
                            }
                        });
                    });
                }
            },
            card: function card(_card9) {
                let rank = _card9.rank;
                let suit = _card9.suit;
    
                _card9.dealhand = function (cb) {
                    let i = _card9.i;
                    let delay = i * 10;
console.log(fontSize())
                    _card9.animateTo({
                        delay: delay,
                        duration: 400,
    
                        x: -Math.round((6.75 - rank) * 8 * ___fontSize / 16)*8,
                        y: -Math.round((1.5 - suit) * 92 * ___fontSize / 16)*2,
                        rot: 0,
    
                        onComplete: function onComplete() {
                            cb(i);
                        }
                    });
                };
            }
        };

    function queue(target) {
        let array = Array.prototype;

        let queueing = [];

        target.queue = queue;
        target.queued = queued;

        return target;

        function queued(action) {
            return function () {
                let self = this;
                let args = arguments;

                queue(function (next) {
                    action.apply(self, array.concat.apply(next, args));
                });
            };
        }

        function queue(action) {
            if (!action) {
                return;
            }

            queueing.push(action);

            if (queueing.length === 1) {
                next();
            }
        }
        function next() {
            queueing[0](function (err) {
                if (err) {
                    throw err;
                }

                queueing = queueing.slice(1);

                if (queueing.length) {
                    next();
                }
            });
        }
    }

    function observable(target) {
        target || (target = {});
        let listeners = {};

        target.on = on;
        target.one = one;
        target.off = off;
        target.trigger = trigger;

        return target;

        function on(name, cb, ctx) {
            listeners[name] || (listeners[name] = []);
            listeners[name].push({ cb: cb, ctx: ctx });
        }

        function one(name, cb, ctx) {
            listeners[name] || (listeners[name] = []);
            listeners[name].push({
                cb: cb, ctx: ctx, once: true
            });
        }

        function trigger(name) {
            let self = this;
            let args = Array.prototype.slice(arguments, 1);

            let currentListeners = listeners[name] || [];

            currentListeners.filter(function (listener) {
                listener.cb.apply(self, args);

                return !listener.once;
            });
        }

        function off(name, cb) {
            if (!name) {
                listeners = {};
                return;
            }

            if (!cb) {
                listeners[name] = [];
                return;
            }

            listeners[name] = listeners[name].filter(function (listener) {
                return listener.cb !== cb;
            });
        }
    }

    function Deck(jokers) {
    // init cards array
        let cards = new Array(jokers ? 55 : 52);

        let $el = createElement("div");
        let self = observable({ mount: mount, unmount: unmount, cards: cards, $el: $el });
        let $root;

        let modules = Deck.modules;
        let module;

        // make queueable
        queue(self);

        // load modules
        for (module in modules) {
            addModule(modules[module]);
        }

        // add class
        $el.classList.add("deck");

        let card;

        // create cards
        for (let i = cards.length; i; i--) {
            card = cards[i - 1] = _card(i - 1);
            card.setSide("back");
            card.mount($el);
        }

        return self;

        function mount(root) {
            // mount deck to root
            $root = root;
            $root.appendChild($el);
        }

        function unmount() {
            // unmount deck from root
            $root.removeChild($el);
        }

        function addModule(module) {
            module.deck && module.deck(self);
        }
    }
    Deck.animationFrames = animationFrames;
    Deck.ease = ease;
    Deck.modules = { dealhand: dealhand, bysuit: bysuit, fan: fan, intro: intro, poker: poker, shuffle: shuffle, sort: sort, flip: flip };
    Deck.Card = _card;
    Deck.prefix = prefix;
    Deck.translate = translate;

    return Deck;
})();


function initializeGame(){
    let $container = document.getElementById("container");
    
    // create Deck
    let deck = Deck();

    // add to DOM
    deck.mount($container);

    let prefix = Deck.prefix;

    let transform = prefix("transform");

    let translate = Deck.translate;

    console.log(deck);
    deck.dealhand();
    deck.flip();
}


