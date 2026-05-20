import express from "express";
import cors from "cors";
import path from "path";
import markerRoutes from "./routes/markerRoutes";
import adminMarkerRoutes from "./routes/adminMarkerRoutes";
import adminManagerRoutes from "./routes/adminManagerRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 헬스체크
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Public routes
app.use("/api/markers", markerRoutes);

// Admin routes (requires auth)
app.use("/api/admin/markers", adminMarkerRoutes);
app.use("/api/admin/managers", adminManagerRoutes);
app.use("/api/admin/upload", uploadRoutes);

// 404 핸들러
app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

export default app;
