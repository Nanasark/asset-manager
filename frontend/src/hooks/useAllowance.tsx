import { useEffect } from "react"
import { useReadContract } from "wagmi"
import { RGT_TOKEN_ABI } from "@/lib/contractst"
import { parseEther } from "viem"

export function useAllowance({
  owner,
  spender,
  tokenAddress,
  amount,
}: {
  owner: `0x${string}`
  spender: `0x${string}`
  tokenAddress: `0x${string}`
  amount: string
}) {
  const {
    data: allowance,
    refetch,
    isLoading,
  } = useReadContract({
    abi: RGT_TOKEN_ABI,
    address: tokenAddress,
    functionName: "allowance",
    args: [owner, spender],
  })

  const isApproved = allowance && amount
    ? BigInt(allowance) >= parseEther(amount)
    : false

  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 4000)
    return () => clearInterval(interval)
  }, [refetch])

  return { allowance, isApproved, isLoading, refetch }
}
