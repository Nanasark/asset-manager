//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RGTToken is ERC20{
    address public owner;

    constructor(uint256 initialSupply) ERC20("RGTToken", "RGT") {
        owner = msg.sender;
        _mint(msg.sender, initialSupply);
    }

    function adminMint(address to, uint256 amount) public {
        require(msg.sender == owner, "Only owner");
        _mint(to, amount);
    }

    mapping(address => uint256) public lastMintTime;

    function mint() public {
        require(
            block.timestamp >= lastMintTime[msg.sender] + 1 days,
            "Faucet: Wait 24 hours"
        );
        
        uint256 amount = 100 * 10 ** decimals();
        _mint(msg.sender, amount);
        lastMintTime[msg.sender] = block.timestamp;
    }

}