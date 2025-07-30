//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RewardToken is ERC20{
    address public owner;

    constructor(uint256 initialSupply) ERC20("RewardToken", "RWT") {
        owner = msg.sender;
        _mint(msg.sender, initialSupply);
    }
}