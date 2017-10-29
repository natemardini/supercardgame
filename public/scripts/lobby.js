$(document).ready(function () {
    findPendingGames();
    findActiveGames();
    $("button#create-new-game").click(createGame);
    $("button#find-random-game").click(findGame);
    $("table#pending-game-list").on("click", ".join-game", joinGame);
});

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
        success: function () {
            $row.hide();
        }
    });
}

function findPendingGames() {
    $.getJSON("/api/games/pending", function (games) {
        $("table#pending-game-list > tbody").html(parsePendingGames(games));
    });
}

function findActiveGames() {
    $.getJSON("/api/games/", function (games) {
        $("table#active-game-list > tbody").html(parseActiveGames(games));
    });
}

function parsePendingGames(data) {
    let table = "";

    if (!Array.isArray(data)) {
        data = [data];
    }

    data.forEach((game) => {

        const creator = game.players[0].userId["handle"] || "Bot";

        const str = `<tr data-game-id="${game._id}">
                        <th scope="row">${game._id.slice(-3).toUpperCase()}</th>
                        <td>Goofspiel</td>
                        <td>${creator}</td>
                        <td><button class="join-game">Join!</button></td>
                    </tr>`;

        table += str;
    });

    return $.parseHTML(table);
}

function parseActiveGames(data) {
    let table = "";

    let { currentPlayer, activeGames } = data;

    if (!Array.isArray(activeGames)) {
        activeGames = [activeGames];
    }

    activeGames.forEach((game) => {

        const creator = game.players[0].userId["handle"] || "Bot";
        const userPlayer = game.players.filter(p => {
            return p.userId === currentPlayer;
        })[0];

        let status = "";

        if (game.status === 1) {
            status = "LFM...";
        } else if (game.status === 2 && userPlayer.atRound > game.round) {
            status = "Waiting...";
        } else if (game.status === 2 && userPlayer.atRound === game.round) {
            status = "<button class='play-game'>Play</button>";
        } else {
            status = "Borked";
        }

        const str = `<tr data-game-id="${game._id}">
                        <th scope="row">${game._id.slice(-3).toUpperCase()}</th>
                        <td>Goofspiel</td>
                        <td>${creator}</td>
                        <td>${status}</td>
                    </tr>`;

        table += str;
    });

    return $.parseHTML(table);
}

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
            console.log(data);
            let gameID = data._id;
            console.log(gameID);
            window.location = `/html?gameID=${gameID}`;
        }
    });
}

function addNewGameToList(newGame) {
    $("table#pending-game-list > tbody").prepend(parsePendingGames(newGame));
}
