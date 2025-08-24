import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // Check for a token in local storage (this is where you'd store it after login)
    const token = localStorage.getItem('token');

    // If a token exists, allow access to the requested page.
    // The <Outlet /> component renders the child route element (e.g., <UserDashboard />).
    if (token) {
        return <Outlet />;
    }

    // If no token exists, redirect the user to the /login page.
    // The `replace` prop is used to prevent the user from going "back" to the protected page.
    return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
