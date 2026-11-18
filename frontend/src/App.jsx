
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import GoogleCallback from "./pages/auth/GoogleCallback";
import ResetPassword from "./pages/auth/ResetPassword";
import ForgotPassword from "./pages/auth/ForgotPassword";

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CreateTicket from "./pages/customer/CreateTicket";
import MyTickets from "./pages/customer/MyTickets";
import CustomerFAQs from "./pages/customer/CustomerFAQs";
import CustomerProfile from "./pages/customer/CustomerProfile";

import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentProfile from "./pages/agent/AgentProfile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import FAQManagement from "./pages/admin/FAQManagement";
import AdminProfile from "./pages/admin/AdminProfile";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public Routes */}
                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/oauth2/callback"
                    element={<GoogleCallback />}
                />

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />

                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />

                {/* Customer Routes */}
                <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
                    <Route
                        path="/customer/dashboard"
                        element={<CustomerDashboard />}
                    />

                    <Route
                        path="/customer/create-ticket"
                        element={<CreateTicket />}
                    />

                    <Route
                        path="/customer/my-tickets"
                        element={<MyTickets />}
                    />

                    <Route
                        path="/customer/faqs"
                        element={<CustomerFAQs />}
                    />

                    <Route
                        path="/customer/profile"
                        element={<CustomerProfile />}
                    />
                </Route>

                {/* Agent Routes */}
                <Route element={<ProtectedRoute allowedRoles={["AGENT"]} />}>
                    <Route
                        path="/agent/dashboard"
                        element={<AgentDashboard />}
                    />

                    <Route
                        path="/agent/profile"
                        element={<AgentProfile />}
                    />
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                    <Route
                        path="/admin/dashboard"
                        element={<AdminDashboard />}
                    />

                    <Route
                        path="/admin/faqs"
                        element={<FAQManagement />}
                    />

                    <Route
                        path="/admin/profile"
                        element={<AdminProfile />}
                    />
                </Route>

                {/* 404 */}
                <Route
                    path="*"
                    element={
                        <h1 className="text-white text-2xl text-center mt-20">
                            404 - Page Not Found
                        </h1>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
