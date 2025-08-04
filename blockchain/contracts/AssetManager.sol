// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AssetManager is ReentrancyGuard {
    IERC20 public rgtToken;
    IERC20 public rewardToken;
    address private owner;

    struct Asset {
        address holder;
        uint256 totalAssets;
        uint256 lastRewardTime;
        uint256 lastClaimed;
        uint256 claimableAmount;
    }

    mapping(address => Asset) public assetStorage;

    event AssetDeposited(address indexed user, uint256 tokenAmount, uint256 assetAmount);
    event RewardClaimed(address indexed user, uint256 rewardAmount);
    event PoolFunded(uint256 amount);
    event PoolWithdrawn(uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    constructor(IERC20 _rgtToken, IERC20 _rewardToken) {
        require(address(_rgtToken) != address(0), "Invalid RGT token");
        require(address(_rewardToken) != address(0), "Invalid reward token");

        rgtToken = _rgtToken;
        rewardToken = _rewardToken;
        owner = msg.sender;
    }

    function deposit(uint256 tokenAmount, address assetholder) public nonReentrant() {
        require(tokenAmount >= (10 * 1e18), "invalid amount");
        require(tokenAmount % (10 * 1e18) == 0, "Amount should be multiples of 10");
        require(rgtToken.transferFrom(msg.sender, address(this), tokenAmount), "Transfer failed");
        Asset storage holder = assetStorage[msg.sender];
        rewardCalculator(msg.sender);
        if (holder.lastRewardTime == 0) {
            holder.lastRewardTime = block.timestamp;
        }       

        rewardCalculator(msg.sender);
        uint256 assetAmount = tokenAmount / (10 * 1e18);
        createAsset(assetholder, assetAmount);

        emit AssetDeposited(msg.sender, tokenAmount, assetAmount);
    }

    function createAsset(address holder, uint256 assetAmount) internal {
        Asset storage asset = assetStorage[holder];

        if (asset.totalAssets == 0) {
            asset.holder = holder;
            asset.lastRewardTime = block.timestamp;
        }

        asset.totalAssets += assetAmount;
    }

    function rewardCalculator(address holder_) internal {
        Asset storage holder = assetStorage[holder_];
        uint256 last = holder.lastRewardTime;

        if (block.timestamp >= last + 1 days) {
            uint256 daysPassed = (block.timestamp - last) / 1 days;
            uint256 reward = holder.totalAssets * daysPassed * 0.1 ether;
            holder.claimableAmount += reward;
            holder.lastRewardTime = last + (daysPassed * 1 days);
        }
    }

    function pendingRewards(address holder) public view returns (uint256) {
        uint256 last = assetStorage[holder].lastRewardTime;
        if (block.timestamp < last + 1 days) return 0;

        uint256 daysPassed = (block.timestamp - last) / 1 days;
        return assetStorage[holder].totalAssets * daysPassed * 0.1 ether;
    }

    function claimReward() external nonReentrant(){
        rewardCalculator(msg.sender);
        uint256 claimable = assetStorage[msg.sender].claimableAmount;
        require(claimable > 0, "Nothing to claim");

        uint256 rewardBalance = rewardToken.balanceOf(address(this));
        require(rewardBalance >= claimable, "Insufficient pool");

        assetStorage[msg.sender].claimableAmount = 0;

        bool success = rewardToken.transfer(msg.sender, claimable);
        require(success, "Reward transfer failed");

        emit RewardClaimed(msg.sender, claimable);
    }

    function fundRewardPool(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be > 0");
        require(rewardToken.transferFrom(msg.sender, address(this), amount), "Funding failed");

        emit PoolFunded(amount);
    }

    function withdrawPool(uint256 amount) external onlyOwner {
        uint256 rewardBalance = rewardToken.balanceOf(address(this));
        require(rewardBalance >= amount, "Insufficient balance");

        bool success = rewardToken.transfer(msg.sender, amount);
        require(success, "Withdraw failed");

        emit PoolWithdrawn(amount);
    }

    function withdrawDeposits(address to, uint256 amount) external onlyOwner {
        require(rgtToken.balanceOf(address(this)) >= amount, "Insufficient balance");
        rgtToken.transfer(to, amount);
    }

    function emergencyWithdrawAllDeposits(address to) external onlyOwner {
        uint256 balance = rgtToken.balanceOf(address(this));
        require(balance > 0, "Nothing to withdraw");
        rgtToken.transfer(to, balance);
    }

    function viewHolderAssets(address holder) public view returns (Asset memory) {
        return assetStorage[holder];
    }

    function nextClaimTime(address user) public view returns (uint256) {
        uint256 last = assetStorage[user].lastRewardTime;
        if (last == 0) return 0;
        return last + 1 days;
    }

    function isFirstDeposit(address user) public view returns (bool) {
        return assetStorage[user].totalAssets == 0;
    }


}
