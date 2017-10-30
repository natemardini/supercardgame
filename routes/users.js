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
    * PUT /api/users
    * Register a new user
    */
    router.get("/login", (req, res) => {
        res.render("users/login");
    });

    /**
    * PUT /api/users
    * Register a new user
    */
    router.put("/login", passport.authenticate("local"), (req, res) => {
        res.redirect("/users/lobby");
    });

    /**
    * DELETE /api/users/[id]
    */
    router.delete("/logout", passport.restricted, (req, res) => {
        req.logout();
        res.send(200);
    });

    /**
    * GET /api/users/[id]
    */
    router.get("/lobby", passport.restricted, (req, res) => {
        req.user.getRanking((err, ranking) => {
            res.render("users/lobby", ranking);
        });
    });

    /**
     * GET /api/users/[id]
     */
    router.get("/:id", (req, res) => {
    });

    /**
     * PATCH /api/users/[id]
     */
    router.patch("/:id", (req, res) => {
        User.findAll({}).then(users => {
            res.json(users);
        });
    }
    );

    return router;
};
