const Listing = require("./models/listing");
const Review = require("./models/review");
const checkUserloggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you are not logged in");
        return res.redirect("/login");
    }
    next();
}

const originalurl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirect = req.session.redirectUrl;
    }
    next();
}
const isOwner = async(req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!req.user || !req.user._id.equals(listing.owner._id)) {
        req.flash("error", "you are not the owner of this listing");
        return res.redirect("/listings");
    }
    next();
}
const isAuthor = async(req, res, next) => {
    let { id, reviewid } = req.params;
    let review = await Review.findById(reviewid);
    if (!req.user || !req.user._id.equals(review.author._id)) {
        req.flash("error", "you are not the owner of this listing");
        return res.redirect(`/listings/show/${id}`);
    }
    next();
}
module.exports = { checkUserloggedIn, originalurl, isOwner, isAuthor };