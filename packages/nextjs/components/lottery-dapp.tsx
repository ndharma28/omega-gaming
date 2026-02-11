"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, RefreshCw, Trophy, Users, Wallet } from "lucide-react";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function LotteryDapp() {
  const { address: connectedAddress } = useAccount();
  const [entryAmount, setEntryAmount] = useState("0.02");
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const isInvalid = Number(entryAmount) < 0.01 || isNaN(Number(entryAmount));

  // --- READ SMART CONTRACT DATA ---
  const { data: potBalance } = useScaffoldReadContract({
    contractName: "Lottery",
    functionName: "getPotBalance",
    watch: true,
  });

  const { data: players } = useScaffoldReadContract({
    contractName: "Lottery",
    functionName: "getPlayers",
    watch: true,
  });

  const { data: owner } = useScaffoldReadContract({
    contractName: "Lottery",
    functionName: "owner",
  });

  // --- WRITE SMART CONTRACT FUNCTIONS ---
  const { writeContractAsync: enterLottery, isPending: isEntering } = useScaffoldWriteContract({
    contractName: "Lottery",
  });
  const { writeContractAsync: pickWinner, isPending: isPicking } = useScaffoldWriteContract({
    contractName: "Lottery",
  });

  // Check if connected user is the owner
  useEffect(() => {
    if (owner && connectedAddress) {
      setIsOwner(owner.toLowerCase() === connectedAddress.toLowerCase());
    } else {
      setIsOwner(false);
    }
  }, [owner, connectedAddress]);

  const handleEnter = async () => {
    try {
      await enterLottery({ functionName: "enter", value: parseEther(entryAmount) });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePickWinner = async () => {
    try {
      await pickWinner({ functionName: "chooseWinner" });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-yellow-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Omega Gaming</h1>
          </div>
          {/* Wallet Display */}
          <div className="px-4 py-2 bg-slate-800 rounded-full border border-slate-700 text-sm font-medium flex items-center gap-2">
            <Wallet className="w-4 h-4 text-slate-400" />
            {connectedAddress ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}` : "Not Connected"}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Pot Balance Card */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none" />
          <div className="p-6 text-center relative">
            <h2 className="text-slate-100 text-sm font-bold uppercase tracking-widest mb-4">Current Pot Balance</h2>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-6xl md:text-7xl font-bold text-yellow-500 tabular-nums drop-shadow-sm">
                {potBalance ? Number(formatEther(potBalance)).toFixed(4) : "0.0000"}
              </span>
              <span className="text-2xl md:text-3xl font-semibold text-yellow-500/50">ETH</span>
            </div>
          </div>
        </div>

        {/* Action Section: Enter Lottery */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-yellow-500" />
            </div>
            <h3 className="font-semibold text-lg text-white">Enter the Lottery</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium text-slate-400">
                Amount (ETH)
              </label>
              <div className="relative">
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={entryAmount}
                  onChange={e => setEntryAmount(e.target.value)}
                  // DYNAMIC CLASS: Soft red border and glow when invalid
                  className={`w-full bg-slate-950 border rounded-lg h-12 px-4 text-lg text-white transition-all outline-none
                        ${
                          isInvalid
                            ? "border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                            : "border-slate-800 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/50"
                        }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">ETH</span>
              </div>

              {/* The error message "transforms" the minimum entry text */}
              <div className="flex items-center gap-2 min-h-[20px]">
                {isInvalid ? (
                  <p className="text-xs font-bold text-red-400 animate-pulse">Minimum entry: 0.01 ETH required</p>
                ) : (
                  <p className="text-xs font-bold text-white tracking-wide opacity-90">Minimum entry: 0.01 ETH</p>
                )}
              </div>
            </div>

            <button
              onClick={handleEnter}
              disabled={isEntering}
              className="w-full h-12 rounded-lg font-bold text-lg bg-yellow-500 text-slate-900 hover:bg-yellow-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_-5px_rgba(234,179,8,0.4)]"
            >
              {isEntering ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" /> Processing...
                </span>
              ) : (
                "Enter Lottery"
              )}
            </button>
          </div>
        </div>

        {/* Players List */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="font-semibold text-lg text-white">Current Players</h3>
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
              {players?.length || 0} participants
            </span>
          </div>

          <div className="h-[200px] overflow-y-auto pr-2 custom-scrollbar rounded-lg bg-slate-950/50 border border-slate-800/50 p-2">
            {!players || players.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                <Users className="w-8 h-8 opacity-20" />
                <p>No players yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {players.map((player: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 px-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-mono w-6">#{index + 1}</span>
                      <span className="font-mono text-sm text-slate-300">
                        {player.slice(0, 6)}...{player.slice(-4)}
                      </span>
                    </div>
                    {connectedAddress && player.toLowerCase() === connectedAddress.toLowerCase() && (
                      <span className="text-[10px] uppercase font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Owner Panel (Only shows if YOU are the owner) */}
        {isOwner && (
          <div className="rounded-xl border border-red-900/30 bg-red-950/10 overflow-hidden">
            <div
              className="p-4 flex items-center justify-between cursor-pointer bg-red-950/20 hover:bg-red-950/30 transition-colors"
              onClick={() => setShowOwnerPanel(!showOwnerPanel)}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="font-semibold text-red-100">Owner Panel</span>
              </div>
              {showOwnerPanel ? (
                <ChevronUp className="w-5 h-5 text-red-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-red-400" />
              )}
            </div>

            {showOwnerPanel && (
              <div className="p-6 border-t border-red-900/30 space-y-4">
                <p className="text-sm text-red-200/70">
                  As the admin, you can trigger the random winner selection. The entire pot will be transferred
                  immediately.
                </p>
                <button
                  onClick={handlePickWinner}
                  disabled={isPicking || !players || players.length === 0}
                  className="w-full h-12 rounded-lg font-bold text-lg bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPicking ? "Picking Winner..." : "Pick Winner Now"}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
