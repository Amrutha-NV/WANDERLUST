const Listing = require("../models/listing.js");
const opencage = require('opencage-api-client');
const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;
module.exports.index = async(req, res) => {
    const allListing = await Listing.find({});
    res.render("./listing/index.ejs", { allListing });
}


module.exports.newlistingadd = async(req, res) => {
    console.log(OPENCAGE_API_KEY);
    let geoData = {
        type: "Point",
        coordinates: [0, 0]
    };
    const listing = req.body.listing;

    try {
        const data = await opencage.geocode({ q: listing.location, key: OPENCAGE_API_KEY });
        if (data.status.code === 200 && data.results.length > 0) {
            const place = data.results[0];
            geoData = {
                type: "Point",
                coordinates: [place.geometry.lng, place.geometry.lat]
            };
        } else {
            req.flash("error", "location not found");
            res.redirect('/listings');
        }
    } catch (error) {
        console.error('geocoding api network error:', error);
        const errorcode = error.status ? error.status.code : null;
        if (errorcode === 402) {
            req.flash("error", "hit daily access limit")
        } else {
            req.flash("error", "a service error")
        }
        return res.redirect("/listings");
    }
    ///
    let url = req.file.path;
    let filename = req.file.filename;
    const addListing = new Listing(listing);
    addListing.owner = req.user._id;
    addListing.image = { filename, url };
    addListing.coordinates = geoData;
    console.log(addListing);
    await addListing.save();

    req.flash("success", "New listing Added");
    res.redirect('/listings');

}


module.exports.viewIndivisualListing = async(req, res) => {
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
}


module.exports.editForm = async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let listingUrl = listing.image.url;

    if (!listing) {
        req.flash("error", "the listing you are trying to find does not exist or as been deleted! ");
        return res.redirect("/listings");
    }
    listingUrl = listingUrl.replace("/upload", "/upload/w_250");
    res.render('./listing/edit.ejs', { listing, listingUrl });

}

module.exports.upadteEidtForm = async(req, res, next) => {
    if (!req.body.listing) {
        next(new ExpressError(400, "Required information missing!"));
    }
    let { id } = req.params;
    let listing = req.body.listing;
    if (!listing) {
        req.flash("error", "the listing you are trying to find does not exist or as been deleted! ");
        return res.redirect("/listings");
    }
    let updatedlisting = await Listing.findByIdAndUpdate(id, listing);
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        updatedlisting.image = { filename, url };
        await updatedlisting.save();
    }


    req.flash("success", "listing has been edited successfully");
    res.redirect(`/listings`);
}

module.exports.destroy = async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "listing has been deleted");
    res.redirect("/listings");
}