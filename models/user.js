const Model = require("../db/model");
const bcrypt = require("bcryptjs");

class User extends Model {

    static create(handle, email, password) {
        const user    = new User();
        user.handle   = handle;
        user.email    = email;
        user.password = bcrypt.hashSync(password, 10);
        return user;
    }

    validPassword(password) {
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = User;
