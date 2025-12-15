const express = require("express");
const router = express.Router();
const requireLogin = require("./requireLogin");
const User = require("../db/userModel");
router.get("/list", async (req, res) => {
  try {
    const users = await User.find({})
      .select("_id first_name last_name")
      .sort({ last_name: 1, first_name: 1 })
      .lean();
    res.json(users);
  } catch (err) {
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
