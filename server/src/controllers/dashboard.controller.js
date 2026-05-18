import {
  getGoalProgress,
  getHabitPerformance,
  getHeatmapData,
  getStreakData,
  getTodaySummary,
  getWeeklyReview,
} from "../services/dashboard.service.js";
import { sendSuccess } from "../utils/response.js";

// GET /api/dashboard/heatmap
export const getHeatmap = async (req, res, next) => {
  try {
    const data = await getHeatmapData(req.user.id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/streak
export const getStreak = async (req, res, next) => {
  try {
    const data = await getStreakData(req.user.id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/summary
export const getSummary = async (req, res, next) => {
  try {
    const { date, dayOfWeek } = req.query;
    const [today, streak, performance, goals] = await Promise.all([
      getTodaySummary(req.user.id, { date, dayOfWeek }),
      getStreakData(req.user.id),
      getHabitPerformance(req.user.id),
      getGoalProgress(req.user.id),
    ]);

    sendSuccess(res, { today, streak, ...performance, goals });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/weekly
export const getWeeklySummary = async (req, res, next) => {
  try {
    const data = await getWeeklyReview(req.user.id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};
