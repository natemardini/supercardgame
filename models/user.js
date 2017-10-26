const Model = require("../db/model");

class User extends Model {

    static create(handle, email, password) {
        const user = new User();
        user.handle = handle;
        user.email = email;
        user.password = password;
        return user;
    }
}

module.exports = User;
