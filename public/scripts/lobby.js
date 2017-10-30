$(document).ready(function () {
    findPendingGames();
    findActiveGames();
    $("button#create-new-game").click(createGame);
    $("button#find-random-game").click(findGame);
    $("table#pending-game-list").on("click", ".join-game", joinGame);
    $("table#active-game-list").on("click", ".play-game", playGame);
});

/**
 * Connects a player to the game that from the active games list
 */
function playGame(e) {
    e.stopPropagation();
    e.preventDefault();

    const $row = $(this).closest("tr");
    const gameId = $row.data("game-id");

    $row.hide();
    window.location = `/game/show?gameID=${gameId}`;
}



/**
 * Send ajax request to join a particular game
 */
function joinGame(e) {
    e.stopPropagation();
    e.preventDefault();

    const $row = $(this).closest("tr");
    const gameId = $row.data("game-id");

    $.ajax({
        url: "/api/games/join",
        method: "PUT",
        data: {
            id: gameId
        },
        success: function (data) {
            alert("Game found!");
            window.location = `/game/show?gameID=${gameId}`;
            $row.hide();
        }
    });
}

/**
 * Send ajax request to grab current pending games data and populates
 * corresponding table
 */
function findPendingGames() {
    $.getJSON("/api/games/pending", function (games) {
        $("table#pending-game-list > tbody").html(parsePendingGames(games));
    });
}

/**
 * Send ajax request to grab current active games data and populates
 * corresponding table
 */
function findActiveGames() {
    $.getJSON("/api/games/", function (games) {
        $("table#active-game-list > tbody").html(parseActiveGames(games));
    });
}

/**
 * Create DOM element of pending game JSON data
 *
 * @param {json} data
 * @returns {Node}
 */
function parsePendingGames(data) {
    let table = "";

    let { user, games } = data;

    if (!Array.isArray(games)) {
        games = [games];
    }


    games.forEach((game) => {


        const ownGame = game.players[0].userId._id === user;
        const creator = game.players[0].userId["handle"] || "Bot";

        let str = `<tr data-game-id="${game._id}">
                        <th scope="row">${game._id.slice(-3).toUpperCase()}</th>
                        <td>Goofspiel</td>
                        <td>${creator}</td>`;

        if (!ownGame) {
            str += `<td><button class="join-game btn btn-outline-dark btn-sm">Join!</button></td>
                    </tr>`;
        } else {
            str += `<td>Waiting</td>
                    </tr>`;
        }


        table += str;
    });

    return $.parseHTML(table);
}

/**
 * Create DOM element of the JSON active game data
 *
 * @param {json} data
 * @returns {Node}
 */
function parseActiveGames(data) {
    let table = "";

    let { currentPlayer, activeGames } = data;

    if (!Array.isArray(activeGames)) {
        activeGames = [activeGames];
    }

    activeGames.forEach((game) => {

        const userPlayer = game.players.filter(p => {
            return p.userId._id === currentPlayer;
        })[0];

        let opponent = game.players.filter(p => {
            return p.userId._id !== currentPlayer;
        })[0];

        opponent = (opponent && opponent.userId.handle) || "";

        let status = "";

        if (game.status === 1) {
            status = "LFM...";
        } else if (game.status === 2 && userPlayer.atRound > game.round) {
            status = "Waiting...";
        } else if (game.status === 2 && userPlayer.atRound === game.round) {
            status = "<button class='play-game btn btn-outline-success btn-sm'>Play</button>";
        } else {
            status = "Borked";
        }

        const str = `<tr data-game-id="${game._id}">
                        <th scope="row">${game._id.slice(-3).toUpperCase()}</th>
                        <td>Goofspiel</td>
                        <td>${opponent}</td>
                        <td>${status}</td>
                    </tr>`;

        table += str;
    });

    return $.parseHTML(table);
}

/**
 * Send ajax request to create a new game
 *
 */
function createGame(e) {
    e.stopPropagation();

    $.ajax({
        url: "/api/games/",
        method: "PUT",
        data: {
            type: 1
        },
        success: addNewGameToList
    });
}

/**
 * Send ajax request to be matched with a user (non-specific game matching)
 *
 */
function findGame(e) {
    e.stopPropagation();

    $.ajax({
        url: "/api/games/match",
        method: "PUT",
        data: {
            type: 1
        },
        success: function (data) {
            alert("Game found!");
            let gameID = data._id;
            window.location = `/game/show?gameID=${gameID}`;
        }
    });
}

/**
 * Adds new pending game list to the table
 *
 * @param {any} newGame
 */
function addNewGameToList(newGame) {
    $("table#pending-game-list > tbody").prepend(parsePendingGames(newGame));
}
