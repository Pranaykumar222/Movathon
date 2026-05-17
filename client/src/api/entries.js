import api from "./axios";

export const markEntry = (data) => api.post("/entries", data);
export const getEntries = (habitId, params) => api.get(`/entries/${habitId}`, { params });