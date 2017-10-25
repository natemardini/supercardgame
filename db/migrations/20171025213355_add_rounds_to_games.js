
exports.up = function(knex, Promise) {
    Promise.all([
        knex.schema.tabl('games', function(table) {
            table.integer('round').unsigned()
        })
    ])
};

exports.down = function(knex, Promise) {
    Promise.all([
        knex.schema.table('games', function(table) {
            table.dropColumn('round')
        })
    ])
};
