import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Components
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';
import UserLoans from './pages/UserLoans';
import UserProfile from './pages/UserProfile';
import PredictionForm from './pages/PredictionForm';
import Login from './pages/Auth/Login'; // Make sure this file exists

// This component now defines the application's routes
const App = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            {/* Private Routes wrapped in Layout */}
            <Route element={<Layout />}>
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/loans" element={<UserLoans />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/predict" element={<PredictionForm />} />
            </Route>
        </Routes>
    );
};

export default App;





