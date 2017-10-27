
exports.up = function(knex, Promise) {
    return knex.schema.alterTable("games", (t) => {
        t.integer("status").unsigned();
        t.jsonb("turn_sequence");
        t.index("status");
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.alterTable("games", (t) => {
        t.dropColumn("status");
        t.dropColumn("turn_sequence");
    });
};
