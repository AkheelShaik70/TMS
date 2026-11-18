
import api from "./api";

const getAccessToken = () =>
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${getAccessToken()}`,
    },
});

export const getProfile = () =>
    api.get("/profile", getAuthConfig());

export const updateProfile = (profileData) =>
    api.put("/profile", profileData, getAuthConfig());
