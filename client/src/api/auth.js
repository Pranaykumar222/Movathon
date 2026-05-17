import api from "./axios";

export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const googleLogin = (token) => api.post("/auth/google", { token });
export const getMe = () => api.get("/auth/me");