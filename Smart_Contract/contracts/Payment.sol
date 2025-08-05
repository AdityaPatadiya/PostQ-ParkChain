// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PaymentContract {
    address public owner;

    // Event to log payment
    event PaymentReceived(address from, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    // Function to receive payment
    function makePayment() external payable {
        require(msg.value > 0, "Payment amount must be greater than zero");

        emit PaymentReceived(msg.sender, msg.value);
    }

    // Function to withdraw funds by owner
    function withdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(owner).transfer(address(this).balance);
    }

    // Function to check the contract balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
