const { ethers } = require("hardhat");

async function main() {
  const [user] = await ethers.getSigners();
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
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
