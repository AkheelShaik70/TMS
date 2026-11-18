
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    // Redirect users who are not logged in
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // Normalize the role received from the backend
    const userRole = user.role?.toUpperCase().replace("ROLE_", "");

    // Check whether the user's role is permitted
    if (allowedRoles && !allowedRoles.includes(userRole)) {

        // Redirect to the user's own dashboard
        switch (userRole) {
            case "CUSTOMER":
                return <Navigate to="/customer/dashboard" replace />;

            case "AGENT":
                return <Navigate to="/agent/dashboard" replace />;

            case "ADMIN":
                return <Navigate to="/admin/dashboard" replace />;

            default:
                return <Navigate to="/login" replace />;
        }
    }

    // Allow authorized users to access the requested page
    return <Outlet />;
}

export default ProtectedRoute;
