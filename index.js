const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const methodOverride = require('method-override');
const { title } = require("process");
const ejsMate = require('ejs-mate');
const Listing = require("./models/listing.js");



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

const mongoose = require('mongoose');

main().then(() => { console.log("connnection made successsfully"); })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

//setting index route
app.get("/", async(req, res) => {
    const allListing = await Listing.find({});
    res.render("./listing/index.ejs", { allListing });
});
//setting up the roite to render a new form to add listing
app.get("/listing/create", (req, res) => {
    res.render("./listing/create.ejs");
});
//handling post request to add new listings to database
app.post('/listings', async(req, res) => {
    let listing = req.body.listing;
    console.log(listing);
    const addListing = new Listing(listing);
    await addListing.save();
    res.redirect('/');

});
//setting route to view indivisual listing
app.get("/show/:id", async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render('./listing/form.ejs', { listing });
});
//setting the route for edit request
app.get("/listings/:id/edit", async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render('./listing/edit.ejs', { listing })
});
//upadting the edit request into database
app.put("/listings/edit/:id", async(req, res) => {
    let { id } = req.params;
    let listing = req.body.listing;
    console.log(listing);
    await Listing.findByIdAndUpdate(id, listing);
    res.redirect(`/`);
});
//setting route for delete request
app.delete("/listings/:id/delete", async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/");
});
// setting up localserver at 8080
app.listen(port, (req, res) => {
    console.log(`listening at port ${port}`);
});