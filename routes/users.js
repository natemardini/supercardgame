"use strict";

const router = require("express").Router();
const User = require("../models/users");

module.exports = (passport) => {
    /**
     * GET /users
     */
    router.get("/", (req, res) => {

        res.send("Bad!");

    });

    router.get("/register", (req, res) => {
        res.render("users/register");
    });

    /**
     * PUT /api/users
     * Register a new user
     */
    router.put("/", (req, res) => {
        const { handle, email, password } = req.body;
        const user = new User({ handle, email, password });

        user.save().then(() => {
            req.login(user, () => res.redirect("users/"));
        }).catch(err => res.status(500).json(err));
    });

    /**
    * GET /api/users/[id]
    */
    router.get("/lobby", passport.auth, (req, res) => {
        res.send("Works");
    });

    /**
     * GET /api/users/[id]
     */
    router.get("/:id", (req, res) => {
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
