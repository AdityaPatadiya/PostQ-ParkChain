import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './Navbar.css'; // Make sure this path matches your project

function Navbar() {
  const [user, setUser] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setUser(user));
    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        alert("Logged out");
        navigate('/login');
      });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar px-4 shadow">
      <Link className="navbar-brand brand-text" to="/">Smart Parking</Link>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span className="navbar-toggler-icon"></span>
      </button>
      
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link className="nav-link nav-anim" to="/">Home</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link nav-anim" to="/mapview">Map</Link>
          </li>
          {user && user.email !== 'admin@admin.com' && (
            <li className="nav-item">
              <Link className="nav-link nav-anim" to="/user-dashboard">User Dashboard</Link>
            </li>
          )}
          {user && user.email === 'admin@admin.com' && (
            <li className="nav-item">
              <Link className="nav-link nav-anim" to="/admin-dashboard">Admin Panel</Link>
            </li>
          )}
        </ul>

        <ul className="navbar-nav">
          {!user ? (
            <>
              <li className="nav-item">
                <Link className="nav-link nav-anim" to="/login">Login</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link nav-anim" to="/register">Register</Link>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <button className="btn btn-outline-light logout-btn" onClick={handleLogout}>Logout</button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
