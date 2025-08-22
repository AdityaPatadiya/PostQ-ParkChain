import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { inrToEth, payInEthViaWallet } from "../utils/eth";
import QRCode from "qrcode";
import emailjs from "@emailjs/browser";
import '../css/Checkout.css';

const EmailConfig = {
    serviceId: "service_5z7ml5q",
    templateId: "template_4ncgdu7",
    publicKey: "fTnZhHGqEBmUEx75Q",
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

            // 1) Send payment request to backend demo wallet
            const response = await fetch("/api/start-parking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amountEth: ethAmount.toString(),        // calculated ETH for this booking
                    allowedMinutes: summary.duration * 60, // convert hours to minutes
                    baseFee: ethAmount.toString(),
                }),
            });

            const { success, error, txHash } = await response.json();

            if (!success) throw new Error(error);

            // 2) Save booking to Firebase
            const pendingRef = await addDoc(collection(db, "bookings"), {
                ...summary,
                status: "paid",
                ethAmount,
                txHash: txHash,
                paidAt: new Date().toISOString(),
            });

            // 3) Generate QR and send email as before
            const qrText = `BOOKING_${Date.now()}_${pendingRef.id}`;
            const qrUrl = await QRCode.toDataURL(qrText);

            await updateDoc(doc(db, "bookings", pendingRef.id), {
                qrCode: qrText,
                qrImage: qrUrl,
            });

            // 5) Email the user

            try {
                const result = await emailjs.send(
                    EmailConfig.serviceId,
                    EmailConfig.templateId,
                    {
                        name: summary.userName,
                        email: summary.userEmail,
                        slot: summary.slotType,
                        date: summary.date,
                        time: summary.time,
                        duration: summary.duration,
                        vehicleNumber: summary.vehicleNumber,
                        plotName: summary.plotName,
                        qrCode: qrUrl,
                    },
                    EmailConfig.publicKey
                );

                await fetch("http://127.0.0.1:5000/transactions/complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sender: summary.userName,
                        recipient: "SmartParkingSystem",
                        amount: ethAmount,
                        bookingId: pendingRef.id
                    })
                });

                console.log("EmailJS Success:", result.text);
            } catch (mailErr) {
                console.error("EmailJS Error:", mailErr);
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
