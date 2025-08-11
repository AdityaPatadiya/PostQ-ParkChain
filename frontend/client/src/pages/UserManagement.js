// src/pages/UserManagement.js
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "../css/UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users")); // Adjust collection name if different
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="user-management">
      <h1>User Management</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Joined Date</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.fullName || "N/A"}</td>
                <td>{user.email || "N/A"}</td>
                <td>{user.phone || "N/A"}</td>
                <td>{user.role || "User"}</td>
                <td>
                  {user.createdAt?.toDate
                    ? user.createdAt.toDate().toLocaleDateString()
                    : "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
