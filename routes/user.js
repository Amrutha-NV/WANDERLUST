const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/asyncwrap.js");
const passport = require("passport");
const { originalurl } = require("../middelware.js");
const usercontroller = require("../controller/user.js");

// signup routes
router.route('/signup')
    .get((req, res, next) => {
        res.render('./user/signup.ejs');
    })
    .post(wrapAsync(usercontroller.signup));

//login routes
router.route('/login')
    .get((req, res, next) => {
        res.render('./user/login.ejs');
    })
    .post(originalurl, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), wrapAsync(usercontroller.login));
//logout routes
router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash("success", "Logged out")
        return res.redirect('/login');
    });
})
module.exports = router;