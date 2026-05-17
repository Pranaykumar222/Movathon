import api from "./axios";

export const getHeatmap = () => api.get("/dashboard/heatmap");
export const getStreak = () => api.get("/dashboard/streak");
export const getSummary = () => api.get("/dashboard/summary");
export const getWeeklyReview = () => api.get("/dashboard/weekly");
