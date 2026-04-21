const express = require("express");
const Collection = require("../models/Collection");
const Item = require("../models/Item");
const User = require("../models/User");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const [requests, items, users] = await Promise.all([
      Collection.find().sort({ createdAt: -1 }).limit(80),
      Item.find().sort({ createdAt: -1 }).limit(80),
      User.find().sort({ createdAt: -1 }).limit(80)
    ]);

    res.render("admin", { requests, items, users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

