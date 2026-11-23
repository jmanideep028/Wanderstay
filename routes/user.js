const express = require("express");
const router = express.Router();
const passport = require("passport");
const ctrl = require("../controllers/users");
const { saveRedirectUrl } = require("../middleware");

router.route("/signup").get(ctrl.renderSignup).post(ctrl.signup);

router
  .route("/login")
  .get(ctrl.renderLogin)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
    ctrl.login
  );

router.get("/logout", ctrl.logout);

module.exports = router;
