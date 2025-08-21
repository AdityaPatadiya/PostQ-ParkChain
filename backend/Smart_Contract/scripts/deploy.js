const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const ParkingContract = await ethers.getContractFactory("ParkingContract");
  const contract = await ParkingContract.deploy();
  await contract.waitForDeployment();

  console.log("ParkingContract deployed at:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
