const express = require("express");
const ajoPlans = require("../data/ajoPlans");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(ajoPlans);
});

module.exports = router;
