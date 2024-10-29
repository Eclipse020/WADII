// backend/api/favorites.js
const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Middleware to verify Firebase token
async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

router.put("/api/favorites", authenticateToken, async (req, res) => {
  // Logic for handling favorites
  res.send("Favorite added successfully");
});

module.exports = router;
