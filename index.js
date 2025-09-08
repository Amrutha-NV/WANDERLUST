const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const methodOverride = require('method-override');
const { title } = require("process");
const ejsMate = require('ejs-mate');
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const wrapAsync = require("./utils/asyncwrap.js");
const ExpressError = require("./utils/expresserror.js")
const { listingSchema } = require("./schema.js");
const { reviewSchema } = require("./schema.js");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.json());

const mongoose = require('mongoose');

main().then(() => { console.log("connnection made successsfully"); })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const validate = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
}
const reviewvalidate = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
}

//setting index route
app.get("/", wrapAsync(async(req, res) => {
    const allListing = await Listing.find({});
    res.render("./listing/index.ejs", { allListing });
}));
//setting up the route to render a new form to add listing
app.get("/listing/create", (req, res) => {
    res.render("./listing/create.ejs");
});
//handling post request to add new listings to database
app.post('/listings', validate, wrapAsync(async(req, res) => {
    let listing = req.body.listing;
    const addListing = new Listing(listing);
    await addListing.save();
    res.redirect('/');

}));
//setting route to view indivisual listing
app.get("/show/:id", wrapAsync(async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate('reviews');
    res.render('./listing/form.ejs', { listing });
}));
//setting the route for edit request
app.get("/listings/:id/edit", wrapAsync(async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render('./listing/edit.ejs', { listing })
}));
//upadting the edit request into database
app.put("/listings/edit/:id", validate, wrapAsync(async(req, res, next) => {
    if (!req.body.listing) {
        next(new ExpressError(400, "Required information missing!"));
    }
    let { id } = req.params;
    let listing = req.body.listing;
    console.log(listing);
    await Listing.findByIdAndUpdate(id, listing);
    res.redirect(`/`);
}));
//setting route for delete request
app.delete("/listings/:id/delete", wrapAsync(async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/");
}));
// review model
// handling post request from reviews
app.post("/listings/:id/reviews", reviewvalidate, wrapAsync(async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newreview = new Review(req.body.review);
    listing.reviews.push(newreview._id);
    await newreview.save();
    await listing.save();
    res.redirect(`/show/${id}`);
}));
// handling delete request
app.delete("/listings/:id/reviews/:reviewid/delete", wrapAsync(async(req, res) => {
    let { id, reviewid } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
    await Review.findByIdAndDelete(reviewid);
    res.redirect(`/show/${id}`);
}))

// page not found using express error handling
app.all('*id', (req, res, next) => {
    next(new ExpressError(400, "page not found!"));
})

// error  handling middleware
app.use((err, req, res, next) => {
    let { statuscode = 500, message = "something wrong in database!" } = err;
    res.render("./listing/error.ejs", { statuscode, err });
});
// setting up localserver at 8080
app.listen(port, (req, res) => {
    console.log(`listening at port ${port}`);
});