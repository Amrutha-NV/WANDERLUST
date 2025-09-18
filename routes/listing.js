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
const listingcontroller = require("../controller/listing.js");

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
router.get("/", wrapAsync(listingcontroller.index));

//setting up the route to render a new form to add listing
router.get("/create", checkUserloggedIn, (req, res) => {
    res.render("./listing/create.ejs");
});
//handling post request to add new listings to database
router.post('/add', validate, wrapAsync(listingcontroller.newlistingadd));
//setting route to view indivisual listing
router.get("/show/:id", wrapAsync(listingcontroller.viewIndivisualListing));
//setting the route for edit request
router.get("/:id/edit", isOwner, checkUserloggedIn, wrapAsync(listingcontroller.editForm));
//upadting the edit request into database
router.put("/edit/:id", isOwner, validate, wrapAsync(listingcontroller.upadteEidtForm));
//setting route for delete request
router.delete("/:id/delete", isOwner, checkUserloggedIn, wrapAsync(listingcontroller.destroy));
module.exports = router;