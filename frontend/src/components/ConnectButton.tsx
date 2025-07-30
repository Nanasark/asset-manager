"use client";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { Wallet, ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";

export default function ConnectButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { connect, connectors, isPending, error } = useConnect();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Filter only MetaMask and Injected
  const filteredConnectors = connectors.filter(
    (c) =>
      c.id === "metaMask" ||
      c.id === "injected" ||
      c.name.toLowerCase().includes("metamask") ||
      c.name.toLowerCase().includes("injected")
  );

  const getIcon = (id: string) => {
    if (id === "injected") return "👛";
    return "🦊";
  };

  const getName = (id: string) => {
    if (id === "metaMaskSDK") return "MetaMask";
    if (id === "injected") return "Injected Wallet";
    return id;
  };

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className="cursor-pointer flex items-center px-4 py-2 text-sm font-medium text-orange-600 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Disconnect
      </button>
    );
  }

  return (
    <div className="relative">
      {/* <div className="bottom-0 absolute">
        {error && <div className="text-red-500 text-sm mb-2">Error: {error.message}</div>}
      </div> */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="cursor-pointer flex items-center px-6 py-3 text-white bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50"
      >
        <Wallet className="  w-4 h-4 mr-2" />
        Connect Wallet
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      {isOpen && (
        <>
          <div className="cursor-pointer fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 w-56 bg-white border border-orange-100 rounded-lg shadow-xl z-50">
            {filteredConnectors.length === 0 ? (
              <div className="px-4 py-3 text-gray-500">No wallets available</div>
            ) : (
              filteredConnectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => {
                    connect({ connector });
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-left hover:bg-orange-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                >
                  <span className="text-lg mr-3">{getIcon(connector.id)}</span>
                  <span className="font-medium text-gray-900">{getName(connector.id)}</span>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
