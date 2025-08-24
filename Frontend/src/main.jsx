import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import AppRoutes from './AppRoutes';
import { AuthProvider } from './context/AuthContext'; // <-- Import AuthProvider
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* <-- Wrap AppRoutes with AuthProvider */}
        <AppRoutes />
        <ToastContainer theme="colored" position="bottom-right" autoClose={5000} />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
