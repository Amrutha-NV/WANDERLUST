const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/asyncwrap.js");
const ExpressError = require("../utils/expresserror.js")
const { listingSchema, reviewSchema } = require("../schema.js");

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
router.post("/", reviewvalidate, wrapAsync(async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newreview = new Review(req.body.review);
    listing.reviews.push(newreview._id);
    await newreview.save();
    await listing.save();
    res.redirect(`/listings/show/${id}`);
}));
// handling delete request
router.delete("/:reviewid/delete", wrapAsync(async(req, res) => {
    let { id, reviewid } = req.params;
    console.log(id);
    console.log(reviewid);
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
    await Review.findByIdAndDelete(reviewid);
    res.redirect(`/listings/show/${id}`);
}));
module.exports = router;