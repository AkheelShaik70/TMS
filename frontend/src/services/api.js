
import axios from "axios";

const configuredBackendUrl = (
    import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/+$/, "");

export const API_BASE_URL = configuredBackendUrl.endsWith("/api")
    ? configuredBackendUrl
    : `${configuredBackendUrl}/api`;

export const BACKEND_URL = API_BASE_URL.replace(/\/api$/, "");

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

export default api;
