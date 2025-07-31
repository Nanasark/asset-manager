import { ethers } from "hardhat";
import { expect } from "chai";

describe("AssetManager", function () {
  let assetManager: any;
  let rgtToken: any;
  let rewardToken: any;
  let owner: any;
  let user: any;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const RGTToken = await ethers.getContractFactory("RGTToken");
    rgtToken = await RGTToken.deploy(ethers.parseEther("1000000"));

    const RewardToken = await ethers.getContractFactory("RewardToken");
    rewardToken = await RewardToken.deploy(ethers.parseEther("500000"));

    const AssetManager = await ethers.getContractFactory("AssetManager");
    assetManager = await AssetManager.deploy(rgtToken.target, rewardToken.target);

    await rewardToken.connect(owner).approve(assetManager.target, ethers.parseEther("10000"))
    await assetManager.connect(owner).fundRewardPool(ethers.parseEther("10000"))

    await rgtToken.connect(user).mint();
    const userBalance = await rgtToken.balanceOf(user.address);
    await rgtToken.connect(user).approve(assetManager.target, userBalance);
  });

  it("should allow user to deposit and create assets", async function () {
    await assetManager.connect(user).deposit(ethers.parseEther("100"), user.address);
    const asset = await assetManager.assetStorage(user.address);
    expect(asset.totalAssets).to.equal(10);
    const contractBalance = await rgtToken.balanceOf(assetManager.target)
    console.log(contractBalance)
  });

  it("should reject deposit less than 10 tokens", async function () {
    await expect(
      assetManager.connect(user).deposit(ethers.parseEther("2"), user.address)
    ).to.be.revertedWith("invalid amount");
       const contractBalance = await rgtToken.balanceOf(assetManager.target)
    console.log(contractBalance)
  });

  it("should reject deposit not multiple of 10", async function () {
    await expect(
      assetManager.connect(user).deposit(ethers.parseEther("15"), user.address)
    ).to.be.revertedWith("Amount should be multiples of 10");
  });

  it("should calculate correct pending rewards after 1 day", async function () {
    await assetManager.connect(user).deposit(ethers.parseEther("100"), user.address);

   
    await ethers.provider.send("evm_increaseTime", [86400]);
    await ethers.provider.send("evm_mine", []);

    const rewards = await assetManager.pendingRewards(user.address);
    expect(rewards).to.equal(ethers.parseEther("1"));
  });

  it("should return 0 pending rewards before 24h passes", async function () {
    await assetManager.connect(user).deposit(ethers.parseEther("100"), user.address);

    await ethers.provider.send("evm_increaseTime", [43200]); 
    await ethers.provider.send("evm_mine", []);

    const rewards = await assetManager.pendingRewards(user.address);
    expect(rewards).to.equal(0);
  });

    it("should calculate correct pending rewards after 2 days", async function () {
    await assetManager.connect(user).deposit(ethers.parseEther("100"), user.address);

    await ethers.provider.send("evm_increaseTime", [86400 * 2]); //48 hours
    await ethers.provider.send("evm_mine", []);

    const rewards = await assetManager.pendingRewards(user.address);
    expect(rewards).to.equal(ethers.parseEther("2"));
  });

  it("should allow claiming rewards after 1 day", async function () {
    await assetManager.connect(user).deposit(ethers.parseEther("100"), user.address);

    await ethers.provider.send("evm_increaseTime", [86400]);
    await ethers.provider.send("evm_mine", []);

    await assetManager.connect(user).claimReward();

    const rwtBalance = await rewardToken.balanceOf(user.address);
    expect(rwtBalance).to.equal(ethers.parseEther("1"));

    const claimable = await assetManager.assetStorage(user.address).then((a: any) => a.claimableAmount);
    expect(claimable).to.equal(0);
  });

    it("should allow claiming rewards after 5 days", async function () {
    await assetManager.connect(user).deposit(ethers.parseEther("100"), user.address);

    await ethers.provider.send("evm_increaseTime", [86400 * 5]);
    await ethers.provider.send("evm_mine", []);

    await assetManager.connect(user).claimReward();

    const rwtBalance = await rewardToken.balanceOf(user.address);
    expect(rwtBalance).to.equal(ethers.parseEther("5"));

    const claimable = await assetManager.assetStorage(user.address).then((a: any) => a.claimableAmount);
    expect(claimable).to.equal(0);
  });

  it("should not allow claim if no rewards are available", async function () {
    await assetManager.connect(user).deposit(ethers.parseEther("100"), user.address);

    await expect(
      assetManager.connect(user).claimReward()
    ).to.be.revertedWith("Nothing to claim");
  });

  it("should not allow claim if contract has insufficient reward balance", async function () {
    const RewardToken = await ethers.getContractFactory("RewardToken");
    rewardToken = await RewardToken.deploy(ethers.parseEther("0.5"));

    const AssetManager = await ethers.getContractFactory("AssetManager");
    assetManager = await AssetManager.deploy(rgtToken.target, rewardToken.target);

    await rgtToken.connect(user).approve(assetManager.target, ethers.parseEther("100"));
    await assetManager.connect(user).deposit(ethers.parseEther("100"), user.address);

    await ethers.provider.send("evm_increaseTime", [86400]);
    await ethers.provider.send("evm_mine", []);

    await expect(
      assetManager.connect(user).claimReward()
    ).to.be.revertedWith("Insufficient pool");
  });

  it("should allow owner to withdraw all rgt deposits", async function () {
    await assetManager.connect(user).deposit(ethers.parseEther("100"), user.address);
    const initialOwnerBalance = await rgtToken.balanceOf(owner.address);
    const contractBalance = await rgtToken.balanceOf(assetManager.target)
    await assetManager.connect(owner).emergencyWithdrawAllDeposits(owner.address);

    const finalOwnerBalance = await rgtToken.balanceOf(owner.address);
    expect(finalOwnerBalance).to.equal(initialOwnerBalance + contractBalance);
  });

  it("should not allow non-owner to withdraw from reward pool", async function () {
    await expect(
      assetManager.connect(user).withdrawPool(ethers.parseEther("1000"))
    ).to.be.revertedWith("Only owner can call");
  });

  it("should not allow owner to withdraw more than available in reward pool", async function () {
    await expect(
      assetManager.connect(owner).withdrawPool(ethers.parseEther("20000"))
    ).to.be.revertedWith("Insufficient balance");
  });

});
