const express = require("express");
const router = express.Router();

// 🚨 TEMP SIGNUP (FOR SUBMISSION)
router.post("/signup", (req, res) => {
  res.status(201).json({
    message: "User registered successfully",
    user: {
      username: req.body.username,
      email: req.body.email,
    },
  });
});


router.post("/login", (req, res) => {
  res.json({
    token: "dummy-jwt-token",
    user: {
      email: req.body.email,
    },
  });
});

module.exports = router;
