"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Vault, Wallet } from "lucide-react";
import { formatEther } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { CONTRACT_ADDRESS, OMEGA_LOTTERY_ABI } from "~~/constants/abi";
import { useWinnerHistory } from "~~/hooks/useWinnerHistory";

interface OwnerPanelProps {
  show: boolean;
  toggle: () => void;
  treasuryBalance?: { formatted: string; symbol: string };
}

export default function OwnerPanel({ show, toggle, treasuryBalance }: OwnerPanelProps) {
  const [winnerCutInput, setWinnerCutInput] = useState("");
  const [winnerCutSuccess, setWinnerCutSuccess] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { totalFeesCollected, winnerHistory, isLoading: isLoadingFees } = useWinnerHistory();

  const { writeContractAsync, isPending: isSettingWinnerCut } = useWriteContract();
  const { isLoading: isWaitingForTx, isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isTxConfirmed) {
      setWinnerCutSuccess(true);
      setWinnerCutInput("");
      setTxHash(undefined);
    }
  }, [isTxConfirmed]);

  const handleSetWinnerCut = async () => {
    const parsed = parseInt(winnerCutInput);
    if (!winnerCutInput || isNaN(parsed) || parsed < 1 || parsed > 99) return;
    try {
      setWinnerCutSuccess(false);
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: OMEGA_LOTTERY_ABI,
        functionName: "setWinnerCut",
        args: [BigInt(parsed)],
      });
      setTxHash(hash);
    } catch (e) {
      console.error("Failed to set winner cut:", e);
    }
  };

  const parsedCut = parseInt(winnerCutInput);
  const isWinnerCutValid = !isNaN(parsedCut) && parsedCut >= 1 && parsedCut <= 99;
  const isWinnerCutDisabled = isSettingWinnerCut || isWaitingForTx || !isWinnerCutValid;

  return (
    <div className="rounded-2xl border border-red-900/30 bg-red-950/10 overflow-hidden">
      <div className="p-4 flex items-center justify-between cursor-pointer bg-red-950/20" onClick={toggle}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-red-500" />
          <span className="font-bold text-red-100">Owner Dashboard</span>
        </div>
        <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black">ADMIN</span>
      </div>

      {show && (
        <div className="p-6 space-y-6 animate-in slide-in-from-top-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-red-400 uppercase flex items-center gap-2">
              <Vault className="w-4 h-4" /> Treasury
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 border border-red-900/20 rounded-xl p-4 space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Current Balance</p>
                <p className="text-xl font-black text-white">
                  {!treasuryBalance || parseFloat(treasuryBalance.formatted) === 0
                    ? "0.0000 ETH"
                    : `${parseFloat(treasuryBalance.formatted).toFixed(4)} ${treasuryBalance.symbol}`}
                </p>
              </div>

              <div className="bg-black/30 border border-red-900/20 rounded-xl p-4 space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Total Fees Collected</p>
                {isLoadingFees ? (
                  <div className="flex items-center gap-2 pt-1">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                    <span className="text-sm text-slate-500">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-xl font-black text-white">
                      {parseFloat(formatEther(totalFeesCollected)).toFixed(4)} ETH
                    </p>
                    <p className="text-[10px] text-slate-600">
                      {winnerHistory.length > 0
                        ? `across ${winnerHistory.length} round${winnerHistory.length !== 1 ? "s" : ""}`
                        : "no rounds yet"}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <label
                htmlFor="winner-cut-input"
                className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1"
              >
                <Wallet className="w-3 h-3" /> Set Winner Cut (1–99%)
              </label>
              <div className="flex gap-2">
                <input
                  id="winner-cut-input"
                  type="number"
                  min={1}
                  max={99}
                  value={winnerCutInput}
                  onChange={e => {
                    setWinnerCutInput(e.target.value);
                    setWinnerCutSuccess(false);
                  }}
                  placeholder="90"
                  className="flex-1 bg-black/40 border border-red-900/30 rounded-lg p-2 text-white text-sm outline-none focus:border-red-500 font-mono"
                />
                <button
                  onClick={handleSetWinnerCut}
                  disabled={isWinnerCutDisabled}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-sm flex items-center justify-center min-w-25 gap-2 disabled:opacity-50 transition-colors"
                >
                  {isSettingWinnerCut || isWaitingForTx ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                      {isWaitingForTx ? "Mining..." : "Signing..."}
                    </>
                  ) : (
                    "Set"
                  )}
                </button>
              </div>
              {!isWinnerCutValid && winnerCutInput !== "" && (
                <p className="text-[10px] text-red-400 font-bold">Must be between 1 and 99</p>
              )}
              {winnerCutSuccess && (
                <p className="text-[10px] text-green-400 font-bold animate-in fade-in">
                  ✓ Winner cut updated successfully
                </p>
              )}
            </div>
          </div>

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
