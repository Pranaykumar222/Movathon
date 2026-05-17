import prisma from "../lib/prisma.js";
import { sendSuccess } from "../utils/response.js";
import { createError } from "../middleware/errorHandler.js";

const HABIT_TYPES = ["YES_NO", "NUMBER", "TIME"];

const sanitizeHabitData = ({ title, color, type, target, unit, goalId, frequency }, isUpdate = false) => {
  const data = {};

  if (!isUpdate || title !== undefined) {
    if (!title || title.trim() === "") {
      throw createError("Habit title is required.", 400);
    }
    data.title = title.trim();
  }

  if (color !== undefined) data.color = color;
  if (type !== undefined) {
    if (!HABIT_TYPES.includes(type)) {
      throw createError("Habit type must be YES_NO, NUMBER, or TIME.", 400);
    }
    data.type = type;
  }
  if (target !== undefined) {
    const numericTarget = target === "" || target === null ? null : Number(target);
    if (numericTarget !== null && (Number.isNaN(numericTarget) || numericTarget < 0)) {
      throw createError("Target must be a positive number.", 400);
    }
    data.target = numericTarget;
  }
  if (unit !== undefined) data.unit = unit?.trim() || null;
  if (goalId !== undefined) data.goalId = goalId || null;
  
  if (frequency !== undefined) {
    if (!Array.isArray(frequency) || !frequency.every(d => Number.isInteger(d) && d >= 0 && d <= 6)) {
      throw createError("Frequency must be an array of days (0-6).", 400);
    }
    data.frequency = frequency;
  }

  return data;
};

const assertGoalOwnership = async (goalId, userId) => {
  if (!goalId) return;
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
  if (!goal) throw createError("Goal not found.", 404);
};

// POST /api/habits
export const createHabit = async (req, res, next) => {
  try {
    const data = sanitizeHabitData(req.body);
    await assertGoalOwnership(data.goalId, req.user.id);

    const habit = await prisma.habit.create({
      data: {
        ...data,
        color: data.color || "#22c55e",
        type: data.type || "YES_NO",
        userId: req.user.id,
      },
      include: {
        goal: true,
        entries: true,
      },
    });

    sendSuccess(res, { habit }, "Habit created.", 201);
  } catch (error) {
    next(error);
  }
};

// GET /api/habits
export const getHabits = async (req, res, next) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "asc" },
      include: {
        goal: true,
        // Include the last 7 days of entries for the mini progress display
        entries: {
          orderBy: { date: "desc" },
          take: 7,
        },
      },
    });

    sendSuccess(res, { habits });
  } catch (error) {
    next(error);
  }
};

// PUT /api/habits/:id
export const updateHabit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = sanitizeHabitData(req.body, true);
    await assertGoalOwnership(data.goalId, req.user.id);

    // Verify ownership — users can only edit their own habits
    const existing = await prisma.habit.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) throw createError("Habit not found.", 404);

    const habit = await prisma.habit.update({
      where: { id },
      data,
      include: {
        goal: true,
      },
    });

    sendSuccess(res, { habit }, "Habit updated.");
  } catch (error) {
    next(error);
  }
};

// DELETE /api/habits/:id
export const deleteHabit = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.habit.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) throw createError("Habit not found.", 404);

    await prisma.habit.delete({ where: { id } });

    sendSuccess(res, null, "Habit deleted.");
  } catch (error) {
    next(error);
  }
};
