import "dotenv/config";
import "./config/env.js"; // Validate env vars immediately
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import habitRoutes from "./routes/habit.routes.js";
import entryRoutes from "./routes/entry.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import goalRoutes from "./routes/goal.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// ─── Security & Utility Middleware ───────────────────────────────────────────
app.use(helmet()); // Secure HTTP headers
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));
if (process.env.HTTP_LOGS === "true") {
  app.use(morgan(config.isDev ? "dev" : "combined")); // Optional request logging
}
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// ─── Health Check (Render uses this to verify the server is alive) ───────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/users", userRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`✅ Server running on port ${config.port} in ${config.nodeEnv} mode`);
});
