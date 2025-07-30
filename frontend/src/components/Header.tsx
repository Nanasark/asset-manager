"use client"
import { useAccount, useBalance, useConnect, useDisconnect, useReadContract } from "wagmi"
import { Wallet } from "lucide-react"
import { formatEther } from "viem"
import { RGT_TOKEN_ABI,RGT_TOKEN_ADDRESS, REWARD_TOKEN_ADDRESS } from "@/lib/contractst"
import ConnectButton from "./ConnectButton"
import Link from "next/link"

export default function Header() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { disconnect } = useDisconnect()

  const { data: rgtBalance } = useReadContract({
    abi: RGT_TOKEN_ABI,
    address: RGT_TOKEN_ADDRESS,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  })

  const { data: rewardBalance } = useReadContract({
    abi: RGT_TOKEN_ABI,
    address: REWARD_TOKEN_ADDRESS,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  })

  return (
    <nav className="bg-white border-b border-orange-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
      <div className="flex items-center space-x-4">
  <Link href="/" className="flex items-center space-x-3">
    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
      <Wallet className="w-5 h-5 text-white" />
    </div>
    <h1 className="text-xl font-bold text-gray-900">Asset Manager</h1>
  </Link>

  <Link href="/docs" className="font-semibold text-sm text-gray-700 hover:underline">
    Docs
  </Link>
</div>



        <div className="flex items-center space-x-4">
          {isConnected ? (
            <>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {balance ? `${Number.parseFloat(formatEther(balance.value)).toFixed(4)} AVAX` : "0 AVAX"}
                </p>
                <p className="text-sm text-orange-600">
                  {rgtBalance ? `${Number.parseFloat(formatEther(rgtBalance)).toFixed(0)} RGT` : "0 RGT"}
                </p>
                <p className="text-sm text-green-600">
                  {rewardBalance ? `${Number.parseFloat(formatEther(rewardBalance)).toFixed(2)} RWT` : "0 RWT"}
                </p>
                <p className="text-xs text-gray-400">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
              <button
                onClick={() => disconnect()}
                className="px-3 py-2 text-sm text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50"
              >
                Disconnect
              </button>
            </>
          ) : (
          
            <ConnectButton />
          )}
        </div>
      </div>
    </nav>
  )
}
