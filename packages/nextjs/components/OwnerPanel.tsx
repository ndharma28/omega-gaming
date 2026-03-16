"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Vault, Wallet } from "lucide-react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { CONTRACT_ADDRESS, OMEGA_LOTTERY_ABI } from "~~/constants/abi";

interface OwnerPanelProps {
  show: boolean;
  toggle: () => void;
  treasuryBalance?: { formatted: string; symbol: string };
}

export default function OwnerPanel({ show, toggle, treasuryBalance }: OwnerPanelProps) {
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

  const isTreasuryDisabled = isSettingTreasury || isWaitingForTx || !treasuryAddress;

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

            <div className="bg-black/30 border border-red-900/20 rounded-xl p-4 space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Current Balance</p>
              <p className="text-xl font-black text-white">
                {!treasuryBalance || parseFloat(treasuryBalance.formatted) === 0
                  ? "0.0000 ETH"
                  : `${parseFloat(treasuryBalance.formatted).toFixed(4)} ${treasuryBalance.symbol}`}
              </p>
            </div>

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
