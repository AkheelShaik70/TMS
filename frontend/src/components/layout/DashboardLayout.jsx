
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function DashboardLayout({ title, children }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const role = user?.role?.toUpperCase().replace("ROLE_", "");

    const roleLabel = {
        CUSTOMER: "Customer",
        AGENT: "Support Agent",
        ADMIN: "Administrator",
    };

    const dashboardPath = {
        CUSTOMER: "/customer/dashboard",
        AGENT: "/agent/dashboard",
        ADMIN: "/admin/dashboard",
    }[role];

    const profilePath = {
        CUSTOMER: "/customer/profile",
        AGENT: "/agent/profile",
        ADMIN: "/admin/profile",
    }[role];

    const navLinkStyle = ({ isActive }) =>
        `block rounded-lg px-4 py-3 font-medium transition ${
            isActive
                ? "bg-teal-500/10 text-teal-400"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`;

    return (
        <div className="h-screen overflow-hidden bg-slate-950 text-white flex">

            <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col">

                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-xl">
                        S
                    </div>

                    <div>
                        <h1 className="text-xl font-bold">SupportAI</h1>
                        <p className="text-xs text-slate-400">
                            Ticket Management
                        </p>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-4 mb-8">
                    <p className="text-sm text-slate-400">Logged in as</p>

                    <p className="text-sm font-semibold text-white mt-1 break-all">
                        {user?.email}
                    </p>

                    <span className="inline-block mt-2 text-xs text-teal-400 bg-teal-400/10 px-3 py-1 rounded-full">
                        {roleLabel[role] || role}
                    </span>
                </div>

                <nav className="flex-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">
                        Main Menu
                    </p>

                    {dashboardPath && (
                        <NavLink
                            to={dashboardPath}
                            end
                            className={navLinkStyle}
                        >
                            Dashboard
                        </NavLink>
                    )}

                    {/* My Profile - All Roles */}
                    {profilePath && (
                        <NavLink
                            to={profilePath}
                            className={navLinkStyle}
                        >
                            My Profile
                        </NavLink>
                    )}

                    {/* Customer Navigation */}
                    {role === "CUSTOMER" && (
                        <NavLink
                            to="/customer/faqs"
                            className={navLinkStyle}
                        >
                            FAQ
                        </NavLink>
                    )}

                    {/* Admin FAQ Management */}
                    {role === "ADMIN" && (
                        <NavLink
                            to="/admin/faqs"
                            className={navLinkStyle}
                        >
                            FAQ Management
                        </NavLink>
                    )}
                </nav>

                <button
                    onClick={handleLogout}
                    className="w-full shrink-0 rounded-xl border border-slate-700 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-slate-300 font-medium py-3 transition"
                >
                    Sign Out
                </button>

            </aside>

            <main className="ml-64 flex-1 min-w-0 h-screen overflow-y-auto">

                <header className="sticky top-0 z-30 h-20 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8">
                    <h2 className="text-xl font-semibold">
                        {title || "Dashboard"}
                    </h2>

                    <span className="text-sm text-slate-400">
                        {roleLabel[role] || role}
                    </span>
                </header>

                <section className="p-8">
                    {children}
                </section>

            </main>
        </div>
    );
}

export default DashboardLayout;
