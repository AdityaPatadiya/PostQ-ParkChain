const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ParkingContract", function () {
  let ParkingContract, parking, owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    ParkingContract = await ethers.getContractFactory("ParkingContract");
    parking = await ParkingContract.deploy();
    await parking.waitForDeployment();
  });

  it("should allow a user to start and end parking within time without penalty", async function () {
    const allowedMinutes = 2;
    const baseFee = ethers.parseEther("0.01");

    // Start parking
    await parking.connect(user).startParking(allowedMinutes, { value: baseFee });

    // Fast-forward time by 1 minute
    await ethers.provider.send("evm_increaseTime", [60]);
    await ethers.provider.send("evm_mine");

    // End parking (no penalty)
    await expect(parking.connect(user).endParking({ value: 0 }))
      .to.emit(parking, "ParkingEnded")
      .withArgs(user.address, allowedMinutes - 1, 0);
  });

  it("should charge penalty if user overstays", async function () {
    const allowedMinutes = 1;
    const baseFee = ethers.parseEther("0.01");

    await parking.connect(user).startParking(allowedMinutes, { value: baseFee });

    // Fast-forward by 3 minutes (2 mins overtime)
    await ethers.provider.send("evm_increaseTime", [180]);
    await ethers.provider.send("evm_mine");

    const penaltyPerMinute = await parking.penaltyPerMinute();
    const expectedPenalty = penaltyPerMinute * BigInt(2);

    await expect(parking.connect(user).endParking({ value: expectedPenalty }))
      .to.emit(parking, "ParkingEnded")
      .withArgs(user.address, 3, expectedPenalty);
  });

  it("should revert if user tries to end parking twice", async function () {
    const allowedMinutes = 1;
    const baseFee = ethers.parseEther("0.01");

    await parking.connect(user).startParking(allowedMinutes, { value: baseFee });

    await ethers.provider.send("evm_increaseTime", [60]);
    await ethers.provider.send("evm_mine");

    await parking.connect(user).endParking({ value: 0 });

    await expect(parking.connect(user).endParking({ value: 0 }))
      .to.be.revertedWith("Session already ended");
  });

  it("should refund extra penalty if user overpays", async function () {
    const allowedMinutes = 1;
    const baseFee = ethers.parseEther("0.01");

    await parking.connect(user).startParking(allowedMinutes, { value: baseFee });

    await ethers.provider.send("evm_increaseTime", [180]);
    await ethers.provider.send("evm_mine");

    const penaltyPerMinute = await parking.penaltyPerMinute();
    const expectedPenalty = penaltyPerMinute * BigInt(2);
    const overpayAmount = expectedPenalty + ethers.parseEther("0.005");

    const userBalanceBefore = await ethers.provider.getBalance(user.address);

    const tx = await parking.connect(user).endParking({ value: overpayAmount });
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;

    const userBalanceAfter = await ethers.provider.getBalance(user.address);

    // User should get refunded (minus gas)
    expect(userBalanceAfter).to.be.closeTo(
      userBalanceBefore - expectedPenalty - gasUsed,
      ethers.parseEther("0.001") // small margin for gas calc
    );
  });
});
