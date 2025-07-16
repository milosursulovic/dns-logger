import mongoose from "mongoose";

const domainSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ip: { type: String },
  timestamp: { type: Date, default: Date.now },
  category: { type: String, enum: ["normal", "blocked"], default: "normal" },
});

export default mongoose.model("Domain", domainSchema);
