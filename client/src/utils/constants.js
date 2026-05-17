export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5123/api";

export const HEATMAP_COLORS = {
  0: "bg-[#161b22]",
  1: "bg-[#9be9a8]",
  2: "bg-[#40c463]",
  3: "bg-[#30a14e]",
  4: "bg-[#216e39]",
};

export const HABIT_TYPES = [
  { value: "YES_NO", label: "Done / not done", helper: "For binary habits like gym, meditation, or no sugar." },
  { value: "NUMBER", label: "Count something", helper: "For steps, pages, glasses of water, reps, or problems solved." },
  { value: "TIME", label: "Track time", helper: "For sleep, deep work, workouts, reading, or coding minutes." },
];

export const HABIT_COLORS = [
  "#22c55e", // green
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
];
