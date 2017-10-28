"use strict";

const router = require("express").Router();
const User = require("../models/user");

module.exports = (passport) => {
    /**
     * GET /users
     */
    router.get("/", (req, res) => {

    });

    router.get("/register", (req, res) => {
        res.render("users/register");
    });

    /**
     * PUT /api/users
     */
    router.put("/", (req, res) => {

    });

    /**
     * GET /api/users/[id]
     */
    router.get("/:id", (req, res) => {
        User.findAll({}).then(users => {
            res.json(users);
        });
    });

    /**
     * PATCH /api/users/[id]
     */
    router.patch("/:id",
        passport.authenticate("local"),
        (req, res) => {
            User.findAll({}).then(users => {
                res.json(users);
            });
        }
    );

    /**
     * DELETE /api/users/[id]
     */
    router.delete("/",
        passport.authenticate("local"),
        (req, res) => {

        }
    );

    return router;
};
