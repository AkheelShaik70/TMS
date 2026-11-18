
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

import {
    getMyTickets,
    updateTicket,
} from "../../services/ticketService";

import {
    createAgent,
    getAgents,
    assignTicket,
    autoAssignTicket,
} from "../../services/adminService";

const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return parsedDate.toLocaleString();
};

const getAssignmentLabel = (type) => {
    if (type === "ADMIN_ASSIGNED") return "Admin Assigned";
    if (type === "AUTO_ASSIGNED") return "Auto Assigned";
    return "Not Recorded";
};

const getPercentage = (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
};

function AdminDashboard() {
    const [activeSection, setActiveSection] = useState("overview");

    const [tickets, setTickets] = useState([]);
    const [agents, setAgents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [agentsLoading, setAgentsLoading] = useState(true);
    const [refreshingDashboard, setRefreshingDashboard] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Selected ticket and editing fields
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [statusDraft, setStatusDraft] = useState("OPEN");
    const [priorityDraft, setPriorityDraft] = useState("MEDIUM");
    const [updatingTicket, setUpdatingTicket] = useState(false);

    const [agentForm, setAgentForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [creatingAgent, setCreatingAgent] = useState(false);
    const [assigningTicket, setAssigningTicket] = useState(false);
    const [autoAssigning, setAutoAssigning] = useState(false);

    const [assignment, setAssignment] = useState({
        ticketId: "",
        agentEmail: "",
    });

    // Ticket management filters
    const [ticketSearch, setTicketSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");
    const [agentFilter, setAgentFilter] = useState("ALL");

    // Load tickets
    const loadTickets = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getMyTickets();
            setTickets(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load tickets."
            );
        } finally {
            setLoading(false);
        }
    };

    // Load agents
    const loadAgents = async () => {
        try {
            setAgentsLoading(true);

            const data = await getAgents();
            setAgents(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load agents."
            );
        } finally {
            setAgentsLoading(false);
        }
    };

    // Load dashboard data
    const refreshDashboard = async () => {
        try {
            setRefreshingDashboard(true);
            await Promise.all([loadTickets(), loadAgents()]);
        } finally {
            setRefreshingDashboard(false);
        }
    };

    useEffect(() => {
        loadTickets();
        loadAgents();
    }, []);

    // Find the currently selected ticket
    const selectedTicket = useMemo(
        () => tickets.find(
            (ticket) => String(ticket.id) === String(selectedTicketId)
        ) || null,
        [tickets, selectedTicketId]
    );

    // Synchronize editing fields with the selected ticket
    useEffect(() => {
        if (selectedTicket) {
            setStatusDraft(selectedTicket.status || "OPEN");
            setPriorityDraft(selectedTicket.priority || "MEDIUM");
        }
    }, [
        selectedTicket?.id,
        selectedTicket?.status,
        selectedTicket?.priority,
    ]);

    // Dashboard analytics
    const analytics = useMemo(() => {
        const totalTickets = tickets.length;

        const openTickets = tickets.filter(
            (ticket) => ticket.status === "OPEN"
        ).length;

        const inProgressTickets = tickets.filter(
            (ticket) => ticket.status === "IN_PROGRESS"
        ).length;

        const resolvedTickets = tickets.filter(
            (ticket) => ticket.status === "RESOLVED"
        ).length;

        const closedTickets = tickets.filter(
            (ticket) => ticket.status === "CLOSED"
        ).length;

        const unassignedTickets = tickets.filter(
            (ticket) => !ticket.assignedAgentId
        ).length;

        const assignedTickets = totalTickets - unassignedTickets;

        const activeTickets = openTickets + inProgressTickets;

        return {
            totalTickets,
            openTickets,
            inProgressTickets,
            resolvedTickets,
            closedTickets,
            totalAgents: agents.length,
            unassignedTickets,
            assignedTickets,
            activeTickets,
            statusBreakdown: [
                {
                    label: "Open",
                    count: openTickets,
                    color: "bg-blue-400",
                    textColor: "text-blue-400",
                },
                {
                    label: "In Progress",
                    count: inProgressTickets,
                    color: "bg-amber-400",
                    textColor: "text-amber-400",
                },
                {
                    label: "Resolved",
                    count: resolvedTickets,
                    color: "bg-teal-400",
                    textColor: "text-teal-400",
                },
                {
                    label: "Closed",
                    count: closedTickets,
                    color: "bg-purple-400",
                    textColor: "text-purple-400",
                },
            ],
        };
    }, [tickets, agents]);

    // Analytics cards
    const statCards = [
        {
            title: "Total Tickets",
            value: analytics.totalTickets,
            description: "All registered tickets",
            color: "text-purple-400",
            icon: "🎫",
            loading: loading,
        },
        {
            title: "Open Tickets",
            value: analytics.openTickets,
            description: "Waiting for attention",
            color: "text-blue-400",
            icon: "📬",
            loading: loading,
        },
        {
            title: "In Progress",
            value: analytics.inProgressTickets,
            description: "Currently being handled",
            color: "text-amber-400",
            icon: "⚙️",
            loading: loading,
        },
        {
            title: "Resolved Tickets",
            value: analytics.resolvedTickets,
            description: "Successfully resolved",
            color: "text-teal-400",
            icon: "✅",
            loading: loading,
        },
        {
            title: "Closed Tickets",
            value: analytics.closedTickets,
            description: "Permanently closed",
            color: "text-purple-300",
            icon: "🔒",
            loading: loading,
        },
        {
            title: "Total Agents",
            value: analytics.totalAgents,
            description: "Registered support agents",
            color: "text-cyan-400",
            icon: "👥",
            loading: agentsLoading,
        },
        {
            title: "Unassigned Tickets",
            value: analytics.unassignedTickets,
            description: "Waiting for agent assignment",
            color: "text-red-400",
            icon: "⚠️",
            loading: loading,
        },
    ];

    // Filter tickets
    const filteredTickets = useMemo(() => {
        const search = ticketSearch.trim().toLowerCase();

        return tickets.filter((ticket) => {
            const matchesSearch =
                !search ||
                ticket.ticketNumber?.toLowerCase().includes(search) ||
                ticket.title?.toLowerCase().includes(search) ||
                ticket.customerName?.toLowerCase().includes(search);

            const matchesStatus =
                statusFilter === "ALL" ||
                ticket.status === statusFilter;

            const matchesPriority =
                priorityFilter === "ALL" ||
                ticket.priority === priorityFilter;

            const matchesAgent =
                agentFilter === "ALL" ||
                (agentFilter === "UNASSIGNED"
                    ? !ticket.assignedAgentId
                    : String(ticket.assignedAgentId) === agentFilter);

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority &&
                matchesAgent
            );
        });
    }, [
        tickets,
        ticketSearch,
        statusFilter,
        priorityFilter,
        agentFilter,
    ]);

    const clearTicketFilters = () => {
        setTicketSearch("");
        setStatusFilter("ALL");
        setPriorityFilter("ALL");
        setAgentFilter("ALL");
    };

    // Open ticket details
    const openTicketDetails = (ticketId) => {
        setSelectedTicketId(ticketId);
        setError("");
        setSuccess("");
    };

    // Return to ticket list
    const closeTicketDetails = () => {
        setSelectedTicketId(null);
    };

    // Update ticket status and priority
    const handleSaveTicketUpdates = async () => {
        if (!selectedTicket) return;

        try {
            setUpdatingTicket(true);
            setError("");
            setSuccess("");

            const updatedTicket = await updateTicket(
                selectedTicket.id,
                {
                    status: statusDraft,
                    priority: priorityDraft,
                }
            );

            setTickets((previousTickets) =>
                previousTickets.map((ticket) =>
                    String(ticket.id) === String(updatedTicket.id)
                        ? updatedTicket
                        : ticket
                )
            );

            setSuccess(
                `Ticket ${updatedTicket.ticketNumber} updated successfully!`
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to update ticket."
            );
        } finally {
            setUpdatingTicket(false);
        }
    };

    // Agent form handling
    const handleAgentChange = (event) => {
        setAgentForm({
            ...agentForm,
            [event.target.name]: event.target.value,
        });
    };

    // Create agent
    const handleCreateAgent = async (event) => {
        event.preventDefault();

        try {
            setCreatingAgent(true);
            setError("");
            setSuccess("");

            const response = await createAgent(agentForm);

            setSuccess(
                `Agent ${response.name} created successfully!`
            );

            setAgentForm({
                name: "",
                email: "",
                password: "",
            });

            await loadAgents();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to create agent."
            );
        } finally {
            setCreatingAgent(false);
        }
    };

    // Assignment form handling
    const handleAssignmentChange = (event) => {
        setAssignment({
            ...assignment,
            [event.target.name]: event.target.value,
        });
    };

    // Manual ticket assignment
    const handleAssignTicket = async (event) => {
        event.preventDefault();

        try {
            setAssigningTicket(true);
            setError("");
            setSuccess("");

            const selectedAgent = agents.find(
                (agent) => agent.email === assignment.agentEmail
            );

            const updatedTicket = await assignTicket(
                assignment.ticketId,
                assignment.agentEmail
            );

            setSuccess(
                `Ticket ${updatedTicket.ticketNumber} assigned to ${selectedAgent?.name || "agent"} successfully!`
            );

            setAssignment({
                ticketId: "",
                agentEmail: "",
            });

            await loadTickets();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to assign ticket."
            );
        } finally {
            setAssigningTicket(false);
        }
    };

    // Automatic ticket assignment
    const handleAutoAssignTicket = async (event) => {
        event.preventDefault();

        try {
            setAutoAssigning(true);
            setError("");
            setSuccess("");

            const updatedTicket = await autoAssignTicket(
                assignment.ticketId
            );

            setSuccess(
                `Ticket ${updatedTicket.ticketNumber} automatically assigned to ${updatedTicket.assignedAgentName || "an agent"} successfully!`
            );

            setAssignment({
                ticketId: "",
                agentEmail: "",
            });

            await loadTickets();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to automatically assign ticket."
            );
        } finally {
            setAutoAssigning(false);
        }
    };

    // Navigation
    const navigateTo = (section) => {
        setActiveSection(section);
        setSelectedTicketId(null);
        setError("");
        setSuccess("");

        if (section === "agents") loadAgents();

        if (section === "tickets" || section === "assignment") {
            loadTickets();
        }
    };

    const navigationCards = [
        {
            id: "overview",
            title: "Dashboard Overview",
            description: "Monitor ticket statistics and system activity.",
            icon: "📊",
        },
        {
            id: "agents",
            title: "Agent Management",
            description: "Create and view support agents.",
            icon: "👤",
        },
        {
            id: "tickets",
            title: "Ticket Management",
            description: "View, search and filter support tickets.",
            icon: "🎫",
        },
        {
            id: "assignment",
            title: "Ticket Assignment",
            description: "Manage manual and automatic assignment.",
            icon: "🔄",
        },
    ];

    const currentTitle = {
        overview: "Dashboard Overview",
        agents: "Agent Management",
        tickets: "Ticket Management",
        assignment: "Ticket Assignment",
    }[activeSection];

    const availableTickets = tickets.filter(
        (ticket) =>
            ticket.status !== "RESOLVED" &&
            ticket.status !== "CLOSED"
    );

    const isTerminalTicket =
        selectedTicket &&
        ["RESOLVED", "CLOSED"].includes(selectedTicket.status);

    const hasTicketChanges =
        selectedTicket &&
        (
            statusDraft !== selectedTicket.status ||
            priorityDraft !== selectedTicket.priority
        );

    return (
        <DashboardLayout title="Admin Dashboard">
            {/* Page Heading */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">
                    Welcome to SupportAI Admin!
                </h1>

                <p className="text-slate-400 mt-2">
                    Monitor your support system and manage administrative operations.
                </p>
            </div>

            {/* Notifications */}
            {error && (
                <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm text-teal-300">
                    {success}
                </div>
            )}

            {/* Dashboard Overview */}
            {activeSection === "overview" ? (
                <>
                    {/* Navigation Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {navigationCards.map((card) => (
                            <button
                                key={card.id}
                                type="button"
                                onClick={() => navigateTo(card.id)}
                                className="text-left bg-slate-900 border border-slate-800 hover:border-teal-500/60 rounded-2xl p-6 transition group"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl">
                                        {card.icon}
                                    </span>

                                    <span className="text-slate-500 group-hover:text-teal-400 transition">
                                        →
                                    </span>
                                </div>

                                <h2 className="text-lg font-semibold text-white mt-5 group-hover:text-teal-300 transition">
                                    {card.title}
                                </h2>

                                <p className="text-sm text-slate-400 mt-2">
                                    {card.description}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* Analytics Section */}
                    <div className="mt-10">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    Support System Analytics
                                </h2>

                                <p className="text-sm text-slate-400 mt-1">
                                    Live overview of tickets and support agents.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={refreshDashboard}
                                disabled={refreshingDashboard}
                                className="rounded-xl border border-slate-700 hover:border-teal-400 text-teal-300 px-4 py-2 text-sm transition disabled:opacity-50"
                            >
                                {refreshingDashboard
                                    ? "Refreshing..."
                                    : "↻ Refresh Dashboard"}
                            </button>
                        </div>

                        {/* Statistic Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                            {statCards.map((stat) => (
                                <div
                                    key={stat.title}
                                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-slate-400">
                                            {stat.title}
                                        </p>

                                        <span className="text-2xl">
                                            {stat.icon}
                                        </span>
                                    </div>

                                    <h3 className={`text-3xl font-bold mt-4 ${stat.color}`}>
                                        {stat.loading ? "..." : stat.value}
                                    </h3>

                                    <p className="text-xs text-slate-500 mt-2">
                                        {stat.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Detailed Analytics */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
                            {/* Ticket Status Distribution */}
                            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-white">
                                        Ticket Status Distribution
                                    </h3>

                                    <p className="text-sm text-slate-400 mt-1">
                                        Breakdown of tickets by current status.
                                    </p>
                                </div>

                                {loading ? (
                                    <p className="text-sm text-slate-400 py-6">
                                        Loading ticket analytics...
                                    </p>
                                ) : analytics.totalTickets === 0 ? (
                                    <p className="text-sm text-slate-400 py-6">
                                        No ticket data available yet.
                                    </p>
                                ) : (
                                    <div className="space-y-6">
                                        {analytics.statusBreakdown.map((item) => {
                                            const percentage = getPercentage(
                                                item.count,
                                                analytics.totalTickets
                                            );

                                            return (
                                                <div key={item.label}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm text-slate-300">
                                                            {item.label}
                                                        </span>

                                                        <span className="text-sm text-slate-400">
                                                            <span className={`font-semibold ${item.textColor}`}>
                                                                {item.count}
                                                            </span>
                                                            {" "}({percentage}%)
                                                        </span>
                                                    </div>

                                                    <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {!loading && analytics.totalTickets > 0 && (
                                    <div className="border-t border-slate-800 mt-7 pt-5 flex items-center justify-between">
                                        <span className="text-sm text-slate-400">
                                            Total Tickets
                                        </span>

                                        <span className="text-lg font-bold text-white">
                                            {analytics.totalTickets}
                                        </span>
                                    </div>
                                )}
                            </section>

                            {/* Assignment Overview */}
                            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-white">
                                        Ticket Assignment Overview
                                    </h3>

                                    <p className="text-sm text-slate-400 mt-1">
                                        Current agent assignment summary.
                                    </p>
                                </div>

                                {loading ? (
                                    <p className="text-sm text-slate-400 py-6">
                                        Loading assignment analytics...
                                    </p>
                                ) : analytics.totalTickets === 0 ? (
                                    <p className="text-sm text-slate-400 py-6">
                                        No ticket assignment data available yet.
                                    </p>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="rounded-xl bg-slate-950 border border-slate-800 p-5">
                                                <p className="text-sm text-slate-400">
                                                    Assigned Tickets
                                                </p>

                                                <h4 className="text-3xl font-bold text-teal-400 mt-3">
                                                    {analytics.assignedTickets}
                                                </h4>

                                                <p className="text-xs text-slate-500 mt-2">
                                                    {getPercentage(
                                                        analytics.assignedTickets,
                                                        analytics.totalTickets
                                                    )}% of all tickets
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-slate-950 border border-slate-800 p-5">
                                                <p className="text-sm text-slate-400">
                                                    Unassigned Tickets
                                                </p>

                                                <h4 className="text-3xl font-bold text-red-400 mt-3">
                                                    {analytics.unassignedTickets}
                                                </h4>

                                                <p className="text-xs text-slate-500 mt-2">
                                                    {getPercentage(
                                                        analytics.unassignedTickets,
                                                        analytics.totalTickets
                                                    )}% of all tickets
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-slate-400">
                                                    Assignment Progress
                                                </span>

                                                <span className="text-sm font-semibold text-teal-300">
                                                    {getPercentage(
                                                        analytics.assignedTickets,
                                                        analytics.totalTickets
                                                    )}%
                                                </span>
                                            </div>

                                            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                                                <div
                                                    className="h-full bg-teal-400 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${getPercentage(
                                                            analytics.assignedTickets,
                                                            analytics.totalTickets
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="border-t border-slate-800 mt-7 pt-5 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-400">
                                            Active Tickets
                                        </p>

                                        <p className="text-xl font-bold text-amber-400 mt-2">
                                            {loading ? "..." : analytics.activeTickets}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-400">
                                            Registered Agents
                                        </p>

                                        <p className="text-xl font-bold text-cyan-400 mt-2">
                                            {agentsLoading ? "..." : analytics.totalAgents}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <p className="text-xs text-slate-500 mt-5">
                            Analytics are calculated from the tickets and agents
                            returned by the backend. Refresh the dashboard to
                            retrieve the latest data.
                        </p>
                    </div>
                </>
            ) : (
                <>
                    {/* Workspace Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <div>
                            <button
                                type="button"
                                onClick={() => navigateTo("overview")}
                                className="text-sm text-teal-400 hover:text-teal-300 mb-3"
                            >
                                ← Back to Dashboard
                            </button>

                            <h2 className="text-xl font-bold text-white">
                                {currentTitle}
                            </h2>
                        </div>
                    </div>

                    {/* Agent Management */}
                    {activeSection === "agents" && (
                        <div className="space-y-6">
                            <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-white">
                                    Register New Agent
                                </h3>

                                <p className="text-sm text-slate-400 mt-2 mb-6">
                                    Create a new support agent account.
                                </p>

                                <form onSubmit={handleCreateAgent} className="space-y-4">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Agent full name"
                                        value={agentForm.name}
                                        onChange={handleAgentChange}
                                        maxLength={120}
                                        required
                                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-teal-400"
                                    />

                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Agent email"
                                        value={agentForm.email}
                                        onChange={handleAgentChange}
                                        maxLength={190}
                                        required
                                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-teal-400"
                                    />

                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Temporary password (minimum 8 characters)"
                                        value={agentForm.password}
                                        onChange={handleAgentChange}
                                        minLength={8}
                                        maxLength={72}
                                        required
                                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-teal-400"
                                    />

                                    <button
                                        type="submit"
                                        disabled={creatingAgent}
                                        className="w-full rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-semibold px-5 py-3 transition"
                                    >
                                        {creatingAgent ? "Creating Agent..." : "Create Agent"}
                                    </button>
                                </form>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">
                                            Registered Agents
                                        </h3>

                                        <p className="text-sm text-slate-400 mt-1">
                                            All support agents registered in SupportAI.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={loadAgents}
                                        disabled={agentsLoading}
                                        className="text-sm text-teal-400 hover:text-teal-300 disabled:opacity-50"
                                    >
                                        {agentsLoading ? "Loading..." : "↻ Refresh"}
                                    </button>
                                </div>

                                {agentsLoading ? (
                                    <p className="text-center text-slate-400 py-8">
                                        Loading agents...
                                    </p>
                                ) : agents.length === 0 ? (
                                    <p className="text-center text-slate-400 py-8">
                                        No agents registered yet.
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[500px] text-left">
                                            <thead>
                                            <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
                                                <th className="py-4 pr-4">ID</th>
                                                <th className="py-4 pr-4">Name</th>
                                                <th className="py-4 pr-4">Email</th>
                                                <th className="py-4">Role</th>
                                            </tr>
                                            </thead>

                                            <tbody>
                                            {agents.map((agent) => (
                                                <tr
                                                    key={agent.id}
                                                    className="border-b border-slate-800/70 text-sm"
                                                >
                                                    <td className="py-4 pr-4 text-slate-400">
                                                        {agent.id}
                                                    </td>
                                                    <td className="py-4 pr-4 text-white font-medium">
                                                        {agent.name}
                                                    </td>
                                                    <td className="py-4 pr-4 text-slate-300">
                                                        {agent.email}
                                                    </td>
                                                    <td className="py-4 text-teal-300">
                                                        {agent.role}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Ticket Management */}
                    {activeSection === "tickets" && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            {selectedTicket ? (
                                /* Ticket Details View */
                                <div>
                                    <button
                                        type="button"
                                        onClick={closeTicketDetails}
                                        className="text-sm text-teal-400 hover:text-teal-300 mb-6"
                                    >
                                        ← Back to Tickets
                                    </button>

                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                                        <div>
                                            <p className="text-sm text-teal-400 font-medium">
                                                {selectedTicket.ticketNumber}
                                            </p>

                                            <h3 className="text-2xl font-bold text-white mt-2">
                                                {selectedTicket.title}
                                            </h3>

                                            <p className="text-sm text-slate-400 mt-2">
                                                Complete ticket information
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs text-blue-300">
                                                {selectedTicket.status}
                                            </span>

                                            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs text-amber-300">
                                                {selectedTicket.priority}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Description */}
                                        <section className="rounded-xl bg-slate-950 border border-slate-800 p-5">
                                            <h4 className="text-sm font-semibold text-teal-300 mb-3">
                                                Ticket Description
                                            </h4>

                                            <p className="text-sm text-slate-300 leading-7 whitespace-pre-wrap break-words">
                                                {selectedTicket.description || "No description provided."}
                                            </p>
                                        </section>

                                        {/* Ticket and people information */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <section className="rounded-xl bg-slate-950 border border-slate-800 p-5">
                                                <h4 className="text-sm font-semibold text-teal-300 mb-4">
                                                    Ticket Information
                                                </h4>

                                                <div className="space-y-4 text-sm">
                                                    <div>
                                                        <p className="text-slate-500">Ticket ID</p>
                                                        <p className="text-white mt-1">
                                                            {selectedTicket.id}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-slate-500">Category</p>
                                                        <p className="text-white mt-1">
                                                            {selectedTicket.category || "Not available"}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-slate-500">Priority</p>
                                                        <p className="text-white mt-1">
                                                            {selectedTicket.priority || "Not available"}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-slate-500">Status</p>
                                                        <p className="text-white mt-1">
                                                            {selectedTicket.status || "Not available"}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-slate-500">Assignment Type</p>
                                                        <p className="text-teal-300 mt-1">
                                                            {getAssignmentLabel(selectedTicket.assignmentType)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </section>

                                            <section className="rounded-xl bg-slate-950 border border-slate-800 p-5">
                                                <h4 className="text-sm font-semibold text-teal-300 mb-4">
                                                    People
                                                </h4>

                                                <div className="space-y-4 text-sm">
                                                    <div>
                                                        <p className="text-slate-500">Customer</p>
                                                        <p className="text-white mt-1">
                                                            {selectedTicket.customerName || "Unknown"}
                                                        </p>
                                                        <p className="text-slate-500 text-xs mt-1">
                                                            Customer ID: {selectedTicket.customerId ?? "Not available"}
                                                        </p>
                                                    </div>

                                                    <div className="border-t border-slate-800 pt-4">
                                                        <p className="text-slate-500">Assigned Agent</p>
                                                        <p className="text-white mt-1">
                                                            {selectedTicket.assignedAgentName || "Unassigned"}
                                                        </p>
                                                        <p className="text-slate-500 text-xs mt-1">
                                                            Agent ID: {selectedTicket.assignedAgentId ?? "Not assigned"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>

                                        {/* Admin Ticket Update */}
                                        <section className="rounded-xl bg-slate-950 border border-slate-800 p-5">
                                            <h4 className="text-sm font-semibold text-teal-300 mb-3">
                                                Manage Ticket
                                            </h4>

                                            <p className="text-sm text-slate-400 mb-5">
                                                Update the ticket status or priority.
                                            </p>

                                            {isTerminalTicket ? (
                                                <p className="text-sm text-amber-300">
                                                    This ticket is {selectedTicket.status.toLowerCase()}.
                                                    Further modifications are not permitted.
                                                </p>
                                            ) : (
                                                <>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label
                                                                htmlFor="admin-ticket-status"
                                                                className="block text-sm text-slate-400 mb-2"
                                                            >
                                                                Ticket Status
                                                            </label>

                                                            <select
                                                                id="admin-ticket-status"
                                                                value={statusDraft}
                                                                onChange={(event) =>
                                                                    setStatusDraft(event.target.value)
                                                                }
                                                                disabled={updatingTicket}
                                                                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white outline-none focus:border-teal-400 disabled:opacity-50"
                                                            >
                                                                <option value="OPEN">Open</option>
                                                                <option value="IN_PROGRESS">In Progress</option>
                                                                <option value="RESOLVED">Resolved</option>
                                                                <option value="CLOSED">Closed</option>
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label
                                                                htmlFor="admin-ticket-priority"
                                                                className="block text-sm text-slate-400 mb-2"
                                                            >
                                                                Ticket Priority
                                                            </label>

                                                            <select
                                                                id="admin-ticket-priority"
                                                                value={priorityDraft}
                                                                onChange={(event) =>
                                                                    setPriorityDraft(event.target.value)
                                                                }
                                                                disabled={updatingTicket}
                                                                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white outline-none focus:border-teal-400 disabled:opacity-50"
                                                            >
                                                                <option value="LOW">Low</option>
                                                                <option value="MEDIUM">Medium</option>
                                                                <option value="HIGH">High</option>
                                                                <option value="URGENT">Urgent</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={handleSaveTicketUpdates}
                                                        disabled={
                                                            updatingTicket ||
                                                            !hasTicketChanges
                                                        }
                                                        className="w-full sm:w-auto mt-5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold px-6 py-3 transition"
                                                    >
                                                        {updatingTicket
                                                            ? "Saving Changes..."
                                                            : "Save Changes"}
                                                    </button>
                                                </>
                                            )}
                                        </section>

                                        {/* Timeline */}
                                        <section className="rounded-xl bg-slate-950 border border-slate-800 p-5">
                                            <h4 className="text-sm font-semibold text-teal-300 mb-4">
                                                Ticket Timeline
                                            </h4>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                                                <div>
                                                    <p className="text-slate-500">Created At</p>
                                                    <p className="text-white mt-1">
                                                        {formatDate(selectedTicket.createdAt)}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-slate-500">Last Updated</p>
                                                    <p className="text-white mt-1">
                                                        {formatDate(selectedTicket.updatedAt)}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-slate-500">Resolved At</p>
                                                    <p className="text-white mt-1">
                                                        {formatDate(selectedTicket.resolvedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={closeTicketDetails}
                                        className="mt-6 rounded-xl border border-slate-700 hover:border-teal-400 text-teal-300 px-5 py-3 text-sm font-semibold transition"
                                    >
                                        ← Back to Tickets
                                    </button>
                                </div>
                            ) : (
                                /* Ticket List View */
                                <>
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">
                                                All Support Tickets
                                            </h3>

                                            <p className="text-sm text-slate-400 mt-1">
                                                Search, filter and select a ticket to view its details.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={loadTickets}
                                            disabled={loading}
                                            className="rounded-xl border border-slate-700 hover:border-teal-400 text-slate-300 px-4 py-2 text-sm transition"
                                        >
                                            {loading ? "Loading..." : "↻ Refresh"}
                                        </button>
                                    </div>

                                    {/* Search and Filters */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
                                        <input
                                            type="search"
                                            value={ticketSearch}
                                            onChange={(event) => setTicketSearch(event.target.value)}
                                            placeholder="Search ticket, title, customer..."
                                            className="sm:col-span-2 xl:col-span-1 w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-teal-400"
                                        />

                                        <select
                                            value={statusFilter}
                                            onChange={(event) => setStatusFilter(event.target.value)}
                                            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white outline-none focus:border-teal-400"
                                        >
                                            <option value="ALL">All Statuses</option>
                                            <option value="OPEN">Open</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="RESOLVED">Resolved</option>
                                            <option value="CLOSED">Closed</option>
                                        </select>

                                        <select
                                            value={priorityFilter}
                                            onChange={(event) => setPriorityFilter(event.target.value)}
                                            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white outline-none focus:border-teal-400"
                                        >
                                            <option value="ALL">All Priorities</option>
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                            <option value="URGENT">Urgent</option>
                                        </select>

                                        <select
                                            value={agentFilter}
                                            onChange={(event) => setAgentFilter(event.target.value)}
                                            disabled={agentsLoading}
                                            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white outline-none focus:border-teal-400"
                                        >
                                            <option value="ALL">All Agents</option>
                                            <option value="UNASSIGNED">Unassigned</option>

                                            {agents.map((agent) => (
                                                <option key={agent.id} value={String(agent.id)}>
                                                    {agent.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                                        <p className="text-sm text-slate-400">
                                            Showing{" "}
                                            <span className="text-teal-300 font-semibold">
                                                {filteredTickets.length}
                                            </span>{" "}
                                            of {tickets.length} tickets
                                        </p>

                                        <button
                                            type="button"
                                            onClick={clearTicketFilters}
                                            className="text-sm text-teal-400 hover:text-teal-300"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>

                                    {loading ? (
                                        <p className="text-center text-slate-400 py-10">
                                            Loading tickets...
                                        </p>
                                    ) : filteredTickets.length === 0 ? (
                                        <p className="text-center text-slate-400 py-10">
                                            No tickets match your search or filters.
                                        </p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[850px] text-left">
                                                <thead>
                                                <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
                                                    <th className="py-4 pr-4">Ticket</th>
                                                    <th className="py-4 pr-4">Customer</th>
                                                    <th className="py-4 pr-4">Agent</th>
                                                    <th className="py-4 pr-4">Status</th>
                                                    <th className="py-4 pr-4">Priority</th>
                                                    <th className="py-4">Assignment</th>
                                                </tr>
                                                </thead>

                                                <tbody>
                                                {filteredTickets.map((ticket) => (
                                                    <tr
                                                        key={ticket.id}
                                                        onClick={() => openTicketDetails(ticket.id)}
                                                        onKeyDown={(event) => {
                                                            if (event.key === "Enter" || event.key === " ") {
                                                                event.preventDefault();
                                                                openTicketDetails(ticket.id);
                                                            }
                                                        }}
                                                        tabIndex={0}
                                                        role="button"
                                                        aria-label={`View details for ${ticket.ticketNumber}`}
                                                        className="border-b border-slate-800/70 text-sm cursor-pointer hover:bg-slate-800/50 focus:outline-none focus:bg-slate-800/50 transition"
                                                    >
                                                        <td className="py-4 pr-4">
                                                            <p className="text-teal-300 font-medium">
                                                                {ticket.ticketNumber}
                                                            </p>
                                                            <p className="text-slate-400 mt-1">
                                                                {ticket.title}
                                                            </p>
                                                        </td>

                                                        <td className="py-4 pr-4 text-slate-300">
                                                            {ticket.customerName || "Unknown"}
                                                        </td>

                                                        <td className="py-4 pr-4 text-slate-300">
                                                            {ticket.assignedAgentName || "Unassigned"}
                                                        </td>

                                                        <td className="py-4 pr-4 text-slate-300">
                                                            {ticket.status}
                                                        </td>

                                                        <td className="py-4 pr-4 text-slate-300">
                                                            {ticket.priority}
                                                        </td>

                                                        <td className="py-4">
                                                                <span className="text-xs text-teal-300">
                                                                    {getAssignmentLabel(ticket.assignmentType)}
                                                                </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    <p className="text-xs text-slate-500 mt-5">
                                        Select any ticket row to view its complete details.
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Ticket Assignment */}
                    {activeSection === "assignment" && (
                        <div className="space-y-6">
                            {/* Manual Assignment */}
                            <div className="bg-slate-900 border border-teal-500/30 rounded-2xl p-6">
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                    <h3 className="text-lg font-semibold text-white">
                                        Manual Assignment
                                    </h3>

                                    <span className="text-xs font-semibold text-teal-300 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full">
                                        Available Now
                                    </span>
                                </div>

                                <p className="text-sm text-slate-400 mb-6">
                                    Select a ticket and assign or reassign it to an existing support agent.
                                </p>

                                <form onSubmit={handleAssignTicket} className="space-y-4 max-w-2xl">
                                    <select
                                        name="ticketId"
                                        value={assignment.ticketId}
                                        onChange={handleAssignmentChange}
                                        required
                                        disabled={loading}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white outline-none focus:border-teal-400"
                                    >
                                        <option value="">Select a ticket</option>

                                        {availableTickets.map((ticket) => (
                                            <option key={ticket.id} value={ticket.id}>
                                                {ticket.ticketNumber} - {ticket.title}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        name="agentEmail"
                                        value={assignment.agentEmail}
                                        onChange={handleAssignmentChange}
                                        required
                                        disabled={agentsLoading || agents.length === 0}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white outline-none focus:border-teal-400"
                                    >
                                        <option value="">Select an agent</option>

                                        {agents.map((agent) => (
                                            <option key={agent.id} value={agent.email}>
                                                {agent.name} ({agent.email})
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        type="submit"
                                        disabled={assigningTicket || loading || agentsLoading || agents.length === 0}
                                        className="w-full rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-semibold px-5 py-3 transition"
                                    >
                                        {assigningTicket ? "Assigning..." : "Assign / Reassign Ticket"}
                                    </button>
                                </form>
                            </div>

                            {/* Automatic Assignment */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                    <h3 className="text-lg font-semibold text-white">
                                        Automatic Assignment
                                    </h3>

                                    <span className="text-xs font-semibold text-teal-300 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full">
                                        Backend Connected
                                    </span>
                                </div>

                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Automatically assign or reassign a selected ticket
                                    to an agent based on active ticket workload.
                                </p>

                                <form onSubmit={handleAutoAssignTicket} className="mt-5 space-y-4 max-w-2xl">
                                    <select
                                        name="ticketId"
                                        value={assignment.ticketId}
                                        onChange={handleAssignmentChange}
                                        required
                                        disabled={loading}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white outline-none focus:border-teal-400"
                                    >
                                        <option value="">Select a ticket</option>

                                        {availableTickets.map((ticket) => (
                                            <option key={ticket.id} value={ticket.id}>
                                                {ticket.ticketNumber} - {ticket.title}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        type="submit"
                                        disabled={autoAssigning || loading}
                                        className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-teal-400 disabled:opacity-50 text-teal-300 font-semibold px-5 py-3 transition"
                                    >
                                        {autoAssigning
                                            ? "Assigning..."
                                            : "Automatically Assign Ticket"}
                                    </button>
                                </form>

                                <p className="text-xs text-slate-500 mt-4">
                                    The backend selects an agent based on active ticket count
                                    and uses agent ID as a tie-breaker.
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </DashboardLayout>
    );
}

export default AdminDashboard;
