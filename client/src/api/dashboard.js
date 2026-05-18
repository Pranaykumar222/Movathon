import api from "./axios";

export const getHeatmap = () => api.get("/dashboard/heatmap");
export const getStreak = () => api.get("/dashboard/streak");
export const getSummary = (params) => api.get("/dashboard/summary", { params });
export const getWeeklyReview = () => api.get("/dashboard/weekly");
