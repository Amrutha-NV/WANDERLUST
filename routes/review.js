const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/asyncwrap.js");
const ExpressError = require("../utils/expresserror.js")
const { listingSchema, reviewSchema } = require("../schema.js");
const { checkUserloggedIn, isOwner, isAuthor } = require("../middelware.js");
const reviewcontroller = require("../controller/review.js");

const reviewvalidate = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
}

// review model
// handling post request from reviews
router.post("/", checkUserloggedIn, reviewvalidate, wrapAsync(reviewcontroller.addReviewtoDatabase));
// handling delete request
router.delete("/:reviewid/delete", checkUserloggedIn, isAuthor, wrapAsync(reviewcontroller.destroyReviews));
module.exports = router;