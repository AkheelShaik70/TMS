
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { registerUser } from "../../services/authService";
import { BACKEND_URL } from "../../services/api";

function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Google OAuth login and registration
    const handleGoogleLogin = () => {
        setError("");
        window.location.assign(
            `${BACKEND_URL}/oauth2/authorization/google`
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (formData.password.length < 8 || formData.password.length > 72) {
            setError("Password must contain between 8 and 72 characters.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            await registerUser({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });

            setSuccess("Account created successfully! You can now sign in.");

            setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
            });
        } catch (err) {
            const message =
                err.response?.data?.message ||
                "Registration failed. Please try again.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Join SupportAI and get started with smarter customer support."
        >
            <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                        Full Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        maxLength={100}
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                        Email Address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        maxLength={190}
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            autoComplete="new-password"
                            maxLength={72}
                            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 pr-20 text-white placeholder-slate-500 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-teal-400"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            autoComplete="new-password"
                            maxLength={72}
                            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 pr-20 text-white placeholder-slate-500 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-teal-400"
                        >
                            {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                {error && (
                    <div role="alert" className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {success && (
                    <div role="status" className="rounded-lg bg-teal-500/10 border border-teal-500/20 px-4 py-3 text-sm text-teal-400">
                        {success}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-semibold py-3 transition"
                >
                    {loading ? "Creating account..." : "Create Account"}
                </button>

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-700" />
                    <span className="text-xs text-slate-500">OR CONTINUE WITH</span>
                    <div className="flex-1 h-px bg-slate-700" />
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
                    Already have an account?{" "}
                    <Link to="/login" className="text-teal-400 font-medium hover:text-teal-300">
                        Sign in
                    </Link>
                </p>

            </form>
        </AuthLayout>
    );
}

export default Register;
