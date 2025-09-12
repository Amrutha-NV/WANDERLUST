const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require('method-override');
const { title } = require("process");
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/expresserror.js")
const listings = require('./routes/listing.js');
const reviews = require('./routes/review.js');



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
//using router
app.use('/listings', listings);
app.use('/listings/:id/reviews', reviews);



// page not found using express error handling
app.all('*id', (req, res, next) => {
    next(new ExpressError(400, "page not found!"));
});

// error  handling middleware
app.use((err, req, res, next) => {
    let { statuscode = 500, message = "something wrong in database!" } = err;
    res.render("./listing/error.ejs", { statuscode, err });
});
// setting up localserver at 8080
app.listen(port, (req, res) => {
    console.log(`listening at port ${port}`);
});