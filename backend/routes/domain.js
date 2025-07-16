import express from "express";
import Domain from "../models/Domain.js";
import { authenticateToken } from "../middlewares/auth.js";
import ExcelJS from "exceljs";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      sortBy = "timestamp",
      sortOrder = "desc",
    } = req.query;

    const searchRegex = new RegExp(search, "i");

    const query = search
      ? {
          $or: [
            { name: { $regex: searchRegex } },
            { ip: { $regex: searchRegex } },
          ],
        }
      : {};

    const sort = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const domains = await Domain.find(query)
      .sort(sort)
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

router.post("/", async (req, res) => {
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

router.get("/export", authenticateToken, async (req, res) => {
  try {
    const { search = "", sortBy = "timestamp", sortOrder = "desc" } = req.query;

    const searchRegex = new RegExp(search, "i");

    const query = search
      ? {
          $or: [
            { name: { $regex: searchRegex } },
            { ip: { $regex: searchRegex } },
          ],
        }
      : {};

    const sort = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const domains = await Domain.find(query).sort(sort);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("DNS Logovi");

    worksheet.columns = [
      { header: "#", key: "index", width: 6 },
      { header: "Domain", key: "name", width: 30 },
      { header: "IP Adresa", key: "ip", width: 20 },
      { header: "Vreme", key: "timestamp", width: 25 },
    ];

    domains.forEach((entry, i) => {
      worksheet.addRow({
        index: i + 1,
        name: entry.name,
        ip: entry.ip,
        timestamp: new Date(entry.timestamp).toLocaleString("sr-RS"),
      });
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=dns-logovi-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Greška pri eksportovanju:", err);
    res.status(500).json({ error: "Greška pri eksportovanju u Excel" });
  }
});

export default router;
