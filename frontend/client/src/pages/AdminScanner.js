// src/pages/AdminScanner.jsx
import React, { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const AdminScanner = () => {
  const [scannedData, setScannedData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [docId, setDocId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

    scanner.render(async (decodedText) => {
      console.log("Scanned:", decodedText);

      // Check Firestore for booking
      const q = query(collection(db, "bookings"), where("qrCode", "==", decodedText));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const bookingDoc = querySnapshot.docs[0];
        setScannedData(bookingDoc.data());
        setDocId(bookingDoc.id);
        setShowPopup(true);
      } else {
        alert("Invalid QR code");
      }
    }, (errorMessage) => {
      console.error("Error scanning QR code:", errorMessage);
    });

    return () => scanner.clear();
  }, []);

  const startCountdown = async () => {
    if (!scannedData?.duration || !docId) return;

    const durationInSeconds = scannedData.duration * 60 * 60;
    let remaining = durationInSeconds;

    setIsRunning(true);
    setCountdown(remaining);

    // Store start time in Firestore
    const newDocRef = await addDoc(collection(db, "activeBookings"), {
      ...scannedData,          // all original booking info
      countdownStart: serverTimestamp(),
      remainingSeconds: remaining,
      overtimeSeconds: 0,
      status: "Active"
    });

    timerRef.current = setInterval(async () => {
      remaining -= 1;
      setCountdown(remaining);

      // Live update countdown in Firestore
       await updateDoc(newDocRef, {
    remainingSeconds: remaining,
    overtimeSeconds: remaining < 0 ? Math.abs(remaining) : 0
  });
    }, 1000);

    setShowPopup(false);
  };

  const formatTime = (seconds) => {
    const absSeconds = Math.abs(seconds);
    const h = Math.floor(absSeconds / 3600);
    const m = Math.floor((absSeconds % 3600) / 60);
    const s = absSeconds % 60;
    return `${seconds < 0 ? "-" : ""}${String(h).padStart(2, "0")}:${String(
      m
    ).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Admin QR Scanner</h1>
      <div id="reader" className="mb-4"></div>

      {showPopup && scannedData && (
        <div className="p-4 border rounded bg-green-100">
          <p>
            Username <strong>{scannedData.userEmail}</strong>
          </p>
          <p>
            date <strong>{scannedData.date}</strong>
          </p>
          <p>
            vehicalNumber <strong>{scannedData.vehicleNumber}</strong>
          </p>
          <p>
            slotType: <strong>{scannedData.slotType}</strong>
          </p>
          <p>
            reserved: <strong>{scannedData.reservedFor}</strong>
          </p>
          <p>
            Booking Found for: <strong>{scannedData.plotName}</strong>
          </p>
          <p>Duration: {scannedData.duration} hours</p>
          <button
            onClick={startCountdown}
            className="bg-blue-500 text-black px-4 py-2 mt-2 rounded"
          >
            OK
          </button>
        </div>
      )}


    </div>
  );
};

export default AdminScanner;
