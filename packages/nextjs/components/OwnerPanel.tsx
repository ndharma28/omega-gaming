"use client";

import { useEffect, useState } from "react";
import { Clock, Loader2, ShieldCheck, Trophy, Vault, Wallet } from "lucide-react";
import { formatEther } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { CONTRACT_ADDRESS, OMEGA_LOTTERY_ABI } from "~~/constants/abi";

interface WinnerEntry {
  winner?: string;
  totalPot?: string | bigint;
  roundId?: number | string;
  timestamp?: number | string;
  prizeAmount?: string | bigint;
}

interface OwnerPanelProps {
  show: boolean;
  toggle: () => void;
  treasuryBalance?: { formatted: string; symbol: string };
  winnerHistory?: WinnerEntry[];
}

function shortenAddress(addr?: string) {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatTimestamp(ts?: number | string) {
  if (!ts) return "—";
  const date = new Date(typeof ts === "string" ? parseInt(ts) * 1000 : ts * 1000);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function OwnerPanel({ show, toggle, treasuryBalance, winnerHistory = [] }: OwnerPanelProps) {
  const [treasuryAddress, setTreasuryAddress] = useState("");
  const [treasurySuccess, setTreasurySuccess] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { writeContractAsync, isPending: isSettingTreasury } = useWriteContract();
  const { isLoading: isWaitingForTx, isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isTxConfirmed) {
      setTreasurySuccess(true);
      setTreasuryAddress("");
      setTxHash(undefined);
    }
  }, [isTxConfirmed]);

  const handleSetTreasury = async () => {
    if (!treasuryAddress) return;
    try {
      setTreasurySuccess(false);
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: OMEGA_LOTTERY_ABI,
        functionName: "setTreasury",
        args: [treasuryAddress],
      });
      setTxHash(hash);
    } catch (e) {
      console.error("Failed to set treasury:", e);
    }
  };

  // Calculate total fees (2% of each pot)
  const totalFeesCollected = winnerHistory.reduce((acc, entry) => {
    if (!entry?.totalPot) return acc;
    try {
      const pot = BigInt(entry.totalPot);
      const feeAmount = (pot * 2n) / 100n;
      return acc + feeAmount;
    } catch {
      return acc;
    }
  }, 0n);

  const successfulRounds = winnerHistory.filter(e => e?.winner).length;
  const isTreasuryDisabled = isSettingTreasury || isWaitingForTx || !treasuryAddress;

  return (
    <div className="rounded-2xl border border-red-900/30 bg-red-950/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between cursor-pointer bg-red-950/20" onClick={toggle}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-red-500" />
          <span className="font-bold text-red-100">Owner Dashboard</span>
        </div>
        <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black">ADMIN</span>
      </div>

      {show && (
        <div className="p-6 space-y-6 animate-in slide-in-from-top-4">
          {/* Treasury Stats */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-red-400 uppercase flex items-center gap-2">
              <Vault className="w-4 h-4" /> Treasury
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {/* Current Balance */}
              <div className="bg-black/30 border border-red-900/20 rounded-xl p-4 space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Current Balance</p>
                <p className="text-xl font-black text-white">
                  {!treasuryBalance || parseFloat(treasuryBalance.formatted) === 0
                    ? "0.0000 ETH"
                    : `${parseFloat(treasuryBalance.formatted).toFixed(4)} ${treasuryBalance.symbol}`}
                </p>
              </div>

              {/* Total Fees Collected — fixed: uses successfulRounds not winnerHistory.length */}
              <div className="bg-black/30 border border-red-900/20 rounded-xl p-4 space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Total Fees Collected</p>
                <p className="text-xl font-black text-white">
                  {successfulRounds > 0
                    ? `${parseFloat(formatEther(totalFeesCollected)).toFixed(4)} ETH`
                    : "0.0000 ETH"}
                </p>
                <p className="text-[10px] text-slate-600">
                  {successfulRounds > 0
                    ? `across ${successfulRounds} successful round${successfulRounds !== 1 ? "s" : ""}`
                    : "No rounds completed yet"}
                </p>
              </div>
            </div>

            {/* Set Treasury Address */}
            <div className="space-y-2 mt-4">
              <label
                htmlFor="treasury-input"
                className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1"
              >
                <Wallet className="w-3 h-3" /> Set Treasury Address
              </label>
              <div className="flex gap-2">
                <input
                  id="treasury-input"
                  type="text"
                  value={treasuryAddress}
                  onChange={e => {
                    setTreasuryAddress(e.target.value);
                    setTreasurySuccess(false);
                  }}
                  placeholder="0x..."
                  className="flex-1 bg-black/40 border border-red-900/30 rounded-lg p-2 text-white text-sm outline-none focus:border-red-500 font-mono"
                />
                <button
                  onClick={handleSetTreasury}
                  disabled={isTreasuryDisabled}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-sm flex items-center justify-center min-w-[100px] gap-2 disabled:opacity-50 transition-colors"
                >
                  {isSettingTreasury || isWaitingForTx ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                      {isWaitingForTx ? "Mining..." : "Signing..."}
                    </>
                  ) : (
                    "Set"
                  )}
                </button>
              </div>
              {treasurySuccess && (
                <p className="text-[10px] text-green-400 font-bold animate-in fade-in">
                  ✓ Treasury address updated successfully
                </p>
              )}
            </div>
          </div>

          {/* Winner History Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-red-400 uppercase flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Previous Winners
            </h4>

            {winnerHistory.length === 0 ? (
              <div className="bg-black/20 border border-red-900/20 rounded-xl p-6 text-center">
                <Trophy className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-medium">No completed rounds yet</p>
                <p className="text-[10px] text-slate-600 mt-1">Winners will appear here after each round</p>
              </div>
            ) : (
              <div className="bg-black/20 border border-red-900/20 rounded-xl overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-4 gap-2 px-4 py-2 bg-red-950/30 border-b border-red-900/20">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Round</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Winner</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Prize</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Date
                  </span>
                </div>

                {/* Table rows — newest first */}
                <div className="divide-y divide-red-900/10 max-h-64 overflow-y-auto">
                  {[...winnerHistory].reverse().map((entry, i) => {
                    const pot = entry?.totalPot ? BigInt(entry.totalPot) : 0n;
                    const prize = entry?.prizeAmount ? BigInt(entry.prizeAmount) : (pot * 98n) / 100n; // fallback: 98% of pot

                    return (
                      <div key={i} className="grid grid-cols-4 gap-2 px-4 py-3 hover:bg-red-950/10 transition-colors">
                        <span className="text-xs font-bold text-slate-300">
                          #{entry.roundId ?? winnerHistory.length - i}
                        </span>
                        <span className="text-xs font-mono text-yellow-400 truncate" title={entry.winner}>
                          {shortenAddress(entry.winner)}
                        </span>
                        <span className="text-xs font-bold text-green-400">
                          {pot > 0n ? `${parseFloat(formatEther(prize)).toFixed(4)} ETH` : "—"}
                        </span>
                        <span className="text-xs text-slate-500">{formatTimestamp(entry.timestamp)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Footer summary */}
                <div className="px-4 py-2 bg-red-950/10 border-t border-red-900/20 flex justify-between items-center">
                  <span className="text-[10px] text-slate-600">
                    {winnerHistory.length} round{winnerHistory.length !== 1 ? "s" : ""} total
                  </span>
                  <span className="text-[10px] text-red-400 font-bold">
                    {parseFloat(formatEther(totalFeesCollected)).toFixed(4)} ETH in fees
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-red-900/20 pt-4">
            <p className="text-xs text-slate-400 text-center">
              Lottery rounds and winner selection are now 100% automated by Chainlink VRF and Automation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
