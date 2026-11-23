const User = require("../models/user");

module.exports.renderSignup = (req, res) => res.render("users/signup");

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.register(new User({ username, email }), password);
    req.login(user, (err) => {
      if (err) return next(err);
      req.flash("success", `Welcome to Wanderstay, ${user.username}!`);
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.code === 11000 ? "That email is already registered." : e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLogin = (req, res) => res.render("users/login");

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  const url = res.locals.redirectUrl || "/listings";
  res.redirect(url);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out.");
    res.redirect("/listings");
  });
};
