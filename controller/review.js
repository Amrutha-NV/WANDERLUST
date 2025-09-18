const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.addReviewtoDatabase = async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newreview = new Review(req.body.review);
    newreview.author = req.user._id;
    listing.reviews.push(newreview._id);
    await newreview.save();
    await listing.save();
    req.flash("success", "review added successfully");
    res.redirect(`/listings/show/${id}`);
}



module.exports.destroyReviews = async(req, res) => {
    let { id, reviewid } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
    await Review.findByIdAndDelete(reviewid);
    req.flash("success", "review deleted successfully");
    res.redirect(`/listings`);
}