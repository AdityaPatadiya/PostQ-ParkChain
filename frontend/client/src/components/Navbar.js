import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import './Navbar.css';

function Navbar() {
  const [user, setUser] = React.useState(null);
  const [role, setRole] = React.useState('guest'); // guest | user | admin
  const navigate = useNavigate();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setRole(data.role || 'user');
          } else {
            setRole('user'); // Default if no role
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
          setRole('user');
        }
      } else {
        setUser(null);
        setRole('guest');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        alert('Logged out');
        navigate('/');
      });
  };

  const renderNavLinks = () => {
    if (role === 'guest') {
      return (
        <>
          <li className="nav-item">
            <Link className="nav-link nav-anim" to="/">Home</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link nav-anim" to="/login">Login</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link nav-anim" to="/register">Register</Link>
          </li>
        </>
      );
    }

    if (role === 'user') {
      return (
        <>

          <li className="nav-item">
            <Link className="nav-link nav-anim" to="/userhome">Home</Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link nav-anim" to="/mapview">Map</Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link nav-anim" to="/user-dashboard">User Dashboard</Link>
          </li>
           <li className="nav-item">
            <Link className="nav-link nav-anim" to="/checkout">Payment</Link>
          </li>

          {/* First letter of user's email */}
          {user && (
            <li className="nav-item d-flex align-items-center mx-2">
              <span className="user-initial-circle">
                {user.email.charAt(0).toUpperCase()}
              </span>
            </li>
          )}

          <li className="nav-item">
            <button className="btn btn-outline-light logout-btn" onClick={handleLogout}>Logout</button>
          </li>
        </>
      );
    }

    if (role === 'admin') {
      return (
        <>
          <li className="nav-item">
            <Link className="nav-link nav-anim" to="/admin-dashboard">Admin Panel</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link nav-anim" to="/user-management">User Management</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link nav-anim" to="/admin-scanner">scanner</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link nav-anim" to="/exit-scanner">Exit Scanner</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link nav-anim" to="/payment-dashboard">Payment Dashboard</Link>  
          </li>
           <li className="nav-item">
            <button className="btn btn-outline-light logout-btn" onClick={handleLogout}>Logout</button>
          </li>
        </>
      );
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar px-4 shadow">
      <Link className="navbar-brand brand-text" to="/">Smart Parking</Link>

      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          {renderNavLinks()}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;


