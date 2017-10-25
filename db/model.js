const { knex } = require("./../server");
const pluralize = require("pluralize");

class Model {

    /**
     * Creates an instance of Model.
     * @memberof Model
     */
    constructor() {
    }

    /**
     * Find a single object from DB
     *
     * @static
     * @param {any} query
     * @memberof Model
     */
    static findOne(query) {
        if (typeof query === "object" || typeof query === "number") {
            return this.findAll(query).limit(1).then(arr => arr[0]);
        } else {
            throw Error("Incorrect input. Only objects or numbers.");
        }
    }

    /**
     * Find all objects meeting query
     *
     * @static
     * @param {any} query
     * @memberof Model
     */
    static findAll(query) {
        if (typeof query === "object") {
            return knex(this.tableName)
                .select()
                .where(query);
        } else if (typeof query === "number") {
            return knex(this.tableName)
                .select()
                .where("id", query);
        } else {
            throw Error("Incorrect input. Only objects or numbers.");
        }
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
            .select()
            .where("id", this.id)
            .limit(1)
            .then(arr => arr[0]);
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
