const Model = require("../db/model");

class User extends Model {
    constructor(handle, email, password) {
        super();
        this.handle = handle;
        this.email = email;
        this.password = password;
        return this;
    }
}

module.exports = User;
