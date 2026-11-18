
import api from "./api";

const getAccessToken = () =>
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

const getAuthConfig = () => {
    const token = getAccessToken();

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// Change password for accounts with an existing password
const changePassword = async (currentPassword, newPassword) => {
    const response = await api.put(
        "/auth/change-password",
        {
            currentPassword,
            newPassword,
        },
        getAuthConfig()
    );

    return response.data;
};

// Create password for Google accounts without a password
const createPassword = async (newPassword) => {
    const response = await api.post(
        "/auth/create-password",
        {
            newPassword,
        },
        getAuthConfig()
    );

    return response.data;
};

const changePasswordService = {
    changePassword,
    createPassword,
};

export default changePasswordService;
