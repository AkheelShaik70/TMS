
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createTicket } from "../../services/ticketService";

function CreateTicket() {
    const navigate = useNavigate();
    const location = useLocation();
    const initialIssue = location.state?.initialIssue || "";
    const chatTranscript = location.state?.chatTranscript || "";

    const [formData, setFormData] = useState({
        title: initialIssue.slice(0, 150),
        description: chatTranscript.slice(0, 2000) || initialIssue,
        category: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(null);

        try {
            setLoading(true);

            const createdTicket = await createTicket(formData);

            setSuccess(createdTicket);

            setFormData({
                title: "",
                description: "",
                category: "",
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to create your ticket. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 text-white">
            <div className="mx-auto max-w-3xl">

                <Link
                    to="/customer/dashboard"
                    className="mb-6 inline-block text-sm text-teal-400 hover:text-teal-300"
                >
                    ← Back to Dashboard
                </Link>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8">

                    <h1 className="text-2xl font-bold">
                        Create Support Ticket
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Describe your issue and our support team will assist you.
                    </p>

                    {error && (
                        <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mt-5 rounded-lg border border-teal-500/30 bg-teal-500/10 p-4">
                            <p className="font-semibold text-teal-400">
                                Ticket created successfully!
                            </p>

                            <p className="mt-1 text-sm text-slate-300">
                                Ticket Number: {success.ticketNumber || success.id}
                            </p>

                            <button
                                onClick={() => navigate("/customer/dashboard")}
                                className="mt-3 text-sm font-medium text-teal-400 hover:text-teal-300"
                            >
                                Return to Dashboard →
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">

                        {/* Ticket Title */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Ticket Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                maxLength={150}
                                required
                                placeholder="Briefly describe your issue"
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-teal-500"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                maxLength={2000}
                                required
                                rows={5}
                                placeholder="Explain your issue in detail..."
                                className="w-full resize-y rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-teal-500"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Category
                            </label>

                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-teal-500"
                            >
                                <option value="">
                                    Select a category
                                </option>

                                <option value="Account">Account</option>
                                <option value="Technical">Technical</option>
                                <option value="Billing">Billing</option>
                                <option value="General">General</option>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-teal-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Creating Ticket..." : "Submit Ticket"}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateTicket;
