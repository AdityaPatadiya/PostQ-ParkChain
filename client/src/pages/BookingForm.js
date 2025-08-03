import React, { useState, useEffect, useRef } from "react";
import { collection, addDoc, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import emailjs from "@emailjs/browser";


const BookingForm = ({ plot, onClose }) => {
  const [form, setForm] = useState({
    slotType: "compact",
    reservedFor: "general",
    date: "",
    time: "",
    duration: "",
  });

  const [userData, setUserData] = useState({ email: "", name: "" });
  const formRef = useRef();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            email: user.email,
            name: data.name || "", // Assumes 'name' field exists
          });
        }
      }
    };
    fetchUserDetails();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const isOverlap = (t1, t2, d1, d2) => {
    const s1 = toMinutes(t1), e1 = s1 + d1 * 60;
    const s2 = toMinutes(t2), e2 = s2 + d2 * 60;
    return Math.max(s1, s2) < Math.min(e1, e2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { slotType, reservedFor, date, time, duration } = form;
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in.");

    const snapshot = await getDocs(
      query(
        collection(db, "bookings"),
        where("plotId", "==", plot.id),
        where("slotType", "==", slotType),
        where("reservedFor", "==", reservedFor),
        where("date", "==", date)
      )
    );

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (isOverlap(data.time, time, Number(data.duration), Number(duration))) {
        return alert("Slot already booked at that time.");
      }
    }

    await addDoc(collection(db, "bookings"), {
      ...form,
      userId: user.uid,
      userEmail: user.email,
      plotId: plot.id,
      plotName: plot.plotName,
      location: plot.location,
      createdAt: new Date(),
    });

    // 🔔 Send email using EmailJS
    try {
      await emailjs.send("service_lzcft4a", "template_6b0423i", {
        name: userData.name,
        email: userData.email,
        slot: slotType,
        reservedFor,
        date,
        time,
        duration,
        plotName: plot.plotName,
      }, "FeYm9Nn9Men4Ayj-C");
      alert("Booking successful and confirmation email sent!");
    } catch (err) {
      console.error("EmailJS Error:", err);
      alert("Booking saved, but email failed to send.");
    }

    onClose();
  };

  return (
    <div style={{ position: "absolute", top: 50, right: 30, background: "white", padding: 20, zIndex: 999 }}>
      <h4>Book at {plot.plotName}</h4>
      <p><strong>Email:</strong> {userData.email || "Not found"}</p>
      <form ref={formRef} onSubmit={handleSubmit}>
        <label>Slot Type</label>
        <select name="slotType" onChange={handleChange} value={form.slotType}>
          <option value="compact">Compact</option>
          <option value="small">Small</option>
          <option value="large">Large</option>
        </select>

        <label>Reserved For</label>
        <select name="reservedFor" onChange={handleChange} value={form.reservedFor}>
          <option value="general">General</option>
          <option value="ev">EV</option>
          <option value="vip">VIP</option>
          <option value="handicap">Handicap</option>
        </select>

        <label>Date</label>
        <input type="date" name="date" onChange={handleChange} required />

        <label>Time</label>
        <input type="time" name="time" onChange={handleChange} required />

        <label>Duration (hr)</label>
        <input type="number" name="duration" min="1" onChange={handleChange} required />

        <button type="submit" className="btn btn-success mt-2">Book</button>
        <button type="button" className="btn btn-secondary mt-2 ms-2" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default BookingForm;
