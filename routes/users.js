"use strict";

const router = require("express").Router();
const User = require("../models/user");

router.get("/", (req, res) => {
    User.findAll({}).then(users => {
        res.json(users);
    });
});

module.exports = router;
