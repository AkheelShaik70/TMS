
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import api from "../../services/api";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!token) {
            setError("Invalid or missing password reset token.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/auth/reset-password", {
                token,
                newPassword,
            });

            setSuccess(
                response.data || "Password has been reset successfully."
            );

            setNewPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Password reset failed. Your token may be invalid or expired."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full max-w-md mx-auto">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Reset Password
                </h1>

                <p className="text-slate-400 mb-8">
                    Create a new password for your account.
                </p>

                {error && (
                    <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-5 rounded-lg border border-teal-500/30 bg-teal-500/10 p-3 text-sm text-teal-300">
                        {success}
                    </div>
                )}

                {!token ? (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                        Invalid or missing reset token. Please request a new password reset.
                        <Link
                            to="/forgot-password"
                            className="mt-3 block font-medium text-teal-400 hover:text-teal-300"
                        >
                            Request New Reset Link
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm text-slate-300 mb-2">
                                New Password
                            </label>

                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                minLength={8}
                                required
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-teal-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-300 mb-2">
                                Confirm New Password
                            </label>

                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                minLength={8}
                                required
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-teal-500"
                            />
                        </div>

                        <label className="flex items-center gap-2 text-sm text-slate-400">
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={(e) => setShowPassword(e.target.checked)}
                                className="accent-teal-500"
                            />
                            Show password
                        </label>

                        <button
                            type="submit"
                            disabled={loading || !!success}
                            className="w-full rounded-lg bg-teal-500 py-3 font-semibold text-slate-950 transition hover:bg-teal-400 disabled:opacity-50"
                        >
                            {loading ? "Updating Password..." : "Update Password"}
                        </button>
                    </form>
                )}

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

export default ResetPassword;
