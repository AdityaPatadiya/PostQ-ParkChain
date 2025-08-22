const { ethers } = require("hardhat");

async function main() {
  const [user] = await ethers.getSigners();
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const ParkingContract = await ethers.getContractFactory("ParkingContract");
  const contract = ParkingContract.attach(contractAddress);

  console.log("Starting parking for:", user.address);

  const allowedMinutes = 1; // for quick test
  const baseFee = ethers.parseEther("0.01");

  const tx = await contract.connect(user).startParking(allowedMinutes, { value: baseFee });
  await tx.wait();

  console.log(`Parking started for ${allowedMinutes} mins with fee: ${ethers.formatEther(baseFee)} ETH`);
}

main();
