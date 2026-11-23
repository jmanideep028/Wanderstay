if (process.env.NODE_ENV !== "production") require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user");
const ExpressError = require("./utils/ExpressError");
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

const app = express();
const dbUrl = process.env.ATLAS_DB_URL || "mongodb://127.0.0.1:27017/wanderstay";
const isProd = process.env.NODE_ENV === "production";

mongoose
  .connect(dbUrl)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("DB connection failed:", err));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
if (isProd) app.set("trust proxy", 1);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// reuse the one mongoose connection instead of opening a second TLS connection to Atlas
const clientPromise = mongoose.connection.asPromise().then((c) => c.getClient());
clientPromise.catch(() => {});

const store = MongoStore.create({
  clientPromise,
  touchAfter: 24 * 3600,
});
store.on("error", (e) => console.log("Session store error", e));

app.use(
  session({
    store,
    secret: process.env.SESSION_SECRET || "devsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser((user, done) => {
  done(null, { _id: user._id.toString(), username: user.username });
});
passport.deserializeUser((saved, done) => {
  // sessions saved by an older version of the app are simply treated as logged out
  if (!saved || !saved._id) return done(null, false);
  done(null, saved);
});

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.get("/", (req, res) => res.redirect("/listings"));
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => next(new ExpressError(404, "Page not found")));

app.use((err, req, res, next) => {
  if (err.name === "CastError") err = new ExpressError(404, "That item does not exist");
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error", { statusCode, message });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));
