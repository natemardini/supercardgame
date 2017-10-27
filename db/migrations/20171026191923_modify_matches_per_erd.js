
exports.up = function(knex, Promise) {
    return knex.schema.alterTable("matches", (t) => {
        t.dropColumn("name");
        t.integer("score");
        t.integer("team");
        t.boolean("win");
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.alterTable("matches", (t) => {
        t.integer("name");
        t.dropColumn("score");
        t.dropColumn("team");
        t.dropColumn("win");
    });
};
