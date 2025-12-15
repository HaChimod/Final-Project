const express = require("express");
const router = express.Router();
const Photo = require("../db/photoModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure /images exists
const imageDir = path.join(__dirname, "..", "images");
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir);

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imageDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "_" + Math.floor(Math.random() * 999999);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

// POST /api/photo/new
router.post("/new", upload.single("photo"), async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).send({ message: "Unauthorized: Please login" });
    }

    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded" });
    }

    const newPhoto = new Photo({
      file_name: req.file.filename,
      user_id: req.session.userId,
      date_time: new Date(),
      comments: [],
    });

    await newPhoto.save();
    res.status(201).send(newPhoto);
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Server error" });
  }
});

module.exports = router;
