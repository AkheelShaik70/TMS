
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getMyTickets } from "../../services/ticketService";

function CustomerDashboard() {
    const navigate = useNavigate();

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
                    "Unable to load dashboard statistics."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    const totalTickets = tickets.length;

    const openTickets = tickets.filter(
        (ticket) => ticket.status?.toUpperCase() === "OPEN"
    ).length;

    const resolvedTickets = tickets.filter(
        (ticket) => ticket.status?.toUpperCase() === "RESOLVED"
    ).length;

    return (
        <DashboardLayout title="Customer Dashboard">

            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">
                    Welcome to SupportAI!
                </h1>

                <p className="mt-2 text-slate-400">
                    Manage your support requests and get assistance whenever you need it.
                </p>
            </div>

            {/* Dashboard Statistics */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <p className="text-sm text-slate-400">
                        Total Tickets
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-white">
                        {loading ? "..." : totalTickets}
                    </h2>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <p className="text-sm text-slate-400">
                        Open Tickets
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-teal-400">
                        {loading ? "..." : openTickets}
                    </h2>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <p className="text-sm text-slate-400">
                        Resolved Tickets
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-green-400">
                        {loading ? "..." : resolvedTickets}
                    </h2>
                </div>

            </div>

            {/* Loading and Error Messages */}
            {error && (
                <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Quick Actions */}
            <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h2 className="mb-3 text-lg font-semibold text-white">
                    Quick Actions
                </h2>

                <p className="text-sm text-slate-400">
                    Need help? Create a support ticket or track your existing requests.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">

                    <button
                        type="button"
                        onClick={() => navigate("/customer/create-ticket")}
                        className="rounded-xl bg-teal-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-teal-400"
                    >
                        + Create New Ticket
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/customer/my-tickets")}
                        className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:border-teal-500 hover:text-teal-400"
                    >
                        View My Tickets →
                    </button>

                </div>
            </div>

        </DashboardLayout>
    );
}

export default CustomerDashboard;
