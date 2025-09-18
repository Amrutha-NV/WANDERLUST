const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/asyncwrap.js");
const passport = require("passport");
const { originalurl } = require("../middelware.js");
const usercontroller = require("../controller/user.js");


router.get('/signup', (req, res, next) => {
    res.render('./user/signup.ejs');
});
router.post("/signup", wrapAsync(usercontroller.signup));

router.get('/login', (req, res, next) => {
    res.render('./user/login.ejs');
});
router.post('/login', originalurl, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), wrapAsync(usercontroller.login));
router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash("success", "Logged out")
        return res.redirect('/login');
    });
})
module.exports = router;