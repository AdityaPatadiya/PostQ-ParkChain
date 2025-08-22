const { ethers } = require("hardhat");

async function main() {
  const [user] = await ethers.getSigners();
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const ParkingContract = await ethers.getContractFactory("ParkingContract");
  const contract = ParkingContract.attach(contractAddress);

  console.log("Ending parking for:", user.address);

  const session = await contract.getSession(user.address);
  if (!session.isActive) {
    console.log("No active session");
    return;
  }

  // Simulate penalty calculation off-chain
  const currentTime = Math.floor(Date.now() / 1000);
  const parkedMinutes = Math.floor((currentTime - Number(session.startTime)) / 60);
  const overtime = parkedMinutes > session.allowedMinutes ? parkedMinutes - session.allowedMinutes : 0;
  const penaltyPerMinute = await contract.penaltyPerMinute();
  const penalty = overtime > 0 ? penaltyPerMinute * BigInt(overtime) : BigInt(0);

  console.log(`Parked: ${parkedMinutes} mins | Overtime: ${overtime} mins | Penalty: ${ethers.formatEther(penalty)} ETH`);

  const tx = await contract.connect(user).endParking({ value: penalty });
  await tx.wait();

  console.log(`Parking ended. Paid penalty: ${ethers.formatEther(penalty)} ETH`);
}

main();
