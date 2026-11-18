
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const GoogleCallback = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState("");

    useEffect(() => {
        const processGoogleLogin = () => {
            const params = new URLSearchParams(
                window.location.hash.substring(1)
            );

            const accessToken = params.get("accessToken");
            const email = params.get("email");
            const role = params.get("role");

            // Clear sensitive authentication data from the URL
            window.history.replaceState(
                null,
                document.title,
                window.location.pathname
            );

            if (!accessToken || !email || !role) {
                setError("Google authentication failed. Please try again.");
                return;
            }

            const normalizedRole = role
                .toUpperCase()
                .replace("ROLE_", "");

            const dashboardRoutes = {
                CUSTOMER: "/customer/dashboard",
                AGENT: "/agent/dashboard",
                ADMIN: "/admin/dashboard",
            };

            const dashboardPath = dashboardRoutes[normalizedRole];

            if (!dashboardPath) {
                setError("Invalid user role. Please contact support.");
                return;
            }

            // Use existing AuthContext authentication mechanism
            login(
                {
                    accessToken,
                    email,
                    role: normalizedRole,
                },
                true
            );

            navigate(dashboardPath, { replace: true });
        };

        processGoogleLogin();
    }, [login, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">

                {error ? (
                    <>
                        <h2 className="text-xl font-semibold text-red-400">
                            Authentication Failed
                        </h2>

                        <p className="mt-3 text-sm text-slate-300">
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                navigate("/login", { replace: true })
                            }
                            className="mt-6 rounded-lg bg-teal-600 px-5 py-2.5 font-medium text-white hover:bg-teal-500"
                        >
                            Back to Login
                        </button>
                    </>
                ) : (
                    <>
                        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-teal-400" />

                        <h2 className="text-xl font-semibold text-white">
                            Signing you in...
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                            Please wait while we complete your login.
                        </p>
                    </>
                )}

            </div>
        </div>
    );
};

export default GoogleCallback;
