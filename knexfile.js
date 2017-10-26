require("dotenv").config();

module.exports = {

    development: {
        client: "pg",
        connection: `${process.env.DATABASE_URL}?ssl=true`,
        migrations: {
            directory: "./db/migrations",
            tableName: "migrations"
        },
        seeds: {
            directory: "./db/seeds"
        },
        debug: false
    },

    production: {
        client: "pg",
        connection: `${process.env.DATABASE_URL}?ssl=true`,
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: "migrations"
        }
    }

};
