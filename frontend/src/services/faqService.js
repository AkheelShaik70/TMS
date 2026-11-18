
import api from "./api";

const getAccessToken = () =>
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${getAccessToken()}`,
    },
});

// Customer, Agent, and Admin: View published FAQs
export const getPublishedFAQs = (category) =>
    api.get("/faqs", {
        ...getAuthConfig(),
        params: category ? { category } : {},
    });

// Admin: View all FAQs, including unpublished FAQs
export const getAllFAQs = () =>
    api.get("/admin/faqs", getAuthConfig());

// Admin: View one FAQ
export const getFAQById = (id) =>
    api.get(`/admin/faqs/${id}`, getAuthConfig());

// Admin: Create FAQ
export const createFAQ = (faqData) =>
    api.post("/admin/faqs", faqData, getAuthConfig());

// Admin: Update FAQ
export const updateFAQ = (id, faqData) =>
    api.put(`/admin/faqs/${id}`, faqData, getAuthConfig());

// Admin: Publish FAQ
export const publishFAQ = (id) =>
    api.patch(`/admin/faqs/${id}/publish`, {}, getAuthConfig());

// Admin: Unpublish FAQ
export const unpublishFAQ = (id) =>
    api.patch(`/admin/faqs/${id}/unpublish`, {}, getAuthConfig());

// Admin: Delete FAQ
export const deleteFAQ = (id) =>
    api.delete(`/admin/faqs/${id}`, getAuthConfig());
