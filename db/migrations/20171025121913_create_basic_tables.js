
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTableIfNotExists("users", function (table) {
            table.increments();
            table.string("handle");
            table.string("email");
            table.string("password");
            table.timestamps(true, true);
        }),
        knex.schema.createTableIfNotExists("games", function (table) {
            table.increments();
            table.integer("game_type").unsigned();
            table.jsonb("deck");
            table.timestamps(true, true);
            table.index("id");
        }),
        knex.schema.createTableIfNotExists("matches", function (table) {
            table.increments();
            table.integer("name");
            table.integer("user_id").unsigned().references("users.id").onDelete("cascade");
            table.integer("game_id").unsigned().references("games.id").onDelete("cascade");
            table.timestamps(true, true);
        }),
        knex.schema.createTableIfNotExists("cards", function (table) {
            table.increments();
            table.integer("suit");
            table.integer("rank");
            table.string("frontside");
        }),
        knex.schema.table("games", function (table) {
            table.integer("current_turn").unsigned().references("matches.id");
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.raw("DROP TABLE users CASCADE"),
        knex.raw("DROP TABLE games CASCADE"),
        knex.raw("DROP TABLE matches CASCADE"),
        knex.raw("DROP TABLE cards CASCADE")
    ]);
};
