const express = require("express");
const router = express.Router();
const requireLogin = require("./requireLogin");
const User = require("../db/userModel");
const Photo = require("../db/photoModel");
router.get("/list", async (req, res) => {
  console.log("HIT /api/user/list");

  try {
    const users = await User.find({})
      .select("_id first_name last_name")
      .sort({ last_name: 1, first_name: 1 })
      .lean();
    const photos = await Photo.find({}).lean();
    const statsMap = {};

    photos.forEach((photo) => {
      const ownerId = photo.user_id?.toString();
      if (ownerId) {
        if (!statsMap[ownerId]) {
          statsMap[ownerId] = { photoCount: 0, commentCount: 0 };
        }
        statsMap[ownerId].photoCount++;
      }

      (photo.comments || []).forEach((c) => {
        if (c.user_id) {
          const commenterId = c.user_id.toString();
          if (!statsMap[commenterId]) {
            statsMap[commenterId] = { photoCount: 0, commentCount: 0 };
          }
          statsMap[commenterId].commentCount++;
        }
      });
    });
    users.forEach((u) => {
      const s = statsMap[u._id.toString()] || {
        photoCount: 0,
        commentCount: 0,
      };
      u.photoCount = s.photoCount;
      u.commentCount = s.commentCount;
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/search", async (req, res) => {
  console.log("HIT /search");
  const { q } = req.query;
  if (!q || q.trim() === "") {
    return res.json([]);
  }
  try {
    const users = await User.find({
      $or: [
        { first_name: { $regex: q, $options: "i" } },
        { last_name: { $regex: q, $options: "i" } },
      ],
    })
      .select("_id first_name last_name")
      .sort({ last_name: 1, first_name: 1 })
      .lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!require("mongoose").Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  try {
    const user = await User.findById(id)
      .select("_id first_name last_name location description occupation")
      .lean();
    if (!user) return res.status(400).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
