import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '../components/Navbar'; // make sure the path is correct
import '../css/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      } else {
        alert("No user data found in Firestore.");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
  {/* Now navbar is visible on login page */}
      <div className="login-overlay">
        <div className="login-popup">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              className="form-control mb-3"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="form-control mb-3"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button className="btn btn-success" type="submit">Login</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
