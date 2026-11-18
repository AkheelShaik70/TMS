
import api from "./api";

// Register a new customer
export const registerUser = async (userData) => {
    const response = await api.post("/auth/register", {
        name: userData.name,
        email: userData.email,
        password: userData.password,
    });

    return response.data;
};

// Login an existing user
export const loginUser = async (credentials) => {
    const response = await api.post("/auth/login", {
        email: credentials.email,
        password: credentials.password,
    });

    return response.data;
};
