import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { inrToEth, payInEthViaWallet } from "../utils/eth";
import QRCode from "qrcode";
import emailjs from "@emailjs/browser";

const EmailConfig = {
  serviceId: "service_lzcft4a",
  templateId: "service_lzcft4a",
  publicKey: "FeYm9Nn9Men4Ayj-C",
};

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [ethAmount, setEthAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!state?.form || !state?.plot) {
      navigate("/");
    } else {
      (async () => {
        const eth = await inrToEth(state.form.totalPriceINR || 0);
        setEthAmount(eth);
      })();
    }
  }, [state, navigate]);

  const summary = useMemo(() => state?.form || {}, [state]);

  const handlePay = async () => {
    try {
      setLoading(true);
      setError("");

      // 1) Create booking doc with status=pending
      const pendingRef = await addDoc(collection(db, "bookings"), {
        ...summary,
        status: "pending",
      });

      // 2) Ask wallet to pay ETH (Sepolia by default in eth.js)
      const { txHash } = await payInEthViaWallet({ amountEth: ethAmount });

      // 3) Mark as paid
      await updateDoc(doc(db, "bookings", pendingRef.id), {
        status: "paid",
        ethAmount,
        txHash,
        paidAt: new Date().toISOString(),
      });

      // 4) Generate QR (NOW, after payment)
      const qrText = `BOOKING_${Date.now()}_${pendingRef.id}`;
      const qrUrl = await QRCode.toDataURL(qrText);

      await updateDoc(doc(db, "bookings", pendingRef.id), {
        qrCode: qrText,
        qrImage: qrUrl,
      });

      // 5) Email the user
      try {
        await emailjs.send(
          EmailConfig.serviceId,
          EmailConfig.templateId,
          {
            name: summary.userName,
            email: summary.userEmail,
            slot: summary.slotType,
            reservedFor: summary.reservedFor,
            date: summary.date,
            time: summary.time,
            duration: summary.duration,
            vehicleNumber: summary.vehicleNumber,
            plotName: summary.plotName,
            location: `${summary.location?.lat}, ${summary.location?.lng}`,
            qrCode: qrUrl,
            totalPrice: summary.totalPriceINR,
            ethAmount,
            txHash,
          },
          EmailConfig.publicKey
        );
      } catch (mailErr) {
        console.warn("Email failed, but booking is paid.", mailErr);
      }

      alert("Payment successful. QR generated and emailed.");
      navigate("/my-bookings");
    } catch (e) {
      console.error(e);
      setError(e?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!state?.form || !state?.plot) return null;

  return (
    <div className="checkout-page">
      <h2>Review & Pay</h2>

      <div className="card">
        <h4>Booking Summary</h4>
        <ul>
          <li><strong>Plot:</strong> {summary.plotName}</li>
          <li><strong>Vehicle:</strong> {summary.vehicleNumber}</li>
          <li><strong>Slot Type:</strong> {summary.slotType}</li>
          <li><strong>Reserved For:</strong> {summary.reservedFor}</li>
          <li><strong>Date & Time:</strong> {summary.date} @ {summary.time}</li>
          <li><strong>Duration (hr):</strong> {summary.duration}</li>
          <li><strong>Price / hour:</strong> ₹{summary.pricePerHour}</li>
          <li><strong>Total (INR):</strong> ₹{summary.totalPriceINR}</li>
          <li><strong>Payable (ETH):</strong> {ethAmount ?? "..."}</li>
        </ul>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="actions">
        <button onClick={() => navigate(-1)} disabled={loading}>Back</button>
        <button onClick={handlePay} disabled={loading || ethAmount == null}>
          {loading ? "Processing..." : "Pay with Ethereum"}
        </button>
      </div>

      <p style={{ marginTop: 16 }}>
        For demo, this is configured for <strong>Sepolia testnet</strong>. Replace the business
        wallet and switch to mainnet when going live.
      </p>
    </div>
  );
}