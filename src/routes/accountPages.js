const express = require("express");
const Collection = require("../models/Collection");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const requests = await Collection.find({ userId: req.auth.user._id }).sort({ createdAt: -1 });
    res.render("account", { requests });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

