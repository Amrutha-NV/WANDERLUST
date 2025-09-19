if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}



const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require('method-override');
const { title } = require("process");
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/expresserror.js")
const listings = require('./routes/listing.js');
const reviewrouter = require('./routes/review.js');
const userrouter = require('./routes/user.js');
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.json());

const mongoose = require('mongoose');



main().then(() => { console.log("connnection to database made successsfully"); })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}
const sessionOptions = {
    secret: "supersecrete",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.curruser = req.user;
    next();
});




//using router
app.use('/', userrouter);
app.use('/listings', listings);
app.use('/listings/:id/reviews', reviewrouter);



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