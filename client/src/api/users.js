import api from "./axios";

export const getPublicProfile = (username) => api.get(`/users/${username}/public`);
export const deleteAccount = () => api.delete("/users/me");
