
import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ChangePasswordForm from "../../components/profile/ChangePasswordForm";
import {
    getProfile,
    updateProfile,
} from "../../services/profileService";

function AdminProfile() {
    const [profile, setProfile] = useState(null);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getProfile();

            setProfile(response.data);
            setName(response.data.name || "");
        } catch (err) {
            console.error("Failed to load admin profile:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load your profile. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleEdit = () => {
        setName(profile?.name || "");
        setIsEditing(true);
        setError("");
        setSuccess("");
    };

    const handleSave = async (e) => {
        e.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) {
            setError("Name cannot be empty.");
            return;
        }

        if (trimmedName.length > 120) {
            setError("Name cannot exceed 120 characters.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response = await updateProfile({
                name: trimmedName,
            });

            setProfile(response.data);
            setName(response.data.name);
            setIsEditing(false);

            setSuccess("Your profile has been updated successfully.");
        } catch (err) {
            console.error("Failed to update admin profile:", err);

            setError(
                err.response?.data?.message ||
                "Unable to update your profile. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setName(profile?.name || "");
        setIsEditing(false);
        setError("");
        setSuccess("");
    };

    return (
        <DashboardLayout title="My Profile">
            <div className="min-h-full bg-slate-950">
                <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white">
                            My Profile
                        </h1>

                        <p className="mt-2 text-slate-400">
                            View and manage your administrator account information.
                        </p>
                    </div>

                    {loading ? (
                        <div className="py-16 text-center text-slate-400">
                            Loading your profile...
                        </div>
                    ) : error && !profile ? (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-400">
                            {error}

                            <button
                                type="button"
                                onClick={loadProfile}
                                className="mt-3 block text-sm underline"
                            >
                                Try again
                            </button>
                        </div>
                    ) : profile ? (
                        <>
                            {/* Admin Profile Information Card */}
                            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

                                <div className="border-b border-slate-800 p-6 sm:p-8">
                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10">
                                            <span className="text-3xl font-bold text-teal-400">
                                                {profile.name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-semibold text-white">
                                                {profile.name}
                                            </h2>

                                            <p className="mt-1 text-slate-400">
                                                {profile.email}
                                            </p>

                                            <span className="mt-3 inline-block rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium text-teal-400">
                                                {profile.role}
                                            </span>
                                        </div>

                                    </div>
                                </div>

                                <div className="p-6 sm:p-8">

                                    {success && (
                                        <div className="mb-6 rounded-xl border border-teal-500/20 bg-teal-500/10 p-4 text-sm text-teal-400">
                                            {success}
                                        </div>
                                    )}

                                    {error && (
                                        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSave}>
                                        <div className="space-y-6">

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                                    Full Name
                                                </label>

                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    disabled={!isEditing || saving}
                                                    maxLength={120}
                                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white transition focus:border-teal-500 focus:outline-none disabled:cursor-not-allowed disabled:text-slate-400"
                                                    placeholder="Enter your full name"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                                    Email Address
                                                </label>

                                                <input
                                                    type="email"
                                                    value={profile.email || ""}
                                                    disabled
                                                    className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-500"
                                                />

                                                <p className="mt-2 text-xs text-slate-500">
                                                    Your registered email cannot be changed here.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                                        Account Role
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={profile.role || ""}
                                                        disabled
                                                        className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                                        Login Provider
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={profile.authProvider || ""}
                                                        disabled
                                                        className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-500"
                                                    />
                                                </div>

                                            </div>
                                        </div>

                                        <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-800 pt-6">

                                            {!isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={handleEdit}
                                                    className="rounded-xl bg-teal-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-teal-400"
                                                >
                                                    Edit Profile
                                                </button>
                                            )}

                                            {isEditing && (
                                                <>
                                                    <button
                                                        type="submit"
                                                        disabled={saving}
                                                        className="rounded-xl bg-teal-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-teal-400 disabled:opacity-50"
                                                    >
                                                        {saving ? "Saving..." : "Save Changes"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={handleCancel}
                                                        disabled={saving}
                                                        className="rounded-xl bg-slate-800 px-6 py-3 font-medium text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}

                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Admin Change Password Section */}
                            <ChangePasswordForm
                                role={profile.role}
                                requiredRole="ADMIN"
                            />
                        </>
                    ) : null}

                </div>
            </div>
        </DashboardLayout>
    );
}

export default AdminProfile;
