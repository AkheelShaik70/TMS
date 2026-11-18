
import api from "./api";

// Retrieve the saved JWT token
const getAccessToken = () => {
    return (
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken")
    );
};

// Create a ticket for the logged-in customer
export const createTicket = async (ticketData) => {
    const token = getAccessToken();

    if (!token) {
        throw new Error("Your session has expired. Please log in again.");
    }

    const response = await api.post(
        "/tickets/self",
        {
            title: ticketData.title,
            description: ticketData.description,
            category: ticketData.category,
            priority: ticketData.priority || "MEDIUM",
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

// Retrieve tickets for the logged-in user
export const getMyTickets = async () => {
    const token = getAccessToken();

    if (!token) {
        throw new Error("Your session has expired. Please log in again.");
    }

    const response = await api.get("/tickets", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};

// Retrieve a specific ticket
export const getTicketById = async (ticketId) => {
    const token = getAccessToken();

    if (!token) {
        throw new Error("Your session has expired. Please log in again.");
    }

    const response = await api.get(`/tickets/${ticketId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};


// Update ticket status and/or priority
export const updateTicket = async (ticketId, ticketData) => {
    const token = getAccessToken();

    if (!token) {
        throw new Error("Your session has expired. Please log in again.");
    }

    const response = await api.patch(
        `/tickets/${ticketId}`,
        ticketData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};
