// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "./Permissions.sol";

contract MockPermissions is Permissions {

    event ValueChanged(uint256 indexed newValue);

    address public owner;
    uint256 public x;

    constructor() {
        owner = msg.sender;
    }

    function set(uint256 newX) public {
        set(newX, msg.sender);
    }

    function set(uint256 newX, address from) onlyPermissioned(from) public {
        require(from == owner, "Unauthorized");

        x = newX;

        emit ValueChanged(newX);
    }

    modifier onlyPermissioned(address from) {
        require(from == msg.sender || from == address(this), "Invalid");
        _;
    }
}
