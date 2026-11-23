const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const ctrl = require("../controllers/listings");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const { upload, uploadToCloudinary } = require("../cloudConfig");

router
  .route("/")
  .get(wrapAsync(ctrl.index))
  .post(isLoggedIn, upload.single("listing[image]"), validateListing, uploadToCloudinary, wrapAsync(ctrl.createListing));

router.get("/new", isLoggedIn, ctrl.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(ctrl.showListing))
  .put(isLoggedIn, wrapAsync(isOwner), upload.single("listing[image]"), validateListing, uploadToCloudinary, wrapAsync(ctrl.updateListing))
  .delete(isLoggedIn, wrapAsync(isOwner), wrapAsync(ctrl.destroyListing));

router.get("/:id/edit", isLoggedIn, wrapAsync(isOwner), wrapAsync(ctrl.renderEditForm));

module.exports = router;