// Seeds a demo user and a few listings. Run with: npm run seed
// Seeds a demo host and demo listings WITHOUT touching anyone else's data.
//   npm run seed        -> adds any missing demo listings (safe to run many times)
//   npm run seed:reset  -> removes only the demo host's listings, then re-adds them
require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const User = require("../models/user");

const img = (id) => ({ url: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=60`, filename: "" });

const data = [
  { title: "Beachside Cottage in Goa", description: "Wake up to waves, 2 minutes from the sand.", price: 4500, location: "Candolim, Goa", country: "India", image: img("photo-1499793983690-e29da59ef1c2") },
  { title: "Himalayan Pine Cabin", description: "Warm wooden cabin with a valley view and fireplace.", price: 3800, location: "Manali", country: "India", image: img("photo-1449158743715-0a90ebb6d2d8") },
  { title: "Lakeview Villa", description: "Private villa with a deck over the lake.", price: 9200, location: "Udaipur, Rajasthan", country: "India", image: img("photo-1564013799919-ab600027ffc6") },
  { title: "City Loft Downtown", description: "Bright loft close to cafes, metro and nightlife.", price: 5600, location: "New York", country: "United States", image: img("photo-1502672260266-1c1ef2d93688") },
  { title: "Tuscan Farmhouse", description: "Olive groves, a pool and slow mornings.", price: 12000, location: "Siena", country: "Italy", image: img("photo-1470770841072-f978cf4d019e") },
];

(async () => {
  await mongoose.connect(process.env.ATLAS_DB_URL || "mongodb://127.0.0.1:27017/wanderstay");

  let host = await User.findOne({ username: "demohost" });
  if (!host) {
    host = await User.register(new User({ username: "demohost", email: "demo@example.com" }), "demo1234");
    console.log("Created demo user demohost / demo1234");
  }

  if (process.argv.includes("--reset")) {
    const old = await Listing.find({ owner: host._id });
    for (const l of old) await Listing.findByIdAndDelete(l._id); // also removes their reviews
    console.log(`Removed ${old.length} demo listing(s)`);
  }

  const have = await Listing.find({ owner: host._id }).distinct("title");
  const fresh = data.filter((d) => !have.includes(d.title));
  if (fresh.length) await Listing.insertMany(fresh.map((d) => ({ ...d, owner: host._id })));

  console.log(`Added ${fresh.length} demo listing(s). Listings from other users were not touched.`);
  console.log("Demo login -> demohost / demo1234");
  await mongoose.disconnect();
})();
