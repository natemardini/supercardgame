"use strict";

const router = require("express").Router();
const User   = require("../models/users");

module.exports = (passport) => {

    /**
     * GET /users
     * if Auth'ed, redirect to lobby
     */
    router.get("/", passport.restricted, (req, res) => {
        res.redirect("/users/lobby");
    });

    /**
     * GET /users/register
     */
    router.get("/register", (req, res) => {
        res.render("users/register");
    });

    /**
     * PUT /users
     * Register a new user
     */
    router.put("/", (req, res) => {
        const { handle, email, password } = req.body;
        const user = new User({ handle, email, password });

        user.save().then(() => {
            req.login(user, () => res.redirect("users/lobby"));
        }).catch(err => res.status(500).json(err));
    });

    /**
    * GET /users/login
    * Fetch login page
    */
    router.get("/login", (req, res) => {
        res.render("users/login");
    });

    /**
    * PUT /users/login
    * Login the user to new session, using PassportJS middleware
    */
    router.put("/login", passport.authenticate("local", {
        successRedirect: "/users/lobby",
        failureRedirect: "/users/login"
    }));

    /**
    * DELETE /users/logout
    * End the user session
    */
    router.delete("/logout", passport.restricted, (req, res) => {
        req.logout();
        res.send(200);
    });

    /**
    * GET /users/lobby
    * Go to the user's lobby page
    */
    router.get("/lobby", passport.restricted, (req, res) => {
        req.user.getRanking((err, ranking) => {
            res.render("users/lobby", ranking);
        });
    });

    /**
    * GET /users/history
    * Go to the user's match history page
    */
    router.get("/history", passport.restricted, (req, res) => {
        req.user.getHistory((err, ranking) => {
            res.render("users/history", { ranking });
        });
    });

    return router;
};
