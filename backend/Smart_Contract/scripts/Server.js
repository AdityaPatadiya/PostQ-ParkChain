// server.js
require("dotenv").config();
const express = require("express");
const { ethers } = require("ethers");
const path = require("path");
const PaymentContractAbi = require(path.resolve(__dirname, "../artifacts/contracts/Payment.sol/ParkingContract.json")).abi;

const app = express();
app.use(express.json());

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, PaymentContractAbi, wallet);

// API endpoint to start a parking session
app.post("/api/start-parking", async (req, res) => {
  try {
    const { baseFee, allowedMinutes } = req.body;

    if (!baseFee || !allowedMinutes) {
      return res.status(400).json({ success: false, error: "Missing required parameters: baseFee and allowedMinutes." });
    }

    // Get the current nonce for the wallet
    const nonce = await wallet.getNonce();

    // Send the transaction with the fetched nonce
    const tx = await contract.startParking(allowedMinutes, {
      value: ethers.parseEther(baseFee.toString()),
      nonce: nonce, // Manually set the nonce
    });
    await tx.wait();

    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error("Error starting parking:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API endpoint to end a parking session and pay penalty (if any)
app.post("/api/end-parking", async (req, res) => {
  try {
    const { penaltyFee } = req.body;

    // Get the current nonce for the wallet
    const nonce = await wallet.getNonce();

    // Send the transaction with the fetched nonce
    const tx = await contract.endParking({
      value: ethers.parseEther(penaltyFee.toString() || "0"),
      nonce: nonce, // Manually set the nonce
    });
    await tx.wait();

    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error("Error ending parking:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});