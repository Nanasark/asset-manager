"use client"
import { useState, useEffect } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { Coins, Clock } from "lucide-react"
import { formatEther, parseEther } from "viem"
import { Toast, useToast } from "./Toast"
import { RGT_TOKEN_ABI, RGT_TOKEN_ADDRESS } from "@/lib/contractst"

export default function TokenManager() {
  const { address } = useAccount()
  const [mintAmount, setMintAmount] = useState("")
  const [mintToAddress, setMintToAddress] = useState("")
  const { toast, showError, showSuccess, hideToast } = useToast()

  const { data: balance, } = useReadContract({
    abi: RGT_TOKEN_ABI,
    address: RGT_TOKEN_ADDRESS,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  })

  const { data: lastMintTime } = useReadContract({
    abi: RGT_TOKEN_ABI,
    address: RGT_TOKEN_ADDRESS,
    functionName: "lastMintTime",
    args: address ? [address] : undefined,
  })

  const { writeContract: mint, data: mintHash, error: mintError } = useWriteContract()
  const { writeContract: adminMint, data: adminMintHash, error: adminMintError } = useWriteContract()

  const { isLoading: isMintLoading, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({ hash: mintHash })
  const { isLoading: isAdminMintLoading, isSuccess: isAdminMintSuccess } = useWaitForTransactionReceipt({
    hash: adminMintHash,
  })

  const canMint = lastMintTime ? Date.now() / 1000 >= Number(lastMintTime) + 86400 : true
  const timeUntilNextMint = lastMintTime ? Math.max(0, Number(lastMintTime) + 86400 - Date.now() / 1000) : 0

  useEffect(() => {
    if (mintError) showError(`Mint failed: ${mintError.message}`)
    if (adminMintError) showError(`Admin mint failed: ${adminMintError.message}`)
  }, [mintError, adminMintError])

  
  useEffect(() => {
    if (isMintSuccess) showSuccess("100 RGT tokens minted successfully!")
    if (isAdminMintSuccess) showSuccess("Admin mint completed successfully!")
  }, [isMintSuccess, isAdminMintSuccess])

  const handleMint = () => {
    try {
      mint({ abi: RGT_TOKEN_ABI, address: RGT_TOKEN_ADDRESS, functionName: "mint" })
    } catch (error) {
      showError("Failed to initiate mint")
    }
  }

  const handleAdminMint = () => {
    if (!mintToAddress || !mintAmount) {
      showError("Please fill in both address and amount")
      return
    }
    try {
      adminMint({
        abi: RGT_TOKEN_ABI,
        address: RGT_TOKEN_ADDRESS,
        functionName: "adminMint",
        args: [mintToAddress as `0x${string}`, parseEther(mintAmount)],
      })
    } catch (error) {
      showError("Failed to initiate admin mint")
    }
  }

  return (
    <>
      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />

      <div className="space-y-6">
        <div className="bg-white border border-orange-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Coins className="w-5 h-5 mr-2 text-orange-500" />
            <h3 className="text-lg font-semibold">RGT Balance</h3>
          </div>
          <div className="text-2xl font-bold text-orange-600">{balance ? formatEther(balance) : "0"} RGT</div>
        </div>

        <div className="bg-white border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Daily Mint (100 RGT)</h3>
          <p className="text-sm text-gray-600 mb-4">Mint 100 RGT tokens once every 24 hours</p>
          {!canMint && (
            <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-lg mb-4">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm">
                Next mint in {Math.floor(timeUntilNextMint / 3600)}h {Math.floor((timeUntilNextMint % 3600) / 60)}m
              </span>
            </div>
          )}
          <button
            onClick={handleMint}
            disabled={!canMint || isMintLoading}
            className="cursor-pointer w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300"
          >
            {isMintLoading ? "Minting..." : "Mint 100 RGT"}
          </button>
        </div>

        {address == "0x1E2c6319d68db43DF109CBbA89b855F505aC6904" && (
          <div className="bg-white border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Admin Mint</h3>
            <p className="text-sm text-gray-600 mb-4">Mint tokens to any address (owner only)</p>
            <div className="space-y-3">
              <input
                placeholder="Recipient address"
                value={mintToAddress}
                onChange={(e) => setMintToAddress(e.target.value)}
                className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                placeholder="Amount (in tokens)"
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleAdminMint}
                disabled={!mintToAddress || !mintAmount || isAdminMintLoading}
                className="cursor-pointer w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300"
              >
                {isAdminMintLoading ? "Minting..." : "Admin Mint"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
