import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

//import Home from './pages/UserHome';
import Login from './pages/Login';
import Register from './pages/Register';
import MapView from './pages/MapView';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import UserHome from './pages/UserHome';
import UserManagement from './pages/UserManagement';
 // Assuming you have a Home component

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/userhome" element={<UserHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mapview" element={<MapView />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/user-management" element={<UserManagement />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;


// <Route path="/home" element={<Home />} />