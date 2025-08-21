// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ParkingContract {
    address public owner;
    uint256 public penaltyPerMinute = 0.001 ether;

    struct ParkingSession {
        uint256 startTime;
        uint256 allowedMinutes;
        bool isActive;
        bool isEnded;
    }

    mapping(address => ParkingSession) public sessions;

    event ParkingStarted(address indexed user, uint256 allowedMinutes, uint256 startTime, uint256 baseFee);
    event ParkingEnded(address indexed user, uint256 parkedMinutes, uint256 penalty);

    constructor() {
        owner = msg.sender;
    }

    // Start parking with upfront base fee
    function startParking(uint256 allowedMinutes) external payable {
        require(!sessions[msg.sender].isActive, "Active session exists");
        require(msg.value > 0, "Base fee required");

        sessions[msg.sender] = ParkingSession({
            startTime: block.timestamp,
            allowedMinutes: allowedMinutes,
            isActive: true,
            isEnded: false
        });

        emit ParkingStarted(msg.sender, allowedMinutes, block.timestamp, msg.value);
    }

    // End parking and pay penalty if needed
    function endParking() external payable {
        ParkingSession storage session = sessions[msg.sender];
        require(session.isActive, "No active session");
        require(!session.isEnded, "Session already ended");

        uint256 parkedMinutes = (block.timestamp - session.startTime) / 60;
        uint256 penalty = 0;

        if (parkedMinutes > session.allowedMinutes) {
            uint256 overtime = parkedMinutes - session.allowedMinutes;
            penalty = overtime * penaltyPerMinute;
            require(msg.value >= penalty, "Insufficient penalty payment");
        } else {
            require(msg.value == 0, "No penalty required");
        }

        session.isEnded = true;
        session.isActive = false;

        emit ParkingEnded(msg.sender, parkedMinutes, penalty);

        // Refund extra if user paid more than needed
        if (msg.value > penalty) {
            payable(msg.sender).transfer(msg.value - penalty);
        }
    }

    function getSession(address user) external view returns (ParkingSession memory) {
        return sessions[user];
    }

    function setPenaltyPerMinute(uint256 newPenalty) external {
        require(msg.sender == owner, "Only owner");
        penaltyPerMinute = newPenalty;
    }

    function withdraw() external {
        require(msg.sender == owner, "Only owner");
        payable(owner).transfer(address(this).balance);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
