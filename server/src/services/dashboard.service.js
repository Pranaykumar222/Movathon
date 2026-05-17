import prisma from "../lib/prisma.js";

const STREAK_THRESHOLD = 70; // Completion % required to count toward streak
const todayString = () => new Date().toISOString().split("T")[0];

// Get all entries for a user grouped by date for the heatmap
export const getHeatmapData = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  });

  const fromDate = user.createdAt.toISOString().split("T")[0];
  const toDate = todayString();

  // Get all habits for this user
  const habits = await prisma.habit.findMany({
    where: { userId },
    select: { id: true },
  });

  if (habits.length === 0) {
    return { days: [], fromDate, toDate };
  }

  const habitIds = habits.map((h) => h.id);

  // Get all entries for all habits in the date range
  const entries = await prisma.habitEntry.findMany({
    where: {
      habitId: { in: habitIds },
      date: { gte: fromDate, lte: toDate },
    },
    select: { date: true, completionPercentage: true },
  });

  // Group entries by date and average the completion percentage
  const byDate = {};
  entries.forEach(({ date, completionPercentage }) => {
    if (!byDate[date]) byDate[date] = { total: 0, count: 0 };
    byDate[date].total += completionPercentage;
    byDate[date].count += 1;
  });

  const days = Object.entries(byDate).map(([date, { total, count }]) => ({
    date,
    percentage: Math.round(total / count),
    // Intensity 0-4 maps to heatmap colors
    intensity: getIntensity(Math.round(total / count)),
  }));

  return { days, fromDate, toDate };
};

// Determine color intensity from completion percentage matching GitHub's 5 levels (0-4)
const getIntensity = (percentage) => {
  if (percentage === 0) return 0;
  if (percentage <= 25) return 1;
  if (percentage <= 50) return 2;
  if (percentage <= 75) return 3;
  return 4;
};

// Calculate current streak and longest streak for a user
export const getStreakData = async (userId) => {
  const habits = await prisma.habit.findMany({
    where: { userId },
    select: { id: true },
  });

  if (habits.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalCompletedDays: 0 };
  }

  const habitIds = habits.map((h) => h.id);

    const entries = await prisma.habitEntry.findMany({
    where: { habitId: { in: habitIds } },
    select: { date: true, completionPercentage: true, completed: true },
    orderBy: { date: "asc" },
  });

  // Average completion per day across all habits
  const byDate = {};
  entries.forEach(({ date, completionPercentage, completed }) => {
    if (!byDate[date]) byDate[date] = { total: 0, count: 0, anyCompleted: false };
    byDate[date].total += completionPercentage;
    byDate[date].count += 1;
    if (completed || completionPercentage >= STREAK_THRESHOLD) {
      byDate[date].anyCompleted = true;
    }
  });

  // Sorted list of "active" days (at least one habit completed or high percentage)
  const activeDates = Object.entries(byDate)
    .filter(([, data]) => data.anyCompleted)
    .map(([date]) => date)
    .sort();

  if (activeDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalCompletedDays: 0 };
  }

  // Walk through dates and find streak segments
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  const today = todayString();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  for (let i = 1; i < activeDates.length; i++) {
    const prev = new Date(activeDates[i - 1]);
    const curr = new Date(activeDates[i]);
    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Current streak only counts if the last active day is today or yesterday
  const lastActiveDate = activeDates[activeDates.length - 1];
  if (lastActiveDate === today || lastActiveDate === yesterday) {
    // Walk back from the last active day to count current streak
    currentStreak = 1;
    for (let i = activeDates.length - 2; i >= 0; i--) {
      const curr = new Date(activeDates[i + 1]);
      const prev = new Date(activeDates[i]);
      const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalCompletedDays: activeDates.length,
  };
};

export const getTodaySummary = async (userId) => {
  const today = todayString();
  const todayDayOfWeek = new Date().getDay();
  
  const habits = await prisma.habit.findMany({
    where: { 
      userId,
      frequency: { has: todayDayOfWeek }
    },
    include: {
      goal: true,
      entries: {
        where: { date: today },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const totalHabits = habits.length;
  const totalPercentage = habits.reduce((sum, habit) => (
    sum + (habit.entries[0]?.completionPercentage ?? 0)
  ), 0);
  const completionScore = totalHabits > 0 ? Math.round(totalPercentage / totalHabits) : 0;
  const completedHabits = habits.filter((habit) => (habit.entries[0]?.completionPercentage ?? 0) >= 100).length;

  return {
    date: today,
    completionScore,
    completedHabits,
    totalHabits,
  };
};

export const getHabitPerformance = async (userId) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const fromDate = thirtyDaysAgo.toISOString().split("T")[0];
  const toDate = todayString();

  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      entries: {
        where: { date: { gte: fromDate, lte: toDate } },
        orderBy: { date: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const performance = habits.map((habit) => {
    const total = habit.entries.reduce((sum, entry) => sum + entry.completionPercentage, 0);
    const average = habit.entries.length > 0 ? Math.round(total / 30) : 0;

    return {
      id: habit.id,
      title: habit.title,
      color: habit.color,
      type: habit.type,
      target: habit.target,
      unit: habit.unit,
      average,
      trackedDays: habit.entries.length,
    };
  });

  const withActivity = performance.filter((habit) => habit.trackedDays > 0 || habit.average > 0);

  return {
    bestHabits: [...withActivity].sort((a, b) => b.average - a.average).slice(0, 3),
    weakHabits: [...performance].sort((a, b) => a.average - b.average).slice(0, 3),
    fromDate,
    toDate,
  };
};

export const getGoalProgress = async (userId) => {
  const goals = await prisma.goal.findMany({
    where: { userId },
    include: {
      habits: {
        include: {
          entries: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return goals.map((goal) => {
    let progress = 0;

    if (goal.target) {
      // Quantitative goal: Sum all accumulated values
      let totalValue = 0;
      goal.habits.forEach((habit) => {
        habit.entries.forEach((entry) => {
          if (entry.completed) {
            totalValue += (entry.value !== null ? entry.value : (habit.target || 1));
          }
        });
      });
      progress = Math.min(100, Math.round((totalValue / goal.target) * 100));
    } else {
      // Consistency goal: Calculate based on overall habit completion rate
      let totalCompletedDays = 0;
      let totalPossibleDays = 0;
      
      goal.habits.forEach((habit) => {
        const daysSinceCreation = Math.max(1, Math.floor((new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24)));
        totalPossibleDays += daysSinceCreation;
        totalCompletedDays += habit.entries.filter(e => e.completed).length;
      });

      if (totalPossibleDays > 0) {
        progress = Math.min(100, Math.round((totalCompletedDays / totalPossibleDays) * 100));
      }
    }

    return {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      target: goal.target,
      unit: goal.unit,
      progress,
      habitCount: goal.habits.length,
    };
  });
};

export const getWeeklyReview = async (userId) => {
  const today = new Date();
  const past7Days = [];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    past7Days.push(d.toISOString().split("T")[0]);
  }
  
  const fromDate = past7Days[0];
  const toDate = past7Days[6];

  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      entries: {
        where: { date: { gte: fromDate, lte: toDate } }
      }
    }
  });

  const dailyPerformance = past7Days.map(dateStr => {
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay();
    
    const scheduledHabits = habits.filter(h => h.frequency ? h.frequency.includes(dayOfWeek) : true);
    
    if (scheduledHabits.length === 0) {
      return { date: dateStr, score: null, scheduled: 0, completed: 0 };
    }

    let totalScore = 0;
    let completedCount = 0;

    scheduledHabits.forEach(habit => {
      const entry = habit.entries.find(e => e.date === dateStr);
      const percentage = entry ? entry.completionPercentage : 0;
      totalScore += percentage;
      if (percentage >= 100) completedCount++;
    });

    return {
      date: dateStr,
      score: Math.round(totalScore / scheduledHabits.length),
      scheduled: scheduledHabits.length,
      completed: completedCount,
    };
  });

  const activeDays = dailyPerformance.filter(d => d.score !== null);
  
  const averageScore = activeDays.length > 0 
    ? Math.round(activeDays.reduce((sum, d) => sum + d.score, 0) / activeDays.length)
    : 0;

  const sortedDays = [...activeDays].sort((a, b) => b.score - a.score);
  const bestDay = sortedDays.length > 0 ? sortedDays[0] : null;
  const worstDay = sortedDays.length > 0 ? sortedDays[sortedDays.length - 1] : null;

  const skippedHabits = [];
  habits.forEach(habit => {
    let skippedCount = 0;
    past7Days.forEach(dateStr => {
      const dayOfWeek = new Date(dateStr).getDay();
      if (habit.frequency ? habit.frequency.includes(dayOfWeek) : true) {
        const entry = habit.entries.find(e => e.date === dateStr);
        if (!entry || entry.completionPercentage === 0) {
          skippedCount++;
        }
      }
    });
    if (skippedCount > 0) {
      skippedHabits.push({
        id: habit.id,
        title: habit.title,
        color: habit.color,
        skippedCount
      });
    }
  });

  skippedHabits.sort((a, b) => b.skippedCount - a.skippedCount);

  return {
    averageScore,
    bestDay,
    worstDay,
    dailyPerformance,
    topSkipped: skippedHabits.slice(0, 3)
  };
};
