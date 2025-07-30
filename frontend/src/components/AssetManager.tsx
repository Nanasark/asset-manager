
"use client"
import { useEffect, useState } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { TrendingUp, Gift, Wallet, DollarSign, Clock } from "lucide-react"
import { formatEther, parseEther } from "viem"
import { ASSET_MANAGER_ABI,ASSET_MANAGER_ADDRESS,REWARD_TOKEN_ADDRESS,RGT_TOKEN_ABI,RGT_TOKEN_ADDRESS,REWARD_TOKEN_ABI } from "@/lib/contractst"
import { Toast, useToast } from "./Toast"
import { useCountdown } from "@/hooks/useCountDown"
import { useAllowance } from "@/hooks/useAllowance"



export default function AssetManager() {
  const { address } = useAccount()
  const [depositAmount, setDepositAmount] = useState("")
  const [fundAmount, setFundAmount] = useState("")
  const { toast, showError, showSuccess, hideToast } = useToast()
  

  useEffect(() => {
    if (!address) return
    const interval = setInterval(() => {
      refetchAssetData()
      refetchRewards()
      refetchPoolBalance()
      refetchTokenBalance()
      refetchReward()
      refetchNextRewardUpdate()
      refetchIsFirstDeposit()
    }, 10000)
    return () => clearInterval(interval)
  }, [address])

  const { data: assetData, refetch: refetchAssetData } = useReadContract({
    abi: ASSET_MANAGER_ABI,
    address: ASSET_MANAGER_ADDRESS,
    functionName: "viewHolderAssets",
    args: address ? [address] : undefined,
  })

  const { data: pendingRewards, refetch: refetchRewards } = useReadContract({
    abi: ASSET_MANAGER_ABI,
    address: ASSET_MANAGER_ADDRESS,
    functionName: "pendingRewards",
    args: address ? [address] : undefined,
  })

  const { data: rewardPoolBalance, refetch: refetchPoolBalance } = useReadContract({
    abi: RGT_TOKEN_ABI,
    address: REWARD_TOKEN_ADDRESS,
    functionName: "balanceOf",
    args: [ASSET_MANAGER_ADDRESS],
  })

  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    abi: RGT_TOKEN_ABI,
    address: RGT_TOKEN_ADDRESS,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  })

  const { data: rewardTokenBalance, refetch: refetchReward } = useReadContract({
    abi: RGT_TOKEN_ABI,
    address: REWARD_TOKEN_ADDRESS,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  })

  const { data: nextClaimTime, refetch: refetchNextRewardUpdate } = useReadContract({
    abi: ASSET_MANAGER_ABI,
    address: ASSET_MANAGER_ADDRESS,
    functionName: "nextClaimTime",
    args: address ? [address] : undefined,
  })

  const { data: isFirstDeposit, refetch: refetchIsFirstDeposit } = useReadContract({
    abi: ASSET_MANAGER_ABI,
    address: ASSET_MANAGER_ADDRESS,
    functionName: "isFirstDeposit",
    args: address ? [address] : undefined,
  })

  const { writeContract: approve, data: approveHash, error: approveError } = useWriteContract()
  const { writeContract: deposit, data: depositHash, error: depositError } = useWriteContract()
  const { writeContract: claimReward, data: claimHash, error: claimError } = useWriteContract()
  const { writeContract: approveReward, data: approveRewardHash, error: approveRewardError } = useWriteContract()
  const { writeContract: fundPool, data: fundHash, error: fundError } = useWriteContract()

  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  })
  const { isLoading: isDepositLoading, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({
    hash: depositHash,
  })
  const { isLoading: isClaimLoading, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimHash })
  const { isLoading: isApproveRewardLoading, isSuccess: isApproveRewardSuccess } = useWaitForTransactionReceipt({
    hash: approveRewardHash,
  })
  const { isLoading: isFundLoading, isSuccess: isFundSuccess } = useWaitForTransactionReceipt({ hash: fundHash })


  useEffect(() => {
    if (approveError) showError(`Approval failed: ${approveError.message}`)
    if (depositError) showError(`Deposit failed: ${depositError.message}`)
    if (claimError) showError(`Claim failed: ${claimError.message}`)
    if (approveRewardError) showError(`Reward approval failed: ${approveRewardError.message}`)
    if (fundError) showError(`Fund pool failed: ${fundError.message}`)
  }, [approveError, depositError, claimError, approveRewardError, fundError])

 
  useEffect(() => {
    if (isApproveSuccess) showSuccess("RGT tokens approved successfully!")
    if (isDepositSuccess) showSuccess("Assets deposited successfully!")
    if (isClaimSuccess) showSuccess("Rewards claimed successfully!")
    if (isApproveRewardSuccess) showSuccess("Reward tokens approved successfully!")
    if (isFundSuccess) showSuccess("Pool funded successfully!")
  }, [isApproveSuccess, isDepositSuccess, isClaimSuccess, isApproveRewardSuccess, isFundSuccess])

  const handleApprove = () => {
    if (!depositAmount) {
      showError("Please enter deposit amount")
      return
    }
    try {
      approve({
        abi: RGT_TOKEN_ABI,
        address: RGT_TOKEN_ADDRESS,
        functionName: "approve",
        args: [ASSET_MANAGER_ADDRESS, parseEther(depositAmount)],
      })
    } catch (error) {
      showError("Failed to initiate approval")
    }
  }

  const handleDeposit = () => {
    if (!depositAmount) {
      showError("Please enter deposit amount")
      return
    }
    try {
      deposit({
        abi: ASSET_MANAGER_ABI,
        address: ASSET_MANAGER_ADDRESS,
        functionName: "deposit",
        args: [parseEther(depositAmount), address!],
      })
    } catch (error) {
      showError("Failed to initiate deposit")
    }
  }

  const handleClaimReward = () => {
    try {
      claimReward({ abi: ASSET_MANAGER_ABI, address: ASSET_MANAGER_ADDRESS, functionName: "claimReward" })
    } catch (error) {
      showError("Failed to initiate claim")
    }
  }

  const handleApproveReward = () => {
    if (!fundAmount) {
      showError("Please enter fund amount")
      return
    }
    try {
      approveReward({
        abi: RGT_TOKEN_ABI,
        address: REWARD_TOKEN_ADDRESS,
        functionName: "approve",
        args: [ASSET_MANAGER_ADDRESS, parseEther(fundAmount)],
      })
    } catch (error) {
      showError("Failed to approve reward tokens")
    }
  }

  const handleFundPool = () => {
    if (!fundAmount) {
      showError("Please enter fund amount")
      return
    }
    try {
      fundPool({
        abi: ASSET_MANAGER_ABI,
        address: ASSET_MANAGER_ADDRESS,
        functionName: "fundRewardPool",
        args: [parseEther(fundAmount)],
      })
    } catch (error) {
      showError("Failed to fund pool")
    }
  }

  const validateInput = (input: string) => {
    const num = Number(input)
    return num % 10 === 0
  }

  const { isApproved } = useAllowance({
    owner: address!,
    spender: ASSET_MANAGER_ADDRESS,
    tokenAddress: RGT_TOKEN_ADDRESS,
    amount: depositAmount,
  })


  const nextRewardUpdate = useCountdown(Number(nextClaimTime!))
  return (
    <>
      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />

      <div className="space-y-6">
        {assetData && Number(assetData.totalAssets) > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-green-700 mb-2">Your Earning Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Daily Earnings:</span>
                <div className="font-semibold text-green-600">
                  {(Number(assetData.totalAssets) * 0.1).toFixed(1)} RWT/day
                </div>
              </div>
              <div>
                <span className="text-gray-600">Monthly Potential:</span>
                <div className="font-semibold text-green-600">
                  {(Number(assetData.totalAssets) * 0.1 * 30).toFixed(1)} RWT
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-orange-200 rounded-lg p-6">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
              <h3 className="text-lg font-semibold">Your Assets</h3>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {assetData ? Number(assetData.totalAssets).toString() : "0"}
            </div>
            <p className="text-sm text-gray-600">Asset units (each earns 0.1 RWT/day)</p>
          </div>

          <div className="bg-white border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-2">
              <Gift className="w-5 h-5 mr-2 text-green-500" />
              <h3 className="text-lg font-semibold">Pending Rewards</h3>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {pendingRewards ? formatEther(pendingRewards) : "0"} RWT
            </div>
            <p className="text-sm text-gray-600">Available to claim</p>
            {!isFirstDeposit && nextClaimTime && Number(nextClaimTime) > Date.now() / 1000 && (
              <div className="flex items-center text-amber-600 bg-amber-50 p-2 rounded-lg mt-2">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-xs">
                   Your next RWT will be added in the next: {nextRewardUpdate}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-orange-200 rounded-lg p-6">
          <div className="flex items-center mb-2">
            <Wallet className="w-5 h-5 mr-2 text-orange-500" />
            <h3 className="text-lg font-semibold">Deposit Assets</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Deposit RGT tokens to earn RWT rewards</p>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-4">
            Your RGT Balance: {tokenBalance ? formatEther(tokenBalance) : "0"} RGT
          </div>
          <div className="space-y-3">
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <strong>How it works:</strong> Every 10 RGT tokens = 1 asset unit that earns 0.1 RWT per day
              {depositAmount && validateInput(depositAmount) && (
                <div className="mt-2 text-blue-700">You'll get: {Number(depositAmount) / 10} asset units</div>
              )}
            </div>

            <input
              placeholder="Amount to deposit (multiples of 10)"
              type="number"
              step="10"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            {!validateInput(depositAmount) && depositAmount && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                ⚠️ Amount must be a multiple of 10 (e.g., 10, 20, 50, 100...)
              </div>
            )}

            {isFirstDeposit && (
              <div className="text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                This will be your first deposit! Rewards start accumulating immediately after 24 hours.
              </div>
            )}
            <div className="flex space-x-3">
              <button
                onClick={handleApprove}
                disabled={!depositAmount || isApproveLoading || isApproved}
                className="flex-1 px-4 py-2 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 disabled:bg-gray-100"
              >
                {isApproveLoading ? "Approving..." : "Approve"}
              </button>
              <button
                onClick={handleDeposit}
                disabled={!depositAmount || isDepositLoading || !isApproved}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300"
              >
                {isDepositLoading ? "Depositing..." : "Deposit"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-2">
            <Gift className="w-5 h-5 mr-2 text-green-500" />
            <h3 className="text-lg font-semibold">Claim Rewards</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Claim your accumulated RWT rewards</p>
          <button
            onClick={handleClaimReward}
            disabled={
              !pendingRewards ||
              Number(pendingRewards) === 0 ||
              isClaimLoading 
            }
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300"
          >
            {isClaimLoading
              ? "Claiming..."
              : nextClaimTime && Number(nextClaimTime) > Date.now() / 1000
                ? "Claim Available Soon"
                : `Claim ${pendingRewards ? Number(formatEther(pendingRewards)).toFixed(2) : "0.00"} RWT`}
          </button>

          {!isFirstDeposit && nextClaimTime && Number(nextClaimTime) > Date.now() / 1000 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Claims available 24 hours after deposit/last claim
            </p>
          )}

        </div>

        {address == "0x1E2c6319d68db43DF109CBbA89b855F505aC6904" && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-2">
              <DollarSign className="w-5 h-5 mr-2 text-gray-500" />
              <h3 className="text-lg font-semibold">Fund Pool</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Pool Balance: {rewardPoolBalance ? formatEther(rewardPoolBalance) : "0"} RWT
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Your RWT Balance: {rewardTokenBalance ? formatEther(rewardTokenBalance) : "0"} RWT
            </p>
            <div className="space-y-3">
              <input
                placeholder="Amount to fund (RWT)"
                type="number"
                step="0.01"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleApproveReward}
                  disabled={!fundAmount || isApproveRewardLoading}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:bg-gray-100"
                >
                  {isApproveRewardLoading ? "Approving..." : "Approve RWT"}
                </button>
                <button
                  onClick={handleFundPool}
                  disabled={!fundAmount || isFundLoading}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:bg-gray-100"
                >
                  {isFundLoading ? "Funding..." : "Fund Pool"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
