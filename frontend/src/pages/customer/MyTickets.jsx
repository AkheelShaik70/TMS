
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getMyTickets } from "../../services/ticketService";

function MyTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getMyTickets();
                setTickets(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Unable to load your tickets."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    const getStatusStyle = (status) => {
        switch (status?.toUpperCase()) {
            case "OPEN":
                return "bg-blue-500/10 text-blue-400";
            case "IN_PROGRESS":
                return "bg-yellow-500/10 text-yellow-400";
            case "RESOLVED":
                return "bg-green-500/10 text-green-400";
            case "CLOSED":
                return "bg-slate-500/10 text-slate-400";
            default:
                return "bg-slate-500/10 text-slate-400";
        }
    };

    return (
        <DashboardLayout title="My Tickets">

            {/* Header */}
            <div className="mb-8">

                <Link
                    to="/customer/dashboard"
                    className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-teal-400 transition hover:text-teal-300"
                >
                    ← Back to Dashboard
                </Link>

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            My Support Tickets
                        </h1>

                        <p className="mt-2 text-sm text-slate-400">
                            View and track all your support requests.
                        </p>
                    </div>

                    <Link
                        to="/customer/create-ticket"
                        className="rounded-xl bg-teal-500 px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-teal-400"
                    >
                        + Create New Ticket
                    </Link>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-teal-400">
                    Loading your tickets...
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && tickets.length === 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
                    <h2 className="text-lg font-semibold text-white">
                        No tickets found
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        You haven't created any support tickets yet.
                    </p>

                    <Link
                        to="/customer/create-ticket"
                        className="mt-5 inline-block rounded-xl bg-teal-500 px-5 py-3 font-semibold text-slate-950 hover:bg-teal-400"
                    >
                        Create Your First Ticket
                    </Link>
                </div>
            )}

            {/* Ticket List */}
            {!loading && !error && tickets.length > 0 && (
                <div className="space-y-4">

                    {tickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700 sm:p-6"
                        >
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-teal-400">
                                        {ticket.ticketNumber || `Ticket #${ticket.id}`}
                                    </p>

                                    <h2 className="mt-2 text-lg font-semibold text-white">
                                        {ticket.title}
                                    </h2>

                                    <p className="mt-2 text-sm text-slate-400">
                                        {ticket.description}
                                    </p>
                                </div>

                                <span
                                    className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(ticket.status)}`}
                                >
                                    {ticket.status?.replace("_", " ") || "UNKNOWN"}
                                </span>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-800 pt-4 text-sm text-slate-400">

                                <p>
                                    Category:{" "}
                                    <span className="text-slate-200">
                                        {ticket.category}
                                    </span>
                                </p>

                                <p>
                                    Priority:{" "}
                                    <span className="text-slate-200">
                                        {ticket.priority}
                                    </span>
                                </p>

                                <p>
                                    Assigned Agent:{" "}
                                    <span className="text-slate-200">
                                        {ticket.assignedAgentName || "Not assigned"}
                                    </span>
                                </p>

                                <p>
                                    Created:{" "}
                                    <span className="text-slate-200">
                                        {ticket.createdAt
                                            ? new Date(ticket.createdAt).toLocaleDateString()
                                            : "N/A"}
                                    </span>
                                </p>

                            </div>
                        </div>
                    ))}

                </div>
            )}

        </DashboardLayout>
    );
}

export default MyTickets;
