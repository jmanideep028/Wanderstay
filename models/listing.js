const mongoose = require("mongoose");
const Review = require("./review");

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=60";

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  image: {
    url: { type: String, default: DEFAULT_IMG },
    filename: { type: String, default: "" },
  },
  price: { type: Number, required: true, min: 0 },
  location: { type: String, required: true },
  country: { type: String, required: true },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

// remove a listing's reviews when the listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing && listing.reviews.length) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

module.exports = mongoose.model("Listing", listingSchema);
