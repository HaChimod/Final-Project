const express = require("express");
const router = express.Router();
const User = require("../db/userModel");

router.post("/login", async (req, res) => {
  const { login_name, password } = req.body;
  console.log("HIT /login");
  if (!login_name || !password) {
    return res.status(400).json({ message: "Missing login_name or password" });
  }

  try {
    const user = await User.findOne({ login_name: login_name }).lean();

    if (!user || user.password !== password) {
      return res
        .status(400)
        .json({ message: "Invalid login name or password" });
    }
    req.session.userId = user._id;
    req.session.login_name = user.login_name;

    res.json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/me", (req, res) => {
  if (req.session.userId) {
    res.json({ login_name: req.session.login_name });
  } else {
    res.status(401).json({ error: "Not logged in" });
  }
});
router.post("/logout", (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(400).json({ message: "Not logged in" });
  }

  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});
router.post("/user", async (req, res) => {
  const {
    login_name,
    password,
    first_name,
    last_name,
    location,
    description,
    occupation,
  } = req.body;

  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).send("Missing required fields");
  }

  const already = await User.findOne({ login_name }).lean();
  if (already) {
    return res.status(400).send("Login name already exists");
  }

  try {
    const newUser = await User.create({
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation,
    });

    res.status(201).json({ login_name: newUser.login_name });
  } catch (err) {
    res.status(400).send("Failed to create user");
  }
});

module.exports = router;
