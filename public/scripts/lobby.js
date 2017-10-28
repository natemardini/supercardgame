$(document).ready(function () {
    findPendingGames();
});

function findPendingGames() {
    $.getJSON("/api/games/pending", function (games) {
        updateGameList(games);
    });
}

function updateGameList(data) {
    let table = "";

    data.forEach((game) => {
        const str = `<tr>
                        <th scope="row">${game._id.slice(-3).toUpperCase()}</th>
                        <td>Goofspiel</td>
                        <td>${game.players[0].playerNo}</td>
                        <td><button>Join!</button></td>
                    </tr>`;

        table += str;
    });

    const node = $.parseHTML(table);

    $("table#pending-game-list").html(node);
}
