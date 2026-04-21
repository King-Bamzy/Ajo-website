const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  memberName: { type: String, required: true },
  memberEmail: String,
  phone: String,
  plan: { type: String, required: true },
  contribution: { type: Number, required: true },
  scheduledFor: Date,
  notes: String,
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "scheduled", "delivered"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Collection", collectionSchema);
