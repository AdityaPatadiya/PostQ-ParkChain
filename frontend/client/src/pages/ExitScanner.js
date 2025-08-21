// src/pages/ParkingTimeCalculator.jsx
import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  getDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import emailjs from "@emailjs/browser"; // Import EmailJS

const ExitScanner = () => {
  const [parkingInfo, setParkingInfo] = useState(null);
  const [docId, setDocId] = useState(null);

  // const hourlyRate = 50; // ₹ per hour
  // const overtimeRate = 80; // ₹ per hour overtime

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

    scanner.render(async (decodedText) => {
      console.log("Scanned:", decodedText);

      const q = query(
        collection(db, "activeBookings"),
        where("qrCode", "==", decodedText)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const booking = docSnap.data();
        setDocId(docSnap.id);

        if (!booking.countdownStart) {
          alert("Countdown has not started yet for this booking.");
          return;
        }

        const startTime = booking.countdownStart.toDate();
        const now = new Date();

        const bookedHours = booking.duration; // in hours

        const bookedSeconds = booking.initialDuration * 60 * 60;
        const totalSecondsSpent = Math.floor((now - startTime) / 1000);


        // calculate overtime in seconds properly
        const overtimeSeconds = totalSecondsSpent > bookedSeconds
          ? totalSecondsSpent - bookedSeconds
          : 0;

        // number
        const overtimeHours = overtimeSeconds / 3600; // number
        const totalHours = totalSecondsSpent / 3600; // number

        const hourlyRate = 50;    // ₹ per hour
        const overtimeRate = 80;  // ₹ per hour overtime
        const totalCost = bookedHours * hourlyRate + overtimeHours * overtimeRate;

        setParkingInfo({
          bookedHours,
          totalHours,
          overtimeHours,
          totalCost,
          startTime: startTime.toLocaleString(),
          endTime: now.toLocaleString(),
          email: booking.userEmail,
        });

      } else {
        alert("Invalid QR code");
      }
    });

    return () => scanner.clear();
  }, []);

  const handleSendBill = async () => {
    if (!docId || !parkingInfo) {
      alert("No booking found to process.");
      return;
    }

    try {
      // 1️⃣ Fetch the full original booking data
      const originalBookingRef = doc(db, "activeBookings", docId);
      const originalBookingSnap = await getDoc(originalBookingRef);

      if (!originalBookingSnap.exists()) {
        alert("Original booking not found.");
        return;
      }

      const originalBookingData = originalBookingSnap.data();

      // 2️⃣ Merge original booking data with billing info
      const completedBookingData = {
        ...originalBookingData,       // all old information
        bookedHours: parkingInfo.bookedHours ?? 0,
        totalHours: parkingInfo.totalHours ?? 0,
        overtimeHours: parkingInfo.overtimeHours ?? 0,
        totalCost: parkingInfo.totalCost ?? 0,
        startTime: parkingInfo.startTime ?? "",
        endTime: parkingInfo.endTime ?? "",
        email: parkingInfo.email ?? "",
        originalBookingId: docId,
        isCountdownStopped: true,
        billSent: true,
        paymentStatus: "pending",
        billTime: serverTimestamp(),
        gateOpened: false,
      };

      // 3️⃣ Store into new collection "completedBookings"
      const completedDocRef = await addDoc(
        collection(db, "completedBookings"),
        completedBookingData
      );

      // 4️⃣ Update state with new completed document ID
      setDocId(completedDocRef.id);

      // 5️⃣ Send bill via EmailJS
      await emailjs.send(
        "service_lzcft4a",
        "template_v0am8ji",
        {
          to_email: completedBookingData.email,
          total_cost: completedBookingData.totalCost,
          start_time: completedBookingData.startTime,
          end_time: completedBookingData.endTime,
          overtime_hours: completedBookingData.overtimeHours,
        },
        "FeYm9Nn9Men4Ayj-C"
      );

      alert("Bill sent and full booking info stored in completedBookings.");
    } catch (error) {
      console.error("Failed to store/send bill:", error);
      alert("Failed to store/send bill. Check console for details.");
    }
  };



  // Step 2: Admin opens exit gate after payment
  const handleOpenGate = async () => {
    if (!docId) return;

    try {
      // 1️⃣ Fetch the current booking data
      const bookingRef = doc(db, "activeBookings", docId);
      const bookingSnap = await getDoc(bookingRef);

      if (!bookingSnap.exists()) {
        alert("Booking not found.");
        return;
      }

      const bookingData = bookingSnap.data();

      // 2️⃣ Update original booking if needed (optional)
      // await updateDoc(bookingRef, { gateOpened: true, paymentStatus: "completed" });

      // 3️⃣ Prepare data for new table
      const exitBookingData = {
        ...bookingData,           // all old information
        gateOpened: true,
        paymentStatus: "completed",
        exitTime: new Date().toLocaleString(), // optional timestamp
        originalBookingId: docId
      };

      // 4️⃣ Store in new collection "exitBookings"
      await addDoc(collection(db, "exitBookings"), exitBookingData);

      alert("Exit gate opened and booking info stored in exitBookings.");
    } catch (error) {
      console.error("Failed to open gate/store booking:", error);
      alert("Error opening gate or storing booking info.");
    }
  };


  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Parking Checkout</h1>
      <div id="reader" className="mb-4"></div>

      {parkingInfo && (
        <div className="p-4 border rounded bg-gray-100">
          <p>
            <strong>Start Time:</strong> {parkingInfo.startTime}
          </p>
          <p>
            <strong>End Time:</strong> {parkingInfo.endTime}
          </p>
          <p>
            <strong>Booked Hours:</strong> {parkingInfo.bookedHours} hrs
          </p>
          <p>
            <strong>Total Time Spent:</strong> {parkingInfo.totalHours} hrs
          </p>
          <p>
            <strong>Overtime:</strong> {parkingInfo.overtimeHours} hrs
          </p>
          <p>
            <strong>Total Cost:</strong> ₹{parkingInfo.totalCost}
          </p>
          <p>
            <strong>User Email:</strong> {parkingInfo.email}
          </p>

          <button
            className="mt-3 bg-blue-500 text-black px-4 py-2 rounded"
            onClick={handleSendBill}
          >
            OK - Stop Countdown & Send Bill
          </button>

          <button
            className="mt-3 ml-2 bg-green-500 text-black px-4 py-2 rounded"
            onClick={handleOpenGate}
          >
            OK - Open Exit Gate
          </button>
        </div>
      )}
    </div>
  );
};

export default ExitScanner;
