const mongoose = require('mongoose');
const Review = require("./review.js");
const User = require("./user.js");
const { number, required } = require('joi');
main().then(() => { console.log("connnection made successsfully"); })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}


const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        requried: true,
    },
    description: {
        type: String,
    },
    image: {
        filename: String,
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
            set: (v) =>
                v === "" ?
                "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60" : v
        }
    },
    price: {
        type: Number,
    },
    location: {
        type: String,
    },
    country: {
        type: String,
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
    }, ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    coordinates: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true },
    }
});
listingSchema.index({ coordinates: "2dsphere" });
//post mongoose middleware triggered when findbyidanddelete is triggered for listing post that action this middleware is activated

listingSchema.post("findOneAndDelete", async(listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } })
    };

});
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;