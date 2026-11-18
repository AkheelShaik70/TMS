
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const AuthContext = createContext(null);

function getStoredUser() {
    const storage = localStorage.getItem("accessToken")
        ? localStorage
        : sessionStorage;

    const token = storage.getItem("accessToken");

    if (!token) {
        return null;
    }

    return {
        accessToken: token,
        role: storage.getItem("userRole"),
        email: storage.getItem("userEmail"),
    };
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(getStoredUser);

    // Synchronize authentication across browser tabs
    useEffect(() => {
        const syncAuth = () => {
            setUser(getStoredUser());
        };

        window.addEventListener("storage", syncAuth);

        return () => {
            window.removeEventListener("storage", syncAuth);
        };
    }, []);

    const login = (authData, rememberMe = false) => {
        const storage = rememberMe ? localStorage : sessionStorage;

        localStorage.removeItem("accessToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");

        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("userRole");
        sessionStorage.removeItem("userEmail");

        storage.setItem("accessToken", authData.accessToken);
        storage.setItem("userRole", authData.role);
        storage.setItem("userEmail", authData.email);

        setUser({
            accessToken: authData.accessToken,
            role: authData.role,
            email: authData.email,
        });
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");

        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("userRole");
        sessionStorage.removeItem("userEmail");

        setUser(null);
    };

    const value = {
        user,
        isAuthenticated: Boolean(user?.accessToken),
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
