const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/asyncwrap.js");
const passport = require("passport");

router.get('/signup', (req, res, next) => {
    res.render('./user/signup.ejs');
});
router.post("/signup", wrapAsync(async(req, res) => {
    try {
        let { username, email, password } = req.body;
        let newuser = new User({ email, username });
        const registereduser = await User.register(newuser, password);
        req.flash("success", "registered successfully");
        return res.redirect('/listings');
    } catch (e) {
        req.flash("error", e.message);
        return res.redirect('/signup')
    };

}));
router.get('/login', (req, res, next) => {
    res.render('./user/login.ejs');
});
router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), wrapAsync(async(req, res) => {
    req.flash("success", "welcome back to wanderlust ");
    return res.redirect("/listings");
}))
module.exports = router;