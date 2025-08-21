import React, { useState, useEffect, useRef, useMemo } from "react";
import { collection, addDoc, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import "../css/BookingForm.css";
import { calcTotalPriceINR, getPricePerHour } from "../utils/price";
import { useNavigate } from "react-router-dom";

const BookingForm = ({ plot, onClose }) => {
  const [form, setForm] = useState({
    slotType: "compact",
    reservedFor: "general", // "ev"|"general"|"vip"|"handicap" (vip/handicap fall back to general pricing)
    date: "",
    time: "",
    duration: "",
    vehicleNumber: "",
  });
  const [userData, setUserData] = useState({ email: "", name: "" });
  const formRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({ email: user.email, name: data.name || "" });
        } else {
          setUserData({ email: user.email, name: "" });
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

  const pricePerHour = useMemo(() => getPricePerHour(plot, form.slotType, form.reservedFor), [plot, form.slotType, form.reservedFor]);
  const totalINR = useMemo(() => calcTotalPriceINR(plot, form.slotType, form.reservedFor, form.duration), [plot, form.slotType, form.reservedFor, form.duration]);

  const handleProceed = async (e) => {
    e.preventDefault();
    const { slotType, reservedFor, date, time, duration, vehicleNumber } = form;
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in.");

    if (!vehicleNumber.trim()) return alert("Vehicle number is required.");
    if (!date || !time || !duration) return alert("Please fill all date/time fields.");
    if (Number(duration) <= 0) return alert("Duration must be greater than 0.");

    // Check overlap on same plot/slotType/reservedFor/date
    const snapshot = await getDocs(
      query(
        collection(db, "bookings"),
        where("plotId", "==", plot.id),
        where("slotType", "==", slotType),
        where("reservedFor", "==", reservedFor),
        where("date", "==", date)
      )
    );

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (isOverlap(data.time, time, Number(data.duration), Number(duration))) {
        return alert("Slot already booked at that time.");
      }
    }

    // Do NOT create QR or send email here. Push to Checkout page first.
    // Optionally create a temporary 'pending' booking in Firestore (without QR)
    const pendingPayload = {
      ...form,
      userId: user.uid,
      userEmail: user.email,
      userName: userData.name,
      plotId: plot.id,
      plotName: plot.plotName,
      location: plot.location,
      pricePerHour,
      totalPriceINR: totalINR,
      status: "pending", // pending -> paid -> emailed
      createdAt: new Date().toISOString(),
    };

    // You can store this now or pass via route state only. We'll pass in state and let Checkout write to DB to avoid abandoned docs.

    navigate("/checkout", { state: { plot, form: pendingPayload } });
  };

  return (
    <div className="booking-overlay">
      <div className="booking-modal">
        <h4>Book at {plot.plotName}</h4>
        <p><strong>Email:</strong> {userData.email || "Not found"}</p>
        <p><strong>Location:</strong> {plot.location?.lat}, {plot.location?.lng}</p>

        <form ref={formRef} onSubmit={handleProceed}>
          <label>Vehicle Number</label>
          <input type="text" name="vehicleNumber" onChange={handleChange} required />

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

          {/* Live pricing summary */}
          <div className="price-summary">
            <div>Price / hour: ₹{pricePerHour}</div>
            <div>Total (₹): <strong>{isNaN(totalINR) ? 0 : totalINR}</strong></div>
          </div>

          <div className="actions">
            <button type="submit">Review & Pay</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;