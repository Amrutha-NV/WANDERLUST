const User = require("../models/user.js");

module.exports.signup = async(req, res) => {
    try {
        let { username, email, password } = req.body;
        let newuser = new User({ email, username });
        const registereduser = await User.register(newuser, password);

        req.login(registereduser, function(err) {
            req.flash("success", "registered successfully");
            if (err) { return next(err); }
            return res.redirect('/listings');
        });
    } catch (e) {
        req.flash("error", e.message);
        return res.redirect('/signup')
    };

}



module.exports.login = async(req, res) => {
    req.flash("success", "welcome back to wanderlust ");
    let url = res.locals.redirect || '/listings';
    return res.redirect(url);
}