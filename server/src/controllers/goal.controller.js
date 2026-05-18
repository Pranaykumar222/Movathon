import prisma from "../lib/prisma.js";
import { createError } from "../middleware/errorHandler.js";
import { sendSuccess } from "../utils/response.js";

const sanitizeGoalData = ({ title, description, target, unit }, isUpdate = false) => {
  const data = {};

  if (!isUpdate || title !== undefined) {
    if (!title || title.trim() === "") {
      throw createError("Goal title is required.", 400);
    }
    data.title = title.trim();
  }

  if (description !== undefined) data.description = description?.trim() || null;
  if (target !== undefined) {
    const numericTarget = target === "" || target === null ? null : Number(target);
    if (numericTarget !== null && (Number.isNaN(numericTarget) || numericTarget < 0)) {
      throw createError("Goal target must be a positive number.", 400);
    }
    data.target = numericTarget;
  }
  if (unit !== undefined) data.unit = unit?.trim() || null;

  return data;
};

export const createGoal = async (req, res, next) => {
  try {
    const data = sanitizeGoalData(req.body);
    const goal = await prisma.goal.create({
      data: { ...data, userId: req.user.id },
      include: { habits: true },
    });

    sendSuccess(res, { goal }, "Goal created.", 201);
  } catch (error) {
    next(error);
  }
};

export const getGoals = async (req, res, next) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        habits: {
          include: {
            entries: {
              orderBy: { date: "desc" },
              take: 30,
            },
          },
        },
      },
    });

    sendSuccess(res, { goals });
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = sanitizeGoalData(req.body, true);

    const existing = await prisma.goal.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) throw createError("Goal not found.", 404);

    const goal = await prisma.goal.update({
      where: { id },
      data,
      include: {
        habits: {
          include: {
            entries: {
              orderBy: { date: "desc" },
              take: 30,
            },
          },
        },
      },
    });

    sendSuccess(res, { goal }, "Goal updated.");
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.goal.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) throw createError("Goal not found.", 404);

    await prisma.goal.delete({ where: { id } });

    sendSuccess(res, null, "Goal deleted.");
  } catch (error) {
    next(error);
  }
};
