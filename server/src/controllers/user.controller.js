import prisma from "../lib/prisma.js";
import { createError } from "../middleware/errorHandler.js";
import { sendSuccess } from "../utils/response.js";
import { getHeatmapData, getStreakData } from "../services/dashboard.service.js";

// GET /api/users/:username/public
export const getPublicProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    // 1. Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw createError("User not found", 404);
    }

    // 2. Fetch public metrics using existing dashboard services
    const heatmap = await getHeatmapData(user.id);
    const streak = await getStreakData(user.id);

    // 3. Return assembled public profile data
    sendSuccess(res, {
      profile: {
        username: user.username,
        joinedAt: user.createdAt,
      },
      heatmap,
      streak,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/me
export const deleteCurrentUser = async (req, res, next) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.id },
    });

    sendSuccess(res, null, "Account deleted.");
  } catch (error) {
    next(error);
  }
};
