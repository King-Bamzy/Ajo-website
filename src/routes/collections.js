const express = require("express");
const Collection = require("../models/Collection");
const { requireAdminApi, requireAuthApi } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuthApi, async (req, res, next) => {
  const { status } = req.query;
  const filter = {};

  if (status) {
    filter.status = status;
  }

  try {
    if (req.auth.user.role !== "admin") {
      filter.userId = req.auth.user._id;
    }

    const collections = await Collection.find(filter).sort({ createdAt: -1 });
    res.json(collections);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const { memberName, phone, memberEmail, plan, contribution, scheduledFor, notes } = req.body;

  try {
    const collection = await Collection.create({
      userId: req.auth?.user?._id || undefined,
      memberName,
      memberEmail: req.auth?.user?.email || memberEmail || undefined,
      phone,
      plan,
      contribution,
      scheduledFor,
      notes,
      status: scheduledFor ? "scheduled" : "pending"
    });
    res.status(201).json(collection);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", requireAdminApi, async (req, res, next) => {
  const { status } = req.body;
  const allowedStatuses = ["pending", "accepted", "rejected", "scheduled", "delivered"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    res.json(collection);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
