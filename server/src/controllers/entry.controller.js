import prisma from "../lib/prisma.js";
import { sendSuccess } from "../utils/response.js";
import { createError } from "../middleware/errorHandler.js";

// POST /api/entries
// Mark a habit complete for a specific date
export const createOrUpdateEntry = async (req, res, next) => {
  try {
    const { habitId, date, completed, completionPercentage, value, note } = req.body;

    if (!habitId || !date) {
      throw createError("habitId and date are required.", 400);
    }

    // Verify the habit belongs to this user
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId: req.user.id },
    });

    if (!habit) throw createError("Habit not found.", 404);

    const percentage = Number(completionPercentage ?? (completed ? 100 : 0));
    if (Number.isNaN(percentage) || percentage < 0 || percentage > 100) {
      throw createError("Completion percentage must be between 0 and 100.", 400);
    }

    const numericValue = value === undefined || value === null || value === "" ? null : Number(value);
    if (numericValue !== null && (Number.isNaN(numericValue) || numericValue < 0)) {
      throw createError("Value must be a positive number.", 400);
    }

    // upsert = create if it doesn't exist, update if it does
    // This is the key operation for daily tracking
    const entry = await prisma.habitEntry.upsert({
      where: { habitId_date: { habitId, date } },
      update: {
        completed: completed ?? percentage > 0,
        completionPercentage: percentage,
        value: numericValue,
        note: note?.trim() || null,
      },
      create: {
        habitId,
        date,
        completed: completed ?? percentage > 0,
        completionPercentage: percentage,
        value: numericValue,
        note: note?.trim() || null,
      },
    });

    sendSuccess(res, { entry }, "Entry saved.");
  } catch (error) {
    next(error);
  }
};

// GET /api/entries/:habitId
export const getEntriesByHabit = async (req, res, next) => {
  try {
    const { habitId } = req.params;
    const { from, to } = req.query;

    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId: req.user.id },
    });

    if (!habit) throw createError("Habit not found.", 404);

    const where = { habitId };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = from;
      if (to) where.date.lte = to;
    }

    const entries = await prisma.habitEntry.findMany({
      where,
      orderBy: { date: "asc" },
    });

    sendSuccess(res, { entries });
  } catch (error) {
    next(error);
  }
};
