const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Item = require("./models/Item");
const Collection = require("./models/Collection");
const itemRoutes = require("./routes/items");
const planRoutes = require("./routes/plans");
const collectionRoutes = require("./routes/collections");
const authRoutes = require("./routes/auth");
const adminPages = require("./routes/adminPages");
const adminApi = require("./routes/adminApi");
const accountPages = require("./routes/accountPages");
const ajoPlans = require("./data/ajoPlans");
const { attachUser } = require("./middleware/auth");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || `http://localhost:${PORT}`,
    optionsSuccessStatus: 200
  })
);
app.use(attachUser);

app.get("/", async (req, res, next) => {
  try {
    const items = await Item.find({ available: true })
      .sort({ createdAt: -1 })
      .limit(6);

    const savedValue = items.reduce((total, item) => total + Number(item.price || 0), 0);

    const timeline = [
      {
        title: "Join the Ajo",
        copy: "Choose a plan, make your first contribution, and tell us what kinds of drops you love."
      },
      {
        title: "Mission drops",
        copy: "We source, inspect, and store curated garments so every contribution has a story."
      },
      {
        title: "Collection night",
        copy: "Schedule your pickup window or delivery route with a single tap on the form below."
      },
      {
        title: "Celebrate & reinvest",
        copy: "Share your haul, celebrate the collective win, and bring a friend into the circle."
      }
    ];

    res.render("index", {
      items,
      plans: ajoPlans,
      savedValue,
      timeline
    });
  } catch (error) {
    next(error);
  }
});

app.use("/auth", authRoutes);
app.use("/admin", adminPages);
app.use("/account", accountPages);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Ajo thrift API" });
});

app.use("/api/items", itemRoutes);
app.use("/api/plan-options", planRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/admin", adminApi);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || "Server error" });
});

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ajo-thrift", {
    serverSelectionTimeoutMS: 5000
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
  });
