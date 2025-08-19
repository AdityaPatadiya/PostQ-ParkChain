// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PaymentContract {
    address public owner;
    uint256 public penaltyPerMinute = 0.001 ether; // Penalty per overtime minute

    struct ParkingSession {
        uint256 startTime;
        bool isActive;
    }

    mapping(address => ParkingSession) public sessions;

    event PaymentReceived(address indexed from, uint256 amount);
    event PenaltyCalculated(address indexed user, uint256 overtimeMinutes, uint256 penaltyAmount);

    constructor() {
        owner = msg.sender;
    }

    // Start parking session
    function startParking() external {
        require(!sessions[msg.sender].isActive, "Parking session already active");
        sessions[msg.sender] = ParkingSession(block.timestamp, true);
    }

    // End parking session and pay dynamically
    function endParkingAndPay(uint256 allowedMinutes, uint256 baseFee) external payable {
        ParkingSession storage session = sessions[msg.sender];
        require(session.isActive, "No active parking session");

        session.isActive = false;
        uint256 endTime = block.timestamp;

        // Calculate parked time in minutes
        uint256 parkedTime = (endTime - session.startTime) / 60; 

        // Calculate overtime
        uint256 overtime = 0;
        if (parkedTime > allowedMinutes) {
            overtime = parkedTime - allowedMinutes;
        }

        uint256 penalty = overtime * penaltyPerMinute;
        uint256 totalAmount = baseFee + penalty;

        require(msg.value >= totalAmount, "Insufficient payment");

        emit PaymentReceived(msg.sender, msg.value);

        if (overtime > 0) {
            emit PenaltyCalculated(msg.sender, overtime, penalty);
        }

        // Refund extra amount if user sent more
        if (msg.value > totalAmount) {
            payable(msg.sender).transfer(msg.value - totalAmount);
        }
    }

    // Withdraw all funds by owner
    function withdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(owner).transfer(address(this).balance);
    }

    // Get contract balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Set penalty per minute
    function setPenaltyPerMinute(uint256 newPenalty) external {
        require(msg.sender == owner, "Only owner can set");
        penaltyPerMinute = newPenalty;
    }
}
