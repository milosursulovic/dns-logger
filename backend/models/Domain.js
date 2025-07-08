import mongoose from "mongoose";

const domainSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ip: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Domain", domainSchema);
