$(document).ready(function () {
    findPendingGames();
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
        $("table#pending-game-list > tbody").html(parseGames(games));
    });
}

function parseGames(data) {
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
            console.log(data);
        }
    });
}

function addNewGameToList(newGame) {
    $("table#pending-game-list > tbody").prepend(parseGames(newGame));
}
