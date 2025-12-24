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

router.put("/edit/me", async (req, res) => {
  const userId = req.session.userId;
  const { first_name, last_name, location, description, occupation } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        first_name,
        last_name,
        location,
        description,
        occupation,
      },
      { new: true }
    ).select("_id first_name last_name location description occupation");

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/listfriend", async (req, res) => {
  const userId = req.session?.userId; 
  if (!userId) return res.status(401).json({ message: "Not logged in" });
  try {
    const user = await User.findById(userId).populate(
      "friends",
      "_id first_name last_name"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.friends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/requests", async (req, res) => {
  const userId = req.session.userId;
  const user = await User.findById(userId).populate("friendRequests", "_id first_name last_name");
  res.json(user.friendRequests);
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

router.post("/request/:userId", async (req, res) => {
  const fromUserId = req.session.userId; 
  const toUserId = req.params.userId; 
  if (!fromUserId || fromUserId === toUserId)
    return res.status(400).json({ message: "Invalid request" });
  const toUser = await User.findById(toUserId);
  if (!toUser) return res.status(404).json({ message: "User not found" });
  if (toUser.friendRequests.includes(fromUserId))
    return res.status(400).json({ message: "Already requested" });
  toUser.friendRequests.push(fromUserId);
  await toUser.save();
  res.json({ message: "Friend request sent" });
});
router.post("/accept/:userId", async (req, res) => {
  const userId = req.session.userId; 
  const fromUserId = req.params.userId; 
  const user = await User.findById(userId);
  const fromUser = await User.findById(fromUserId);
  if (!user || !fromUser) return res.status(404).json({ message: "User not found" });
  user.friendRequests = user.friendRequests.filter(id => id.toString() !== fromUserId);
  if (!user.friends.includes(fromUserId)) user.friends.push(fromUserId);
  if (!fromUser.friends.includes(userId)) fromUser.friends.push(userId);
  await user.save();
  await fromUser.save();
  res.json({ message: "Friend request accepted" });
});
router.post("/reject/:userId", async (req, res) => {
  const userId = req.session.userId; 
  const fromUserId = req.params.userId; 
  if (!userId) return res.status(401).json({ message: "Not logged in" });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const originalLength = user.friendRequests.length;
    user.friendRequests = user.friendRequests.filter(
      id => id.toString() !== fromUserId
    );
    if (user.friendRequests.length === originalLength) {
      return res.status(400).json({ message: "No such friend request" });
    }
    await user.save();
    res.json({ message: "Friend request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/unfriend/:userId", async (req, res) => {
  const userId = req.session.userId;
  const targetId = req.params.userId;
  if (!userId || userId === targetId) return res.status(400).json({ message: "Invalid request" });

  try {
    const user = await User.findById(userId);
    const target = await User.findById(targetId);
    if (!user || !target) return res.status(404).json({ message: "User not found" });

    user.friends = user.friends.filter(f => f.toString() !== targetId);
    target.friends = target.friends.filter(f => f.toString() !== userId);
    await user.save();
    await target.save();
    res.json({ message: "Unfriended successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
