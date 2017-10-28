require("dotenv").config();

const should = require("chai").should();
const User = require("../../models/users");
const mongoose = require("mongoose");



describe("Model User's", () => {

    beforeEach((done) => {
        if (mongoose.connection.db) return done();
        mongoose.connect(process.env.MONGODB_URI, {
            useMongoClient: true
        }, done);
    });

    const testUser = new User({
        handle: "Johnny",
        email: "john@example.com",
        password: "124",
    });

    it("save() should return the object ID", (done) => {
        testUser.save((err, user) => {
            if (err) throw err;
            user._id.should.be.an("object");
            done();
        });
    });

});

