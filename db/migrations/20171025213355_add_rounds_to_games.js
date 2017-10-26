
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.alterTable("games", function(table) {
            table.integer("round").unsigned().defaultTo(1);
            table.dropIndex("id");
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.alterTable("games", function(table) {
            table.dropColumn("round");
            table.index("id");
        })
    ]);
};
