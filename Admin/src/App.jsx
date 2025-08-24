import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ManageUsersPage from "./pages/ManageUsersPage";
import ModelTraining from "./pages/ModelTraining";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/users" replace />} />
        <Route path="/admin/users" element={<ManageUsersPage />} />
        <Route path="/admin/model-training" element={<ModelTraining />} />

      </Routes>
    </Router>
  );
}

export default App;
