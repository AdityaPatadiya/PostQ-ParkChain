const { ethers } = require("hardhat");

async function main() {
  const [payer] = await ethers.getSigners(); // Get first signer (payer)

  const contractAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; // Replace with deployed address
  const PaymentContract = await ethers.getContractFactory("PaymentContract");
  const contract = PaymentContract.attach(contractAddress);

  console.log("Payer:", payer.address);

  // Example: allowed time = 30 mins, base fee = 0.01 ETH
  const allowedMinutes = 30;
  const baseFee = ethers.parseEther("0.01"); // 0.01 ETH

  // Send some ETH along with the function call
  const tx = await contract.connect(payer).endParkingAndPay(allowedMinutes, baseFee, {
    value: ethers.parseEther("0.02") // Sending 0.02 ETH to cover base + possible penalty
  });

  await tx.wait();
  console.log("Payment successful. Tx Hash:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
