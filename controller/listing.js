const Listing = require("../models/listing.js");
module.exports.index = async(req, res) => {
    const allListing = await Listing.find({});
    res.render("./listing/index.ejs", { allListing });
}


module.exports.newlistingadd = async(req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    let listing = req.body.listing;
    const addListing = new Listing(listing);
    addListing.owner = req.user._id;
    addListing.image = { filename, url };
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
    let listingUrl=listing.image.url;
   
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