import express from "express";
import mongoose from "mongoose";
import Domain from "./models/Domain.js";
import dotenv from "dotenv";
import fs from "fs";
import https from "https";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const keyPath = process.env.SSL_KEY_PATH;
const certPath = process.env.SSL_CERT_PATH;

const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

app.use(express.json());

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.post("/api/domains", async (req, res) => {
  const domains = req.body;
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (!Array.isArray(domains)) {
    return res.status(400).json({ error: "Expected array of domains" });
  }

  try {
    const domainDocs = domains.map((name) => ({
      name,
      ip: clientIp,
    }));

    await Domain.insertMany(domainDocs, { ordered: false });
    res.status(201).json({
      message: `Inserted ${domains.length} domains from ${clientIp}.`,
    });
  } catch (error) {
    console.error("Error inserting domains:", error);
    res.status(500).json({ error: "Failed to insert domains" });
  }
});

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`🔒 HTTPS server running on port ${PORT}`);
});
