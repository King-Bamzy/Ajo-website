const express = require("express");
const Collection = require("../models/Collection");
const Item = require("../models/Item");
const User = require("../models/User");
const { requireAdminApi } = require("../middleware/auth");

const router = express.Router();

router.use(requireAdminApi);

router.get("/stats", async (req, res, next) => {
  try {
    const [totalRequests, pending, accepted, rejected, scheduled, delivered, users] = await Promise.all([
      Collection.countDocuments({}),
      Collection.countDocuments({ status: "pending" }),
      Collection.countDocuments({ status: "accepted" }),
      Collection.countDocuments({ status: "rejected" }),
      Collection.countDocuments({ status: "scheduled" }),
      Collection.countDocuments({ status: "delivered" }),
      User.countDocuments({})
    ]);

    res.json({
      requests: { total: totalRequests, pending, accepted, rejected, scheduled, delivered },
      users
    });
  } catch (error) {
    next(error);
  }
});

function toCsvValue(value) {
  const raw = value == null ? "" : String(value);
  const escaped = raw.replace(/"/g, '""');
  return `"${escaped}"`;
}

router.get("/exports/collections.csv", async (req, res, next) => {
  try {
    const collections = await Collection.find().sort({ createdAt: -1 }).limit(5000);
    const header = [
      "createdAt",
      "memberName",
      "memberEmail",
      "phone",
      "plan",
      "contribution",
      "status",
      "scheduledFor",
      "notes"
    ];

    const lines = [header.join(",")];
    collections.forEach((c) => {
      lines.push(
        [
          toCsvValue(c.createdAt ? c.createdAt.toISOString() : ""),
          toCsvValue(c.memberName),
          toCsvValue(c.memberEmail),
          toCsvValue(c.phone),
          toCsvValue(c.plan),
          toCsvValue(Number(c.contribution || 0)),
          toCsvValue(c.status),
          toCsvValue(c.scheduledFor ? new Date(c.scheduledFor).toISOString().slice(0, 10) : ""),
          toCsvValue(c.notes)
        ].join(",")
      );
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="ajo-collections-${Date.now()}.csv"`);
    res.send(lines.join("\n"));
  } catch (error) {
    next(error);
  }
});

router.patch("/collections/:id/status", async (req, res, next) => {
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

router.patch("/collections/:id", async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ message: "Collection not found" });

    if (req.body.scheduledFor != null) {
      collection.scheduledFor = req.body.scheduledFor ? new Date(req.body.scheduledFor) : null;
      if (collection.scheduledFor && collection.status !== "delivered" && collection.status !== "rejected") {
        collection.status = "scheduled";
      }
      if (!collection.scheduledFor && collection.status === "scheduled") {
        collection.status = "pending";
      }
    }

    if (req.body.notes != null) collection.notes = String(req.body.notes || "");
    if (req.body.phone != null) collection.phone = String(req.body.phone || "");

    await collection.save();
    res.json(collection);
  } catch (error) {
    next(error);
  }
});

router.delete("/collections/:id", async (req, res, next) => {
  try {
    const result = await Collection.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Collection not found" });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post("/items", async (req, res, next) => {
  const payload = {
    name: String(req.body.name || "").trim(),
    category: String(req.body.category || "").trim(),
    description: String(req.body.description || "").trim(),
    price: Number(req.body.price || 0),
    condition: String(req.body.condition || "").trim(),
    size: String(req.body.size || "").trim(),
    color: String(req.body.color || "").trim(),
    image: String(req.body.image || "").trim(),
    thriftHouse: String(req.body.thriftHouse || "").trim(),
    tags: Array.isArray(req.body.tags) ? req.body.tags : String(req.body.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
    story: String(req.body.story || "").trim(),
    available: req.body.available !== false
  };

  if (!payload.name || !payload.price) {
    return res.status(400).json({ message: "Name and price are required" });
  }

  try {
    const item = await Item.create(payload);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

router.patch("/items/:id", async (req, res, next) => {
  const updates = {};
  const allowed = ["name", "category", "description", "price", "condition", "size", "color", "image", "thriftHouse", "story"];

  allowed.forEach((key) => {
    if (req.body[key] != null) updates[key] = req.body[key];
  });

  if (req.body.available != null) updates.available = Boolean(req.body.available);
  if (req.body.tags != null) {
    updates.tags = Array.isArray(req.body.tags)
      ? req.body.tags
      : String(req.body.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
  }

  if (updates.price != null) updates.price = Number(updates.price || 0);

  try {
    const item = await Item.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    next(error);
  }
});

router.patch("/users/:id", async (req, res, next) => {
  const updates = {};
  if (req.body.role != null) updates.role = req.body.role;
  if (req.body.disabled != null) updates.disabled = Boolean(req.body.disabled);

  if (String(req.params.id) === String(req.auth.user._id)) {
    if (updates.disabled === true) {
      return res.status(400).json({ message: "You cannot disable your own account." });
    }
    if (updates.role && updates.role !== "admin") {
      return res.status(400).json({ message: "You cannot remove your own admin role." });
    }
  }

  if (updates.role && !["user", "admin"].includes(updates.role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, disabled: user.disabled });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
