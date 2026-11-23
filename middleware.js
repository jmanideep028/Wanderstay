const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema } = require("./schema");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "Please log in first.");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) res.locals.redirectUrl = req.session.redirectUrl;
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "Only the owner can do that.");
    return res.redirect(`/listings/${req.params.id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    req.flash("error", "Review not found.");
    return res.redirect(`/listings/${req.params.id}`);
  }
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You can only delete your own reviews.");
    return res.redirect(`/listings/${req.params.id}`);
  }
  next();
};

const check = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressError(400, msg);
  }
  next();
};
module.exports.validateListing = check(listingSchema);
module.exports.validateReview = check(reviewSchema);
