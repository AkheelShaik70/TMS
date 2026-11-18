
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
    getAllFAQs,
    createFAQ,
    publishFAQ,
    unpublishFAQ,
    deleteFAQ,
} from "../../services/faqService";

function FAQManagement() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [busyFaqId, setBusyFaqId] = useState(null);
    const [deletingFaqId, setDeletingFaqId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        question: "",
        answer: "",
        category: "",
    });

    const loadFAQs = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getAllFAQs();
            setFaqs(response.data || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load FAQs. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFAQs();
    }, []);

    const categories = useMemo(
        () => [...new Set(faqs.map((faq) => faq.category).filter(Boolean))],
        [faqs]
    );

    const filteredFAQs = useMemo(() => {
        return faqs.filter((faq) => {
            const searchText = search.toLowerCase();

            const matchesSearch =
                faq.question?.toLowerCase().includes(searchText) ||
                faq.answer?.toLowerCase().includes(searchText);

            const matchesCategory =
                categoryFilter === "ALL" ||
                faq.category === categoryFilter;

            return matchesSearch && matchesCategory;
        });
    }, [faqs, search, categoryFilter]);

    const publishedCount = faqs.filter(
        (faq) => faq.published
    ).length;

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData({
            question: "",
            answer: "",
            category: "",
        });

        setShowForm(false);
    };

    const handleCreateFAQ = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            await createFAQ({
                question: formData.question.trim(),
                answer: formData.answer.trim(),
                category: formData.category.trim(),
            });

            resetForm();
            setSuccess("FAQ created successfully.");

            await loadFAQs();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to create FAQ. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleTogglePublish = async (faq) => {
        try {
            setBusyFaqId(faq.id);
            setError("");
            setSuccess("");

            if (faq.published) {
                await unpublishFAQ(faq.id);
                setSuccess("FAQ unpublished successfully.");
            } else {
                await publishFAQ(faq.id);
                setSuccess("FAQ published successfully.");
            }

            await loadFAQs();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update FAQ publishing status."
            );
        } finally {
            setBusyFaqId(null);
        }
    };

    // Delete an FAQ regardless of its publishing status
    const handleDeleteFAQ = async (faq) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete this FAQ?\n\n${faq.question}`
        );

        if (!confirmed) return;

        try {
            setDeletingFaqId(faq.id);
            setError("");
            setSuccess("");

            await deleteFAQ(faq.id);

            setSuccess("FAQ deleted successfully.");
            await loadFAQs();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete FAQ. Please try again."
            );
        } finally {
            setDeletingFaqId(null);
        }
    };

    const cardStyle =
        "rounded-xl border border-slate-700/70 bg-slate-900/80 p-5 shadow-sm";

    const inputStyle =
        "w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-900/40";

    return (
        <DashboardLayout title="FAQ Management">
            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">
                            FAQ Management
                        </h1>

                        <p className="mt-1 text-sm text-slate-400">
                            Manage frequently asked questions for your customers.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={loadFAQs}
                            disabled={loading}
                            className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                        >
                            Refresh
                        </button>

                        <button
                            onClick={() => {
                                setShowForm(!showForm);
                                setError("");
                                setSuccess("");
                            }}
                            className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600"
                        >
                            {showForm ? "Close Form" : "+ Add New FAQ"}
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                {error && (
                    <div className="rounded-lg border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-lg border border-teal-800/60 bg-teal-950/30 p-4 text-sm text-teal-300">
                        {success}
                    </div>
                )}

                {/* Create FAQ Form */}
                {showForm && (
                    <div className={cardStyle}>
                        <h2 className="mb-5 text-lg font-semibold text-slate-100">
                            Create New FAQ
                        </h2>

                        <form onSubmit={handleCreateFAQ} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Question
                                </label>

                                <input
                                    type="text"
                                    name="question"
                                    value={formData.question}
                                    onChange={handleInputChange}
                                    maxLength={500}
                                    required
                                    placeholder="Enter the frequently asked question"
                                    className={inputStyle}
                                />

                                <p className="mt-1 text-right text-xs text-slate-500">
                                    {formData.question.length}/500
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Answer
                                </label>

                                <textarea
                                    name="answer"
                                    value={formData.answer}
                                    onChange={handleInputChange}
                                    required
                                    rows={5}
                                    placeholder="Enter the answer"
                                    className={`${inputStyle} resize-y`}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Category
                                </label>

                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    maxLength={80}
                                    required
                                    placeholder="Example: Account, Payments, Tickets"
                                    className={inputStyle}
                                />

                                <p className="mt-1 text-right text-xs text-slate-500">
                                    {formData.category.length}/80
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    disabled={saving}
                                    className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : "Create FAQ"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className={cardStyle}>
                        <p className="text-sm text-slate-400">Total FAQs</p>
                        <p className="mt-2 text-3xl font-bold text-slate-100">
                            {loading ? "..." : faqs.length}
                        </p>
                    </div>

                    <div className={cardStyle}>
                        <p className="text-sm text-slate-400">Published FAQs</p>
                        <p className="mt-2 text-3xl font-bold text-teal-400">
                            {loading ? "..." : publishedCount}
                        </p>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        type="text"
                        placeholder="Search questions or answers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={inputStyle}
                    />

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className={`${inputStyle} sm:max-w-64`}
                    >
                        <option value="ALL">All Categories</option>

                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* FAQ List */}
                {loading ? (
                    <div className={`${cardStyle} py-10 text-center`}>
                        <p className="text-sm text-slate-400">
                            Loading FAQs...
                        </p>
                    </div>
                ) : filteredFAQs.length === 0 ? (
                    <div className={`${cardStyle} py-10 text-center`}>
                        <h3 className="font-semibold text-slate-200">
                            No FAQs found
                        </h3>

                        <p className="mt-2 text-sm text-slate-400">
                            {faqs.length === 0
                                ? "No FAQs have been created yet."
                                : "Try changing your search or category filter."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredFAQs.map((faq) => (
                            <div
                                key={faq.id}
                                className={`${cardStyle} transition hover:border-slate-600`}
                            >
                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-slate-100">
                                            {faq.question}
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            {faq.answer}
                                        </p>
                                    </div>

                                    <span
                                        className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                                            faq.published
                                                ? "bg-teal-950/60 text-teal-300"
                                                : "bg-amber-950/40 text-amber-300"
                                        }`}
                                    >
                                        {faq.published ? "Published" : "Unpublished"}
                                    </span>
                                </div>

                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/70 pt-4">
                                    <span className="text-xs font-medium text-slate-400">
                                        Category: {faq.category || "Uncategorized"}
                                    </span>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => handleTogglePublish(faq)}
                                            disabled={
                                                busyFaqId === faq.id ||
                                                deletingFaqId === faq.id
                                            }
                                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                                faq.published
                                                    ? "border border-amber-700/60 text-amber-300 hover:bg-amber-950/40"
                                                    : "bg-teal-700 text-white hover:bg-teal-600"
                                            }`}
                                        >
                                            {busyFaqId === faq.id
                                                ? "Updating..."
                                                : faq.published
                                                    ? "Unpublish"
                                                    : "Publish"}
                                        </button>

                                        <button
                                            onClick={() => handleDeleteFAQ(faq)}
                                            disabled={
                                                deletingFaqId === faq.id ||
                                                busyFaqId === faq.id
                                            }
                                            className="rounded-lg border border-red-800/70 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {deletingFaqId === faq.id
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default FAQManagement;
