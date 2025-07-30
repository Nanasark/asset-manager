"use client"
import Header from "@/components/Header"

export default function DocsPage() {
  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-green-50 text-gray-600 min-h-screen font-sans">
       <Header/>
      <div className="max-w-4xl mx-auto p-6">

        {/* Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-mono mb-4 text-green-400">Overview</h2>
          <p className="mb-4 text-gray-600">
            Two contracts: <span className="text-orange-400 font-mono">RGTToken</span> (basic ERC20) and{" "}
            <span className="text-orange-400 font-mono">AssetManager</span> (the main logic). Users deposit RGT tokens,
            get "assets" in return, and earn 0.1 RWT per asset per day.
          </p>

          <h3 className="text-lg font-mono mb-2 text-violet-400">Contract Addresses</h3>
          <pre className="bg-zinc-900 p-4 text-sm rounded-md border border-zinc-700 text-green-300 overflow-x-auto">
            {`RGT_TOKEN_ADDRESS: 0x...
ASSET_MANAGER_ADDRESS: 0x...
REWARD_TOKEN_ADDRESS: 0x...`}
          </pre>
        </div>

        {/* RGT Token Contract */}
        <div className="mb-8">
          <h2 className="text-xl font-mono mb-4 text-green-400">RGTToken Contract</h2>

          <h3 className="text-lg font-mono text-orange-400 mb-1">mint()</h3>
          <p className="mb-2 text-sm text-gray-600">Daily faucet — anyone can grab 100 RGT every 24 hours.</p>
          <ul className="list-disc ml-6 text-sm text-gray-400 mb-4">
            <li>Cooldown is per wallet</li>
            <li>UI: RGT Token tab → "Daily Mint"</li>
          </ul>
          <pre className="bg-zinc-900 p-4 text-sm rounded-md border border-zinc-700 text-green-300 overflow-x-auto mb-6">
            {`function mint() public {
    require(block.timestamp >= lastMintTime[msg.sender] + 1 days, "Wait 24 hours");
    _mint(msg.sender, 100 * 10**decimals());
}`}
          </pre>

          <h3 className="text-lg font-mono text-orange-400 mb-1">adminMint(address to, uint256 amount)</h3>
          <p className="mb-2 text-sm text-gray-600">
            Owner can mint any amount to any address for testing.
          </p>
          <pre className="bg-zinc-900 p-4 text-sm rounded-md border border-zinc-700 text-green-300 overflow-x-auto mb-6">
            {`function adminMint(address to, uint256 amount) public {
    require(msg.sender == owner, "Only owner");
    _mint(to, amount);
}`}
          </pre>
        </div>

        {/* Asset Manager Contract */}
        <div className="mb-8">
          <h2 className="text-xl font-mono mb-4 text-green-400">AssetManager Contract</h2>

          <h3 className="text-lg font-mono text-orange-400 mb-1">deposit(uint256 tokenAmount, address assetholder)</h3>
          <p className="mb-2 text-sm text-gray-600">
  Allows users to deposit RGT tokens and receive corresponding asset units (10 tokens = 1 asset). Tokens are transferred to the contract and converted to tracked assets.
          </p>
                    <p className="mb-2 text-sm text-gray-600">
           <b className="text-violet-800">Reasoning</b>:
           The function enforces deposits in multiples of 10 tokens to standardize asset units and simplify reward calculation <br></br>(1 asset = 10 tokens). This avoids fractional assets and ensures predictable behavior. Using transferFrom also ensures proper token custody by verifying that the user has approved the contract to spend the tokens on their behalf.
            daily.
          </p>

          <ul className="list-disc ml-6 text-sm text-gray-500 mb-4">
            <li>Must be multiples of 10 tokens </li>
            <li>User must approve the contract first</li>
            <li>Creates asset record if first deposit</li>
          </ul>
          <pre className="bg-zinc-900 p-4 text-sm rounded-md border border-zinc-700 text-green-300 overflow-x-auto mb-6">
            {`function deposit(uint256 tokenAmount, address assetholder) public {
    // Must be at least 10 tokens and multiple of 10
    require(tokenAmount >= (10 * 1e18), "invalid amount");
    require(tokenAmount % (10 * 1e18) == 0, "Amount should be multiples of 10");
    
    // Transfer tokens from user to contract
    require(rgtToken.transferFrom(msg.sender, address(this), tokenAmount), "Transfer failed");
    
    // Convert to assets: 10 tokens = 1 asset
    uint256 assetAmount = tokenAmount / (10 * 1e18);
    createAsset(assetholder, assetAmount);
}`}
          </pre>

          <h3 className="text-lg font-mono text-orange-400 mb-1">claimReward()</h3>
          <p className="mb-2 text-sm text-gray-600">
        Allows users to claim accumulated reward tokens based on their deposited assets and the time elapsed.

          </p>

                    <p className="mb-2 text-sm text-gray-600">
           <b className="text-violet-800">Reasoning</b>:
       Before claiming, the function calls rewardCalculator to ensure rewards are up to date based on the latest time difference. It checks if the user has a non-zero claimable balance and ensures that the contract has enough reward tokens to fulfill the claim. Resetting claimableAmount before the transfer prevents reentrancy risks. This logic ensures fairness, avoids overclaims, and maintains the contract’s internal accounting integrity.
          </p>
          <pre className="bg-zinc-900 p-4 text-sm rounded-md border border-zinc-700 text-green-300 overflow-x-auto mb-6">
            {`function claimReward() external {
    // Calculate and update rewards first
    rewardCalculator(msg.sender);
    
    uint256 claimable = assetStorage[msg.sender].claimableAmount;
    require(claimable > 0, "Nothing to claim");
    
    // Check if pool has enough balance
    uint256 rewardBalance = rewardToken.balanceOf(address(this));
    require(rewardBalance >= claimable, "Insufficient pool");
    
    // Reset claimable and transfer
    assetStorage[msg.sender].claimableAmount = 0;
    rewardToken.transfer(msg.sender, claimable);
}`}
          </pre>

          <h3 className="text-lg font-mono text-orange-400 mb-1">pendingRewards(address holder)</h3>
          <p className="mb-2 text-sm text-gray-600">
           This shows users the amount of RWT tokens they have acquired overtime.
          </p>

                <p className="mb-2 text-sm text-gray-600">
           <b className="text-violet-800">Reasoning</b>:
              This function is to help users know how much they have without them having to interact with the contract. Without it users won't know how much they have until they are ready to claim. 
          </p>
          <pre className="bg-zinc-900 p-4 text-sm rounded-md border border-zinc-700 text-green-300 overflow-x-auto mb-6">
            {`function pendingRewards(address holder) public view returns (uint256) {
    uint256 last = assetStorage[holder].lastRewardTime;
    if (block.timestamp < last + 1 days) return 0; // Too early
    
    uint256 daysPassed = (block.timestamp - last) / 1 days;
    return assetStorage[holder].totalAssets * daysPassed * 0.1 ether;
}`}
          </pre>

          <h3 className="text-lg font-mono text-orange-400 mb-1">nextClaimTime(address user)</h3>
          <p className="mb-2 text-sm text-gray-600">
              This shows when next a user can claim after they have claimed all the claimable rewards.
          </p>
                          <p className="mb-2 text-sm text-gray-600">
           <b className="text-violet-800">Reasoning</b>:
              This helps the user track the next time they can claim i.e if they want to be consitent with daily claims. It also takes away the confusion of not know what is going on in the background and helps build user trust.
          </p>
          <pre className="bg-zinc-900 p-4 text-sm rounded-md border border-zinc-700 text-green-300 overflow-x-auto mb-6">
            {`function nextClaimTime(address user) public view returns (uint256) {
    uint256 last = assetStorage[user].lastRewardTime;
    if (last == 0) return 0; // Never deposited
    return last + 1 days;
}`}
          </pre>

          <h3 className="text-lg font-mono text-orange-400 mb-1">isFirstDeposit(address user)</h3>
          <p className="mb-2 text-sm text-gray-600">
          Check if user has any assets or their first time interacting with contract succesfully.
          </p>
                          <p className="mb-2 text-sm text-gray-600">
           <b className="text-violet-800">Reasoning</b>:
              This function was introduced to help improve the user experience in providing detailed information on what to do and expect as a first time user.
          </p>
          <pre className="bg-zinc-900 p-4 text-sm rounded-md border border-zinc-700 text-green-300 overflow-x-auto mb-6">
            {`function isFirstDeposit(address user) public view returns (bool) {
    return assetStorage[user].totalAssets == 0;
}`}
          </pre>

          <h3 className="text-lg font-mono text-orange-400 mb-1">fundRewardPool(uint256 amount)</h3>
          <p className="mb-2 text-sm text-gray-600">
          Admin uses this function to deposit poolRewards in the contract.
          
          </p>
          <pre className="bg-zinc-900 p-4 text-sm rounded-md border border-zinc-700 text-green-300 overflow-x-auto mb-6">
            {`function fundRewardPool(uint256 amount) external onlyOwner {
    require(amount > 0, "Amount must be > 0");
    // Transfer RWT from owner to contract
    require(rewardToken.transferFrom(msg.sender, address(this), amount), "Funding failed");
}`}
          </pre>
        </div>

        {/* Testing */}
        <div className="mb-8">
          <h2 className="text-xl font-mono mb-4 text-green-400">Testing</h2>

          <h3 className="text-lg font-mono mb-2 text-violet-400">Quick Test Flow</h3>
          <div className="bg-zinc-900 p-4 rounded-md border border-zinc-700 mb-4">
            <ol className="list-decimal ml-6 text-sm text-gray-300 space-y-1">
              <li>Connect wallet (Avalanche Fuji testnet)</li>
              <li>Mint 100 RGT from the faucet</li>
              <li>Go to Asset Manager, approve 20 RGT</li>
              <li>Deposit 20 RGT (gets you 2 assets)</li>
              <li>Wait 24 hours </li>
              <li>Check pending rewards (should be 0.2 RWT after 1 day)</li>
              <li>Claim rewards</li>
            </ol>
          </div>

          <h3 className="text-lg font-mono mb-2 text-violet-400">Owner Testing</h3>
          <p className="mb-2 text-sm text-gray-600">
            Owner address: <span className="text-orange-400 font-mono">0x1E2c6319d68db43DF109CBbA89b855F505aC6904</span>
          </p>
          <ul className="list-disc ml-6 text-sm text-gray-400 mb-4">
            <li>Admin mint shows up in RGT Token tab</li>
            <li>Reward pool funding shows up in Asset Manager tab</li>
            <li>Fund the pool first, otherwise claims will fail</li>
          </ul>
        </div>

        {/* Gotchas */}
        <div className="mb-8">
          <h2 className="text-xl font-mono mb-4 text-red-400">⚠️ Common Issues</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 p-4 rounded-md border border-red-500/30">
              <h3 className="text-lg font-mono mb-2 text-red-400">Deposit Problems</h3>
              <ul className="list-disc ml-6 text-sm text-gray-400 space-y-1">
                <li>Must approve before deposit (two-step process)</li>
                <li>Only multiples of 10 work (10, 20, 50, 100...)</li>
                <li>Need enough RGT balance</li>
              </ul>
            </div>

            <div className="bg-zinc-900 p-4 rounded-md border border-yellow-500/30">
              <h3 className="text-lg font-mono mb-2 text-yellow-400">Claim Problems</h3>
              <ul className="list-disc ml-6 text-sm text-gray-400 space-y-1">
                <li>24-hour wait after deposit or last claim</li>
                <li>Pool might be empty (owner needs to fund it)</li>
                <li>If you've never deposited, nextClaimTime returns 0</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How Rewards Work */}
        <div className="mb-8">
          <h2 className="text-xl font-mono mb-4 text-green-400">How Rewards Work</h2>
          <p className="mb-4 text-gray-600">Simple math:</p>
          <div className="bg-zinc-900 p-4 rounded-md border border-green-500/30">
            <pre className="text-sm text-green-300">
{`// Every day, each asset earns 0.1 RWT
daysPassed = (now - lastRewardTime) / 1 day
reward = totalAssets * daysPassed * 0.1

// Example: 5 assets, 3 days passed
reward = 5 * 3 * 0.1 = 1.5 RWT`}
            </pre>
          </div>

          <p className="mt-4 text-gray-600">
            The contract tracks when you last claimed, calculates days since then, and gives you that many days worth of
            rewards.
          </p>
        </div>

        {/* Data Structure */}
        <div className="mb-8">
          <h2 className="text-xl font-mono mb-4 text-green-400">Asset Struct</h2>
          <pre className="bg-zinc-900 p-4 text-sm rounded-md border border-zinc-700 text-violet-300 overflow-x-auto">
            {`struct Asset {
    address holder;           // Who owns this
    uint256 totalAssets;      // How many asset units they have
    uint256 lastRewardTime;   // When rewards were last calculated
    uint256 lastClaimed;      // When they last claimed (unused currently)
    uint256 claimableAmount;  // Rewards ready to claim
}`}
          </pre>
        </div>

       
       
      </div>
    </div>
  )
}
