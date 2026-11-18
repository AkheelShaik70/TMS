
import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
    getMyTickets,
    updateTicket,
} from "../../services/ticketService";

// Reusable ticket card
function TicketCard({ ticket, ticketUpdates, onFieldChange, onUpdate, updatingId }) {
    const changes = ticketUpdates[ticket.id] || {};
    const isCompleted = ["RESOLVED", "CLOSED"].includes(
        ticket.status?.toUpperCase()
    );

    const statusStyle = {
        OPEN: "bg-blue-500/10 text-blue-400",
        IN_PROGRESS: "bg-yellow-500/10 text-yellow-400",
        RESOLVED: "bg-green-500/10 text-green-400",
        CLOSED: "bg-slate-500/10 text-slate-400",
    };

    return (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 transition hover:border-teal-500/40">

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                    <p className="text-xs font-medium text-teal-400">
                        {ticket.ticketNumber || `Ticket #${ticket.id}`}
                    </p>

                    <h3 className="mt-2 text-lg font-semibold text-white">
                        {ticket.title}
                    </h3>
                </div>

                <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyle[ticket.status?.toUpperCase()] ||
                    "bg-slate-500/10 text-slate-400"
                }`}>
                    {ticket.status?.replace("_", " ") || "UNKNOWN"}
                </span>
            </div>

            <p className="mt-3 text-sm text-slate-400">
                {ticket.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-800 pt-4 text-sm text-slate-400">
                <p>
                    Customer:{" "}
                    <span className="text-slate-200">
                        {ticket.customerName || "N/A"}
                    </span>
                </p>

                <p>
                    Category:{" "}
                    <span className="text-slate-200">
                        {ticket.category || "N/A"}
                    </span>
                </p>

                <p>
                    Priority:{" "}
                    <span className="text-slate-200">
                        {ticket.priority || "N/A"}
                    </span>
                </p>

                <p>
                    Created:{" "}
                    <span className="text-slate-200">
                        {ticket.createdAt
                            ? new Date(ticket.createdAt).toLocaleDateString("en-IN")
                            : "N/A"}
                    </span>
                </p>
            </div>

            {!isCompleted && (
                <>
                    <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-800 pt-5 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Update Status
                            </label>

                            <select
                                value={changes.status || ticket.status || "OPEN"}
                                onChange={(e) =>
                                    onFieldChange(ticket.id, "status", e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-teal-500"
                            >
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Update Priority
                            </label>

                            <select
                                value={changes.priority || ticket.priority || "MEDIUM"}
                                onChange={(e) =>
                                    onFieldChange(ticket.id, "priority", e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-teal-500"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={() => onUpdate(ticket)}
                            disabled={updatingId === ticket.id}
                            className="rounded-xl bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {updatingId === ticket.id ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

function AgentDashboard() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [ticketUpdates, setTicketUpdates] = useState({});

    // Dashboard section selection
    const [activeSection, setActiveSection] = useState("current");

    // Search filters
    const [searchTerm, setSearchTerm] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const fetchTickets = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getMyTickets();
            const ticketList = Array.isArray(data) ? data : [];

            setTickets(ticketList);

            const updates = {};

            ticketList.forEach((ticket) => {
                updates[ticket.id] = {
                    status: ticket.status || "OPEN",
                    priority: ticket.priority || "MEDIUM",
                };
            });

            setTicketUpdates(updates);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load assigned tickets."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleFieldChange = (ticketId, field, value) => {
        setTicketUpdates((previous) => ({
            ...previous,
            [ticketId]: {
                ...previous[ticketId],
                [field]: value,
            },
        }));
    };

    const handleUpdate = async (ticket) => {
        if (["RESOLVED", "CLOSED"].includes(ticket.status?.toUpperCase())) {
            return;
        }

        const changes = ticketUpdates[ticket.id];

        if (!changes) return;

        const payload = {};

        if (changes.status !== ticket.status) {
            payload.status = changes.status;
        }

        if (changes.priority !== ticket.priority) {
            payload.priority = changes.priority;
        }

        if (Object.keys(payload).length === 0) {
            setError("No changes to save.");
            setSuccess("");
            return;
        }

        try {
            setUpdatingId(ticket.id);
            setError("");
            setSuccess("");

            await updateTicket(ticket.id, payload);

            setSuccess(
                `Ticket ${ticket.ticketNumber || ticket.id} updated successfully.`
            );

            await fetchTickets();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to update ticket."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    // Ticket categories
    const activeTickets = tickets.filter(
        (ticket) =>
            !["RESOLVED", "CLOSED"].includes(ticket.status?.toUpperCase())
    );

    const resolvedTickets = tickets.filter(
        (ticket) => ticket.status?.toUpperCase() === "RESOLVED"
    );

    // Admin-assigned tickets only
    const adminAssignedTickets = tickets.filter(
        (ticket) => ticket.assignmentType?.toUpperCase() === "ADMIN_ASSIGNED"
    );

    const adminSolvedTickets = adminAssignedTickets.filter(
        (ticket) => ticket.status?.toUpperCase() === "RESOLVED"
    );

    const adminUnsolvedTickets = adminAssignedTickets.filter(
        (ticket) =>
            !["RESOLVED", "CLOSED"].includes(ticket.status?.toUpperCase())
    );

    const inProgressTickets = tickets.filter(
        (ticket) => ticket.status?.toUpperCase() === "IN_PROGRESS"
    ).length;

    // Search all tickets available to this agent
    const filteredTickets = tickets.filter((ticket) => {
        const search = searchTerm.trim().toLowerCase();

        const searchableDetails = [
            ticket.id,
            ticket.ticketNumber,
            ticket.title,
            ticket.description,
            ticket.customerName,
            ticket.category,
            ticket.assignedAgentName,
            ticket.status,
            ticket.priority,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const matchesSearch =
            !search || searchableDetails.includes(search);

        let matchesDate = true;

        if (fromDate || toDate) {
            if (!ticket.createdAt) {
                matchesDate = false;
            } else {
                const createdDate = new Date(ticket.createdAt);

                if (Number.isNaN(createdDate.getTime())) {
                    matchesDate = false;
                } else {
                    const year = createdDate.getFullYear();
                    const month = String(createdDate.getMonth() + 1).padStart(2, "0");
                    const day = String(createdDate.getDate()).padStart(2, "0");
                    const ticketDate = `${year}-${month}-${day}`;

                    if (fromDate && ticketDate < fromDate) {
                        matchesDate = false;
                    }

                    if (toDate && ticketDate > toDate) {
                        matchesDate = false;
                    }
                }
            }
        }

        return matchesSearch && matchesDate;
    });

    const clearFilters = () => {
        setSearchTerm("");
        setFromDate("");
        setToDate("");
    };

    const hasFilters = searchTerm.trim() || fromDate || toDate;

    // History grouped by resolution date
    const historyGroups = Object.values(
        resolvedTickets.reduce((groups, ticket) => {
            let dateKey = "date-unavailable";
            let dateLabel = "Date unavailable";

            if (ticket.resolvedAt) {
                const date = new Date(ticket.resolvedAt);

                if (!Number.isNaN(date.getTime())) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");

                    dateKey = `${year}-${month}-${day}`;

                    dateLabel = date.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    });
                }
            }

            if (!groups[dateKey]) {
                groups[dateKey] = {
                    dateKey,
                    dateLabel,
                    tickets: [],
                };
            }

            groups[dateKey].tickets.push(ticket);
            return groups;
        }, {})
    ).sort((a, b) => {
        if (a.dateKey === "date-unavailable") return 1;
        if (b.dateKey === "date-unavailable") return -1;
        return b.dateKey.localeCompare(a.dateKey);
    });

    const getAssignmentInfo = (assignmentType) => {
        switch (assignmentType?.toUpperCase()) {
            case "ADMIN_ASSIGNED":
                return {
                    label: "Admin Assigned",
                    style: "bg-blue-500/10 text-blue-400",
                };
            case "AUTO_ASSIGNED":
                return {
                    label: "Auto Assigned",
                    style: "bg-purple-500/10 text-purple-400",
                };
            default:
                return {
                    label: "Not Recorded",
                    style: "bg-slate-500/10 text-slate-400",
                };
        }
    };

    const sections = [
        {
            id: "current",
            title: "Current Assigned Tasks",
            description: "View and manage your active tickets.",
            count: activeTickets.length,
            icon: "📋",
        },
        {
            id: "search",
            title: "Search Tickets",
            description: "Find tickets by details or creation date.",
            count: null,
            icon: "🔍",
        },
        {
            id: "history",
            title: "Ticket History",
            description: "Review completed tickets by resolution date.",
            count: resolvedTickets.length,
            icon: "🕘",
        },
        {
            id: "solved",
            title: "Solved Tickets",
            description: "Admin-assigned tickets that you resolved.",
            count: adminSolvedTickets.length,
            icon: "✅",
        },
        {
            id: "unsolved",
            title: "Unsolved Tickets",
            description: "Admin-assigned tickets still requiring attention.",
            count: adminUnsolvedTickets.length,
            icon: "⏳",
        },
    ];

    const renderTicketList = (ticketList, emptyMessage) => {
        if (ticketList.length === 0) {
            return (
                <div className="rounded-xl border border-dashed border-slate-700 px-4 py-12 text-center">
                    <p className="font-medium text-slate-300">
                        {emptyMessage}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        Try another section or check back later.
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {ticketList.map((ticket) => (
                    <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        ticketUpdates={ticketUpdates}
                        onFieldChange={handleFieldChange}
                        onUpdate={handleUpdate}
                        updatingId={updatingId}
                    />
                ))}
            </div>
        );
    };

    return (
        <DashboardLayout title="Agent Dashboard">

            {/* Welcome */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">
                    Welcome to SupportAI!
                </h1>
                <p className="mt-2 text-slate-400">
                    Your support workspace. Choose an option to manage your tickets.
                </p>
            </div>

            {/* Statistics */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <p className="text-sm text-slate-400">Total Tickets</p>
                    <h2 className="mt-2 text-3xl font-bold text-white">
                        {loading ? "..." : tickets.length}
                    </h2>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <p className="text-sm text-slate-400">In Progress</p>
                    <h2 className="mt-2 text-3xl font-bold text-teal-400">
                        {loading ? "..." : inProgressTickets}
                    </h2>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <p className="text-sm text-slate-400">Resolved</p>
                    <h2 className="mt-2 text-3xl font-bold text-green-400">
                        {loading ? "..." : resolvedTickets.length}
                    </h2>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
                    {success}
                </div>
            )}

            {/* Dashboard Options */}
            <div className="mb-8">
                <h2 className="mb-4 text-lg font-semibold text-white">
                    My Workspace
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            type="button"
                            onClick={() => {
                                setActiveSection(section.id);
                                setError("");
                                setSuccess("");
                            }}
                            className={`rounded-2xl border p-5 text-left transition ${
                                activeSection === section.id
                                    ? "border-teal-500 bg-teal-500/10"
                                    : "border-slate-800 bg-slate-900 hover:border-teal-500/50"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <span className="text-2xl">
                                    {section.icon}
                                </span>

                                {section.count !== null && (
                                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-teal-400">
                                        {loading ? "..." : section.count}
                                    </span>
                                )}
                            </div>

                            <h3 className="mt-4 font-semibold text-white">
                                {section.title}
                            </h3>

                            <p className="mt-2 text-sm text-slate-400">
                                {section.description}
                            </p>

                            <p className="mt-4 text-xs font-semibold text-teal-400">
                                {activeSection === section.id
                                    ? "Currently selected"
                                    : "Click to view →"}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Selected Section Content */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                {loading ? (
                    <p className="py-10 text-center text-teal-400">
                        Loading your tickets...
                    </p>
                ) : (
                    <>
                        {/* Current Assigned Tasks */}
                        {activeSection === "current" && (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-white">
                                        Current Assigned Tasks
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        All active tickets currently available in your agent workspace.
                                    </p>
                                </div>

                                {renderTicketList(
                                    activeTickets,
                                    "No current assigned tasks."
                                )}
                            </>
                        )}

                        {/* Search Tickets */}
                        {activeSection === "search" && (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-white">
                                        Search Tickets
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Search across your available tickets using details and creation dates.
                                    </p>
                                </div>

                                <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                                    <div className="lg:col-span-3">
                                        <label className="mb-2 block text-sm font-medium text-slate-300">
                                            Search ticket details
                                        </label>
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Ticket number, ID, title, description, customer, category..."
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">
                                            From Date
                                        </label>
                                        <input
                                            type="date"
                                            value={fromDate}
                                            max={toDate || undefined}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-teal-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">
                                            To Date
                                        </label>
                                        <input
                                            type="date"
                                            value={toDate}
                                            min={fromDate || undefined}
                                            onChange={(e) => setToDate(e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-teal-500"
                                        />
                                    </div>

                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            disabled={!hasFilters}
                                            className="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-teal-500 hover:text-teal-400 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                </div>

                                <p className="mb-4 text-sm text-slate-400">
                                    Showing{" "}
                                    <span className="font-semibold text-teal-400">
                                        {filteredTickets.length}
                                    </span>{" "}
                                    of {tickets.length} tickets
                                </p>

                                {renderTicketList(
                                    filteredTickets,
                                    "No tickets match your search."
                                )}
                            </>
                        )}

                        {/* Ticket History */}
                        {activeSection === "history" && (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-white">
                                        Ticket History
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        All resolved tickets, organized by resolution date.
                                    </p>
                                </div>

                                {historyGroups.length === 0 ? (
                                    <p className="py-10 text-center text-slate-400">
                                        No resolved ticket history available.
                                    </p>
                                ) : (
                                    <div className="space-y-8">
                                        {historyGroups.map((group) => (
                                            <div key={group.dateKey}>
                                                <div className="mb-4 flex items-center gap-3">
                                                    <div className="h-2 w-2 rounded-full bg-teal-400" />
                                                    <h3 className="font-semibold text-white">
                                                        {group.dateLabel}
                                                    </h3>
                                                    <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-400">
                                                        {group.tickets.length} tickets
                                                    </span>
                                                </div>

                                                <div className="space-y-4 border-l border-slate-700 pl-5">
                                                    {group.tickets.map((ticket) => {
                                                        const assignment = getAssignmentInfo(ticket.assignmentType);
                                                        const resolvedDate = ticket.resolvedAt
                                                            ? new Date(ticket.resolvedAt)
                                                            : null;

                                                        const resolvedTime =
                                                            resolvedDate &&
                                                            !Number.isNaN(resolvedDate.getTime())
                                                                ? resolvedDate.toLocaleTimeString("en-IN", {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })
                                                                : "Time unavailable";

                                                        return (
                                                            <div
                                                                key={ticket.id}
                                                                className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                                                            >
                                                                <p className="text-xs font-medium text-teal-400">
                                                                    {ticket.ticketNumber || `Ticket #${ticket.id}`}
                                                                </p>

                                                                <h4 className="mt-2 font-semibold text-white">
                                                                    {ticket.title}
                                                                </h4>

                                                                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                                                                    <p>
                                                                        Customer:{" "}
                                                                        <span className="text-slate-200">
                                                                            {ticket.customerName || "N/A"}
                                                                        </span>
                                                                    </p>
                                                                    <p>
                                                                        Category:{" "}
                                                                        <span className="text-slate-200">
                                                                            {ticket.category || "N/A"}
                                                                        </span>
                                                                    </p>
                                                                    <p>
                                                                        Priority:{" "}
                                                                        <span className="text-slate-200">
                                                                            {ticket.priority || "N/A"}
                                                                        </span>
                                                                    </p>
                                                                </div>

                                                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
                                                                    <div>
                                                                        <p className="text-xs text-slate-500">
                                                                            Resolution time
                                                                        </p>
                                                                        <p className="mt-1 text-sm text-slate-200">
                                                                            {resolvedTime}
                                                                        </p>
                                                                    </div>

                                                                    <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${assignment.style}`}>
                                                                        {assignment.label}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Solved Admin-assigned Tickets */}
                        {activeSection === "solved" && (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-white">
                                        Solved Tickets
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Resolved tickets assigned to you by an administrator.
                                    </p>
                                </div>

                                {renderTicketList(
                                    adminSolvedTickets,
                                    "No solved admin-assigned tickets found."
                                )}
                            </>
                        )}

                        {/* Unsolved Admin-assigned Tickets */}
                        {activeSection === "unsolved" && (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-white">
                                        Unsolved Tickets
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Active tickets assigned to you by an administrator.
                                    </p>
                                </div>

                                {renderTicketList(
                                    adminUnsolvedTickets,
                                    "No unsolved admin-assigned tickets found."
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

        </DashboardLayout>
    );
}

export default AgentDashboard;
