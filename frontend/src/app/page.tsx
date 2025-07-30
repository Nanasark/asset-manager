"use client"
import { useState } from "react"
import { useAccount } from "wagmi"
import Header from "@/components/Header"
import AssetManager from "@/components/AssetManager"
import { Coins, TrendingUp } from "lucide-react"
import TokenManager from "@/components/TokenMnager"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"asset" | "token">("asset")
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Asset Manager</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Connect your wallet to manage RGT tokens and earn RWT rewards.
            </p>
          </div>
        ) : (
          <>
            <div className="flex space-x-2 bg-white/80 backdrop-blur-sm p-2 rounded-lg mb-8 border border-gray-200">
              <button
                onClick={() => setActiveTab("asset")}
                className={`cursor-pointer flex-1 flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "asset" ? "bg-green-500 text-white" : "text-gray-600 hover:bg-white"
                }`}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Asset Manager
              </button>
              <button
                onClick={() => setActiveTab("token")}
                className={`cursor-pointer flex-1 flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "token" ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-white"
                }`}
              >
                <Coins className="w-4 h-4 mr-2" />
                RGT Token
              </button>
            </div>
            {activeTab === "asset" ? <AssetManager /> : <TokenManager />}
          </>
        )}
      </main>
    </div>
  )
}
