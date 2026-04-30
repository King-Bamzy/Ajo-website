const express = require("express");
const Collection = require("../models/Collection");
const ajoPlans = require("../data/ajoPlans");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const requests = await Collection.find({ userId: req.auth.user._id }).sort({ createdAt: -1 });
    const activeRequests = requests.filter((request) => request.status !== "rejected");
    const nextCollection = activeRequests
      .filter((request) => request.scheduledFor)
      .sort((left, right) => new Date(left.scheduledFor) - new Date(right.scheduledFor))[0] || null;
    const totalCommitted = activeRequests.reduce(
      (sum, request) => sum + Number(request.contribution || 0),
      0
    );

    res.render("account", {
      requests,
      planOptions: ajoPlans,
      summary: {
        activePlans: activeRequests.length,
        totalCommitted,
        nextCollection
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
