const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const ExpressError = require("./utils/ExpressError");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// keep the file in memory first, then send it to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(png|jpe?g|webp)$/.test(file.mimetype)) return cb(null, true);
    cb(new ExpressError(400, "Only PNG, JPG or WEBP images are allowed"));
  },
});

const uploadToCloudinary = (req, res, next) => {
  if (!req.file) return next();
  const stream = cloudinary.uploader.upload_stream({ folder: "wanderstay" }, (err, result) => {
    if (err) return next(err);
    req.file.path = result.secure_url;     // controllers already read these two
    req.file.filename = result.public_id;
    next();
  });
  stream.end(req.file.buffer);
};

module.exports = { cloudinary, upload, uploadToCloudinary };