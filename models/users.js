const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    handle:      String,
    email:       String,
    ranking:     { type: Number, default: 1000 },
    password:    String,
    activeGames: [{ type: Schema.Types.ObjectId, ref: "Game" }],
    pastGames:   [{ type: Schema.Types.ObjectId, ref: "Game" }]
});

userSchema.pre("save", function (next) {
    if (this.isNew) {
        bcrypt.hash(this.password, 10).then((digest) => {
            this.password = digest;
            next();
        });
    } else {
        next();
    }
});

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("User", userSchema);


