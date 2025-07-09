import express from "express";
import Domain from "../models/Domain.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const domains = await Domain.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Domain.countDocuments(query);

    res.json({
      data: domains,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  const domains = req.body;
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (!Array.isArray(domains))
    return res.status(400).json({ error: "Expected array of domains" });

  try {
    const domainDocs = domains.map((name) => ({ name, ip: clientIp }));
    await Domain.insertMany(domainDocs, { ordered: false });

    res.status(201).json({
      message: `Inserted ${domains.length} domains from ${clientIp}.`,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to insert domains" });
  }
});

export default router;
