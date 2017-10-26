const should = require("chai").should();
const User = require("../../models/user");

describe("Model User's", () => {

    const testUser = User.create("test", "test@example.com", "123");

    it("save() should return the object ID", (done) => {
        testUser.save().then(() => {
            testUser.id.should.be.a("number");
            done();
        });
    });

    it("findOne() should return a valid object", (done) => {
        User.findOne(testUser.id).then(user => {
            user.should.be.an.instanceOf(User);
            user.should.be.an("object");
            user.handle.should.be.a("string");
            done();
        });
    });

    it("save() on same User should return the same object ID", (done) => {
        testUser.handle = "bob";
        const currentId = testUser.id;
        testUser.save()
            .then(() => testUser.fetchDbRow())
            .then(dbUser => {
                dbUser.id.should.equal(currentId);
                dbUser.handle.should.equal("bob");
                done();
            });
    });

    it("findAll() should return a result object", (done) => {
        User.findAll({}).then(result => {
            result.should.be.an("array");
            result[0].should.be.an.instanceOf(User);
            result[0].handle.should.be.a("string");
            done();
        });
    });

    it("matches() should return an array of matches", (done) => {
        testUser.matches.then(result => {
            result.should.be.an("array");
            done();
        });
    });

    it("games() should return an array of games", (done) => {
        testUser.games.then(result => {
            result.should.be.an("array");
            done();
        });
    });

    it("destroy() should delete the object", (done) => {
        testUser.destroy().then(result => {
            result.should.equal(1);
            done();
        });
    });

    after((done) => {
        process.exit();
        done();
    });
});
