const express = require("express");
const Item = require("../models/Item");

const router = express.Router();

router.get("/", async (req, res, next) => {
  const { category, tag, search } = req.query;
  const filter = { available: true };

  if (category) {
    filter.category = category;
  }

  if (tag) {
    filter.tags = tag;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { thriftHouse: { $regex: search, $options: "i" } }
    ];
  }

  try {
    const items = await Item.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
