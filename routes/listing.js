const express = require("express");
const app = express();
const path = require("path");

const methodOverride = require('method-override');
const { title } = require("process");
const router = express.Router();
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/asyncwrap.js");
const ExpressError = require("../utils/expresserror.js")
const { listingSchema, reviewSchema } = require("../schema.js");
const { checkUserloggedIn, isOwner } = require("../middelware.js");

router.use(express.urlencoded({ extended: true }));

const validate = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let erMsg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(400, erMsg);
    } else {
        next();
    }
};

//setting index route
router.get("/", wrapAsync(async(req, res) => {
    const allListing = await Listing.find({});
    res.render("./listing/index.ejs", { allListing });
}));
//setting up the route to render a new form to add listing
router.get("/create", checkUserloggedIn, (req, res) => {
    res.render("./listing/create.ejs");
});
//handling post request to add new listings to database
router.post('/add', validate, wrapAsync(async(req, res) => {
    let listing = req.body.listing;
    const addListing = new Listing(listing);
    addListing.owner = req.user._id;
    await addListing.save();
    req.flash("success", "New listing Added");
    res.redirect('/listings');

}));
//setting route to view indivisual listing
router.get("/show/:id", wrapAsync(async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
        .populate({
            path: 'reviews',
            populate: { path: "author", },
        })
        .populate('owner');
    if (!listing) {
        req.flash("error", "the listing you are trying to find does not exist");
        return res.redirect("/listings");
    }
    res.render('./listing/form.ejs', { listing });
}));
//setting the route for edit request
router.get("/:id/edit", isOwner, checkUserloggedIn, wrapAsync(async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "the listing you are trying to find does not exist or as been deleted! ");
        return res.redirect("/listings");
    }
    res.render('./listing/edit.ejs', { listing })
}));
//upadting the edit request into database
router.put("/edit/:id", isOwner, validate, wrapAsync(async(req, res, next) => {
    if (!req.body.listing) {
        next(new ExpressError(400, "Required information missing!"));
    }
    let { id } = req.params;
    let listing = req.body.listing;
    if (!listing) {
        req.flash("error", "the listing you are trying to find does not exist or as been deleted! ");
        return res.redirect("/listings");
    }
    await Listing.findByIdAndUpdate(id, listing);
    req.flash("success", "listing has been edited successfully");
    res.redirect(`/listings`);
}));
//setting route for delete request
router.delete("/:id/delete", isOwner, checkUserloggedIn, wrapAsync(async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "listing has been deleted");
    res.redirect("/listings");
}));
module.exports = router;