import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import '../css/UserHome.css';

function UserHome() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch booking history from Firestore
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);

        const bookingData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBookings(bookingData);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="user-home container mt-4">
      {/* Profile Info */}
      {user && (
        <div className="profile-card shadow p-4 mb-4">
          <h2>Welcome, {user.displayName || user.email}</h2>
          <p>Email: {user.email}</p>
        </div>
      )}

      {/* Booking History */}
      <div className="history-card shadow p-4">
        <h3>Your Booking History</h3>
        {bookings.length > 0 ? (
          <table className="table table-striped mt-3">
            <thead>
              <tr>
                <th>Date</th>
                <th>Location</th>
                <th>Slot</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.date}</td>
                  <td>
                    {booking.location?.lat && booking.location?.lng
                      ? `${booking.location.lat}, ${booking.location.lng}`
                      : 'N/A'}
                  </td>
                  <td>{booking.slotNumber}</td>
                  <td>${booking.price}</td>
                  <td>{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-muted mt-3">No bookings found.</p>
        )}
      </div>
    </div>
  );
}

export default UserHome;
