const knexConfig = require("./../knexfile");
const ENV = process.env.ENV || "development";
const knex = require("knex")(knexConfig[ENV]);
const pluralize = require("pluralize");

class Model {

    /**
     * Find a single object from DB
     *
     * @static
     * @param {any} query
     * @memberof Model
     */
    static findOne(query) {
        if (typeof query !== "number" && typeof query !== "object") {
            throw Error("Incorrect input. Only objects or numbers.");
        } else if (typeof query === "number") {
            query = { id: query };
        }

        return knex(this.tableName)
            .first()
            .where(query)
            .then(row => {
                if (row) {
                    return Object.assign(new this(), row);
                } else {
                    return null;
                }
            });
    }

    /**
     * Find all objects meeting query
     *
     * @static
     * @param {any} query
     * @memberof Model
     */
    static findAll(query) {
        return knex(this.tableName)
            .select()
            .where(query)
            .then(rows => {
                if (rows.length > 0) {
                    return rows.map(row => Object.assign(new this(), row));
                } else {
                    return [];
                }
            });
    }

    static get tableName() {
        return pluralize(this.name.toLowerCase());
    }

    static get dbConnection() {
        return knex;
    }

    /**
     * Insert new row in db or updates fields in existing row
     */
    save() {
        if (this.id) {
            return knex(this.constructor.tableName)
                .where("id", this.id)
                .update(this, "id");
        } else {
            return knex(this.constructor.tableName)
                .insert(this, "id")
                .then(id => this.id = id[0]);
        }
    }

    /**
    * Insert new row in db or updates fields in existing row
    */
    fetchDbRow() {
        return knex(this.constructor.tableName)
            .first()
            .where("id", this.id);
    }

    /**
     * Delete the current row from db
     *
     * @memberof Model
     */
    destroy() {
        return knex(this.constructor.tableName)
            .where("id", this.id)
            .limit(1)
            .delete();
    }
}

module.exports = Model;
