import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        const token = authService.getToken();

        if (currentUser && token) {
            setUser(currentUser);
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    // Login function - uses backend API
    const login = async (email, password) => {
        try {
            const result = await authService.login(email, password);

            if (result.success) {
                setUser(result.user);
                setIsAuthenticated(true);
            }

            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Logout function
    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    // Set user after successful OTP verification during signup
    const setAuthUser = (userData, token) => {
        if (token) {
            localStorage.setItem('factsscan_token', token);
        }
        localStorage.setItem('factsscan_user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        setAuthUser,
        authService // Expose authService for signup, OTP verification, etc.
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
