import { Router } from "express";
import { getHeatmap, getStreak, getSummary, getWeeklySummary } from "../controllers/dashboard.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/heatmap", getHeatmap);
router.get("/streak", getStreak);
router.get("/summary", getSummary);
router.get("/weekly", getWeeklySummary);

export default router;
