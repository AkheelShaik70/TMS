
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Please enter your email and password.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            setLoading(true);

            const response = await loginUser({
                email: email.trim(),
                password,
            });

            if (!response.accessToken || !response.role) {
                throw new Error("Invalid login response from server.");
            }

            const role = response.role.toUpperCase().replace("ROLE_", "");

            if (!["CUSTOMER", "AGENT", "ADMIN"].includes(role)) {
                throw new Error("Your account has an unrecognized role.");
            }

            login(
                {
                    accessToken: response.accessToken,
                    role,
                    email: response.email || email.trim(),
                },
                rememberMe
            );

            switch (role) {
                case "CUSTOMER":
                    navigate("/customer/dashboard", { replace: true });
                    break;

                case "AGENT":
                    navigate("/agent/dashboard", { replace: true });
                    break;

                case "ADMIN":
                    navigate("/admin/dashboard", { replace: true });
                    break;

                default:
                    break;
            }

        } catch (err) {
            const status = err.response?.status;

            if (status === 401 || status === 403) {
                setError("Invalid email or password. Please try again.");
            } else {
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Login failed. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // Start Google OAuth authentication
    const handleGoogleLogin = () => {
        setError("");

        window.location.assign(
            "http://localhost:8080/oauth2/authorization/google"
        );
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to continue to your account."
        >
            <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email address
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={loading}
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-300">
                            Password
                        </label>

                        <Link
                            to="/forgot-password"
                            className="text-sm text-teal-400 hover:text-teal-300"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            disabled={loading}
                            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 pr-20 text-white placeholder-slate-500 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-teal-400 hover:text-teal-300"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="rememberMe"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={loading}
                        className="h-4 w-4 accent-teal-500 cursor-pointer"
                    />

                    <label
                        htmlFor="rememberMe"
                        className="text-sm text-slate-400 cursor-pointer"
                    >
                        Remember me
                    </label>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
                    >
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-semibold py-3 transition duration-200"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-700"></div>
                    <span className="text-xs text-slate-500">
                        OR CONTINUE WITH
                    </span>
                    <div className="flex-1 h-px bg-slate-700"></div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full rounded-xl border border-slate-700 hover:bg-slate-800 text-white font-medium py-3 transition"
                >
                    <span className="mr-2 font-bold">G</span>
                    Continue with Google
                </button>

                <p className="text-center text-sm text-slate-400 pt-2">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-teal-400 font-medium hover:text-teal-300"
                    >
                        Create account
                    </Link>
                </p>

            </form>
        </AuthLayout>
    );
}

export default Login;
