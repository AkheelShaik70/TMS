import api from "./api";

function getAccessToken() {
    return localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
}

export async function sendChatMessage(message, history) {
    const token = getAccessToken();
    const response = await api.post(
        "/chat",
        { message, history },
        {
            timeout: 35000,
            headers: token
                ? { Authorization: `Bearer ${token}` }
                : {},
        }
    );

    return response.data.reply;
}
