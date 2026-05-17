import api from "./axios";

export const getPublicProfile = (username) => api.get(`/users/${username}/public`);
