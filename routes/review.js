const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const ctrl = require("../controllers/reviews");
const { isLoggedIn, isReviewAuthor, validateReview } = require("../middleware");

router.post("/", isLoggedIn, validateReview, wrapAsync(ctrl.createReview));
router.delete("/:reviewId", isLoggedIn, wrapAsync(isReviewAuthor), wrapAsync(ctrl.destroyReview));

module.exports = router;
