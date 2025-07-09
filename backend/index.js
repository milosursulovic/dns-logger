import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import https from "https";
import cors from "cors";

import domainRoutes from "./routes/domain.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const httpsOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH),
};

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("✅ MongoDB connected");
});

app.use("/api/domains", domainRoutes);
app.use("/api/auth", authRoutes);

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`🔒 HTTPS server running on port ${PORT}`);
});
