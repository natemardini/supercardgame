$(document).ready(function () {
    findPendingGames();
    $("button#create-new-game").click(createGame);
});

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
        const str = `<tr>
                        <th scope="row">${game._id.slice(-3).toUpperCase()}</th>
                        <td>Goofspiel</td>
                        <td>${game.players[0].playerNo}</td>
                        <td><button>Join!</button></td>
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
            type: 2
        },
        success: addNewGameToList
    });
}

function addNewGameToList(newGame) {
    $("table#pending-game-list > tbody").prepend(parseGames(newGame));
}
