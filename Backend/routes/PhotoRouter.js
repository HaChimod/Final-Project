const express = require("express");
const router = express.Router();

const User = require("../db/userModel");
const Photo = require("../db/photoModel");

router.get("/comment/search", async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) return res.json([]);

  try {
    const photos = await Photo.find({
      "comments.comment": { $regex: q, $options: "i" },
    }).lean();

    const results = [];

    for (const photo of photos) {
      // Lấy thông tin chủ photo bên trong loop
      const photoOwner = await User.findById(photo.user_id)
        .select("_id first_name last_name")
        .lean();

      for (const c of photo.comments) {
        if (c.comment.toLowerCase().includes(q.toLowerCase())) {
          const user = await User.findById(c.user_id)
            .select("_id first_name last_name")
            .lean();

          results.push({
            _id: c._id,
            comment: c.comment,
            photo_id: photo._id,
            photo_owner: photoOwner || {
              _id: null,
              first_name: "Unknown",
              last_name: "User",
            },
            user,
            date_time: c.date_time,
          });
        }
      }
    }

    res.json(results);
  } catch (err) {
    console.error("Search comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/photosOfUser/:id", async (req, res) => {
  const { id } = req.params;

  if (!require("mongoose").Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const userExists = await User.findById(id).lean();
    if (!userExists) {
      return res.status(400).json({ message: "User not found" });
    }

    const photos = await Photo.find({ user_id: id }).lean();
    const result = [];

    for (const photo of photos) {
      const comments = [];
      for (const comment of photo.comments || []) {
        const commentUser = await User.findById(comment.user_id)
          .select("_id first_name last_name")
          .lean();

        comments.push({
          _id: comment._id,
          comment: comment.comment,
          date_time: comment.date_time,
          user: commentUser || {
            _id: null,
            first_name: "Unknown",
            last_name: "User",
          },
        });
      }

      result.push({
        _id: photo._id,
        user_id: photo.user_id,
        file_name: photo.file_name,
        date_time: photo.date_time,
        comments,
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/photoWithComments/:photo_id", async (req, res) => {
  const { photo_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(photo_id)) {
    return res.status(400).json({ message: "Invalid photo ID" });
  }

  try {
    const photo = await Photo.findById(photo_id).lean();
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    const commentsWithUser = [];
    for (const c of photo.comments || []) {
      const user = await User.findById(c.user_id)
        .select("_id first_name last_name")
        .lean();
      commentsWithUser.push({
        _id: c._id,
        comment: c.comment,
        date_time: c.date_time,
        user: user || { _id: null, first_name: "Unknown", last_name: "User" },
      });
    }

    res.json({
      _id: photo._id,
      user_id: photo.user_id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      comments: commentsWithUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
router.post("/commentsOfPhoto/:photo_id", async (req, res) => {
  const { photo_id } = req.params;
  // const { comment } = req.body;
  const { comment, user_id } = req.body;
  if (!require("mongoose").Types.ObjectId.isValid(photo_id)) {
    return res.status(400).json({ message: "Invalid photo ID" });
  }
  if (!comment || comment.trim() === "") {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  try {
    const photo = await Photo.findById(photo_id);
    if (!photo) {
      return res.status(400).json({ message: "Photo not found" });
    }
    photo.comments.push({
      comment,
      user_id: req.session.userId,
      // user_id,
      date_time: new Date(),
    });

    await photo.save();

    res.status(201).json({ message: "Comment added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/stats/commentOfUser/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const userPhotos = await Photo.find({ user_id: userId });
    const totalPhotos = userPhotos.length;
    let totalComments = 0;
    userPhotos.forEach((photo) => {
      (photo.comments || []).forEach((c) => {
        if (c.user_id && c.user_id.toString() === userId) {
          totalComments++;
        }
      });
    });

    res.json({
      userId,
      totalPhotos,
      totalComments,
    });
  } catch (err) {
    console.error("Error in /stats/commentOfUser:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
