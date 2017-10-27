const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    handle:      String,
    email:       String,
    password:    String,
    activeGames: [{ type: Schema.Types.ObjectId, ref: "Game" }],
    pastGames:   [{ type: Schema.Types.ObjectId, ref: "Game" }]
});

module.exports = mongoose.model("User", userSchema);
