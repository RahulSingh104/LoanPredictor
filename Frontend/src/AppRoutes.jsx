import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Components
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';
import UserLoans from './pages/UserLoans';
import UserProfile from './pages/UserProfile';
import PredictionForm from './pages/PredictionForm';
import Login from './pages/Auth/Login'; 
import Register from './pages/Auth/Register';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path='/Register' element={<Register/>} />

            {/* Routes inside the main application layout */}
            <Route element={<Layout />}>
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/loans" element={<UserLoans />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/predict" element={<PredictionForm />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
