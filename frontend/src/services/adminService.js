
import api from "./api";

// Retrieve the saved JWT token
const getAccessToken = () => {
    return (
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken")
    );
};

// Ensure the admin is authenticated
const getAuthConfig = () => {
    const token = getAccessToken();

    if (!token) {
        throw new Error("Your session has expired. Please log in again.");
    }

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// Create a new agent account
export const createAgent = async (agentData) => {
    const response = await api.post(
        "/admin/agents",
        {
            name: agentData.name,
            email: agentData.email,
            password: agentData.password,
        },
        getAuthConfig()
    );

    return response.data;
};

// Retrieve all agents
export const getAgents = async () => {
    const response = await api.get(
        "/admin/agents",
        getAuthConfig()
    );

    return response.data;
};

// Assign or reassign a ticket manually
export const assignTicket = async (ticketId, agentEmail) => {
    const response = await api.patch(
        `/admin/tickets/${ticketId}/assign`,
        null,
        {
            ...getAuthConfig(),
            params: {
                agentEmail,
            },
        }
    );

    return response.data;
};

// Automatically assign or reassign a ticket
export const autoAssignTicket = async (ticketId) => {
    const response = await api.post(
        `/admin/tickets/${ticketId}/auto-assign`,
        null,
        getAuthConfig()
    );

    return response.data;
};
