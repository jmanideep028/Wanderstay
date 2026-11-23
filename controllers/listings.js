const Listing = require("../models/listing");
const { cloudinary } = require("../cloudConfig");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports.index = async (req, res) => {
  const q = (req.query.q || "").trim();
  let filter = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter = { $or: [{ title: rx }, { location: rx }, { country: rx }] };
  }
 const listings = await Listing.find(filter).sort({ _id: -1 }).lean();
  res.render("listings/index", { listings, q });
};

module.exports.renderNewForm = (req, res) => res.render("listings/new");

module.exports.showListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "That listing no longer exists.");
    return res.redirect("/listings");
  }
  const count = listing.reviews.length;
  const avg = count ? listing.reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  res.render("listings/show", { listing, avg, count });
};

module.exports.createListing = async (req, res) => {
  const listing = new Listing(req.body.listing);
  listing.owner = req.user._id;
  if (req.file) listing.image = { url: req.file.path, filename: req.file.filename };
  await listing.save();
  req.flash("success", "New listing created!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.renderEditForm = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "That listing no longer exists.");
    return res.redirect("/listings");
  }
  const preview = listing.image.url.replace("/upload", "/upload/w_250");
  res.render("listings/edit", { listing, preview });
};

module.exports.updateListing = async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(req.params.id, { ...req.body.listing }, { new: true });
  if (req.file) {
    if (listing.image.filename) await cloudinary.uploader.destroy(listing.image.filename);
    listing.image = { url: req.file.path, filename: req.file.filename };
    await listing.save();
  }
  req.flash("success", "Listing updated.");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyListing = async (req, res) => {
  const listing = await Listing.findByIdAndDelete(req.params.id);
  if (listing && listing.image.filename) await cloudinary.uploader.destroy(listing.image.filename);
  req.flash("success", "Listing deleted.");
  res.redirect("/listings");
};
