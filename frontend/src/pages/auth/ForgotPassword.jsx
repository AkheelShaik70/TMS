
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import api from "../../services/api";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await api.post("/auth/forgot-password", {
                email: email.trim(),
            });

            setMessage(
                response.data ||
                "If an account exists with this email, password reset instructions will be provided."
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to process your request. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full max-w-md mx-auto">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Forgot Password?
                </h1>

                <p className="text-slate-400 mb-8">
                    Enter your registered email address to request a password reset.
                </p>

                {message && (
                    <div className="mb-5 rounded-lg border border-teal-500/30 bg-teal-500/10 p-3 text-sm text-teal-300">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm text-slate-300 mb-2">
                            Email Address
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your registered email"
                            required
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-teal-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-teal-500 py-3 font-semibold text-slate-950 transition hover:bg-teal-400 disabled:opacity-50"
                    >
                        {loading ? "Sending Request..." : "Reset Password"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-400">
                    Remember your password?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-teal-400 hover:text-teal-300"
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}

export default ForgotPassword;
