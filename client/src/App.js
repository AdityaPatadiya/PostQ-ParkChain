import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import MapView from './pages/MapView';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<h1 className="text-center mt-5">Welcome to Smart Parking 🚗</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mapview" element={<MapView />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
