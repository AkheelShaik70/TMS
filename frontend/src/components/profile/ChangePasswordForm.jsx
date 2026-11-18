
import { useEffect, useState } from "react";
import changePasswordService from "../../services/changePasswordService";
import { getProfile } from "../../services/profileService";

function ChangePasswordForm({ role, requiredRole }) {
    const [isOpen, setIsOpen] = useState(false);
    const [hasPassword, setHasPassword] = useState(null);
    const [authProvider, setAuthProvider] = useState("");

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPasswords, setShowPasswords] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const isAuthorized = role === requiredRole;
    const isCreateMode =
        authProvider === "GOOGLE" && hasPassword === false;

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await getProfile();
                const profile = response.data;

                setAuthProvider(
                    (profile.authProvider || "").toUpperCase()
                );

                setHasPassword(profile.hasPassword === true);
            } catch (err) {
                setError("Unable to load password settings. Please refresh the page.");
            } finally {
                setLoadingProfile(false);
            }
        };

        loadProfile();
    }, []);

    const handleOpen = () => {
        setError("");
        setSuccess("");

        if (!isAuthorized) {
            setError("You are not authorized to manage this password.");
            return;
        }

        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);

        setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

        setShowPasswords(false);
        setError("");
        setSuccess("");
    };

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!isAuthorized) {
            setError("You are not authorized to perform this action.");
            return;
        }

        if (!isCreateMode && !formData.currentPassword.trim()) {
            setError("Please enter your current password.");
            return;
        }

        if (
            formData.newPassword.length < 8 ||
            formData.newPassword.length > 100
        ) {
            setError("Password must contain between 8 and 100 characters.");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("New password and confirmation do not match.");
            return;
        }

        if (
            !isCreateMode &&
            formData.currentPassword === formData.newPassword
        ) {
            setError("New password must be different from the current password.");
            return;
        }

        try {
            setLoading(true);

            let response;

            if (isCreateMode) {
                response = await changePasswordService.createPassword(
                    formData.newPassword
                );

                setHasPassword(true);
                setSuccess(
                    response?.message || "Password created successfully. You can now change it whenever needed."
                );
            } else {
                response = await changePasswordService.changePassword(
                    formData.currentPassword,
                    formData.newPassword
                );

                setSuccess(
                    response?.message || "Password changed successfully."
                );
            }

            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setShowPasswords(false);
            setIsOpen(false);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                `Unable to ${isCreateMode ? "create" : "change"} password. Please try again.`
            );
        } finally {
            setLoading(false);
        }
    };

    if (loadingProfile) {
        return (
            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
                <p className="text-sm text-slate-400">
                    Loading password settings...
                </p>
            </div>
        );
    }

    return (
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div>
                    <h2 className="text-xl font-semibold text-white">
                        {isCreateMode ? "Create Password" : "Change Password"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        {isCreateMode
                            ? "Create a password to also sign in using your email address."
                            : "Update your account password to keep your account secure."}
                    </p>
                </div>

                {!isOpen ? (
                    <button
                        type="button"
                        onClick={handleOpen}
                        className="px-5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-xl transition"
                    >
                        {isCreateMode ? "Create Password" : "Change Password"}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                )}

            </div>

            {error && (
                <div
                    role="alert"
                    className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="mt-5 rounded-xl border border-teal-500/20 bg-teal-500/10 p-4 text-sm text-teal-400"
                >
                    {success}
                </div>
            )}

            {isOpen && isAuthorized && (
                <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-5">

                    {!isCreateMode && (
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Current Password
                            </label>

                            <input
                                type={showPasswords ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                autoComplete="current-password"
                                required
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-teal-500"
                                placeholder="Enter current password"
                            />
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            {isCreateMode ? "Create Password" : "New Password"}
                        </label>

                        <input
                            type={showPasswords ? "text" : "password"}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={100}
                            required
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-teal-500"
                            placeholder="Enter password"
                        />

                        <p className="mt-2 text-xs text-slate-500">
                            Password must be between 8 and 100 characters.
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Confirm Password
                        </label>

                        <input
                            type={showPasswords ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                            required
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-teal-500"
                            placeholder="Confirm password"
                        />
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-400">
                        <input
                            type="checkbox"
                            checked={showPasswords}
                            onChange={(e) => setShowPasswords(e.target.checked)}
                            className="h-4 w-4 accent-teal-500"
                        />
                        Show passwords
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-xl bg-teal-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Please wait..."
                            : isCreateMode
                                ? "Create Password"
                                : "Update Password"}
                    </button>

                </form>
            )}

        </div>
    );
}

export default ChangePasswordForm;
