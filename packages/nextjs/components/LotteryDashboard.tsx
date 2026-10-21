import React from "react";
import { formatEther } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { CONTRACT_ADDRESS, OMEGA_LOTTERY_ABI } from "~~/constants/abi";

export function LotteryDashboard() {
  const { address, isConnected } = useAccount();

  // 1. Fetch current lottery counter
  const { data: counter } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "lotteryIdCounter",
  });

  const currentId = counter ? counter - 1n : 0n;

  // 2. Fetch details for the active lottery round
  const { data: lottery, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "getLottery",
    args: [currentId],
  });

  // 3. Fetch player count for the current round
  const { data: playerCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "getPlayerCount",
    args: [currentId],
  });

  // 4. Write hook for joining the lottery using joinLottery(lotteryId)
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleJoin = () => {
    if (!lottery) return;
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: OMEGA_LOTTERY_ABI,
      functionName: "joinLottery",
      args: [currentId],
      value: lottery.entryFee, // Send exact entry fee in Wei
    });
  };

  if (!isConnected) {
    return (
      <div className="p-8 text-center bg-slate-900 text-white rounded-xl shadow-xl max-w-md mx-auto mt-10">
        <h3 className="text-xl font-bold mb-2">Omega Gaming Lottery</h3>
        <p className="text-slate-400 text-sm">Please connect your wallet to participate.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Lottery Round #{currentId.toString()}</h2>
        <span className="text-xs px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full font-medium">
          Sepolia Testnet
        </span>
      </div>

      {lottery ? (
        <div className="space-y-3 mb-6 bg-slate-800/60 p-4 rounded-lg border border-slate-700/50">
          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="font-semibold">
              {lottery.status === 0 ? "🟢 OPEN" : lottery.status === 1 ? "🟡 DRAWING" : "🔴 RESOLVED"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Entry Fee:</span>
            <span className="font-semibold">{formatEther(lottery.entryFee)} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Pot:</span>
            <span className="font-semibold text-emerald-400">{formatEther(lottery.totalPot)} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Players:</span>
            <span className="font-semibold">{playerCount?.toString() || "0"}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-700">
            <span className="text-slate-400">Winner:</span>
            <span className="font-mono text-xs text-amber-400 truncate max-w-50">
              {lottery.winner === "0x0000000000000000000000000000000000000000" ? "Pending Draw..." : lottery.winner}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-slate-400 text-center py-6">Loading active lottery data...</p>
      )}

      <button
        onClick={handleJoin}
        disabled={isPending || isConfirming || lottery?.status !== 0}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 font-semibold rounded-lg transition-all shadow-lg shadow-indigo-600/20"
      >
        {isPending || isConfirming
          ? "Confirming Transaction..."
          : `Join Lottery (${lottery ? formatEther(lottery.entryFee) : "0"} ETH)`}
      </button>

      {isSuccess && (
        <p className="mt-4 text-emerald-400 text-center text-sm font-medium animate-pulse">
          🎉 Successfully entered the lottery round!
        </p>
      )}
    </div>
  );
}
