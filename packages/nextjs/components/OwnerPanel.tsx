"use client";

import { useState } from "react";
import { LotteryStatus } from "./StatusBar";
import { Clock, Loader2, PlusCircle, ShieldCheck, Trophy, Wallet } from "lucide-react";

interface OwnerPanelProps {
  show: boolean;
  toggle: () => void;
  onPick: () => Promise<void>;
  onCreate: (fee: string, start: number, end: number) => Promise<void>; // Added
  isPicking: boolean;
  isCreating: boolean; // Added
  hasPlayers: boolean; // Added
  status: LotteryStatus;
  treasuryBalance?: { formatted: string; symbol: string };
  winnerHistory?: any[]; // Adjust type as needed
}

export default function OwnerPanel({
  show,
  toggle,
  onPick,
  onCreate,
  isPicking,
  isCreating,
  hasPlayers,
  status,
  treasuryBalance,
  winnerHistory = [],
}: OwnerPanelProps) {
  const [fee, setFee] = useState("0.02");
  const [durationHours, setDurationHours] = useState("24");

  const handleCreate = async () => {
    const start = Math.floor(Date.now() / 1000);
    const end = start + parseInt(durationHours) * 3600;
    await onCreate(fee, start, end);
  };

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
        <div className="p-6 space-y-8 animate-in slide-in-from-top-4">
          {/* CREATE NEW ROUND SECTION */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-red-400 uppercase flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Start New Lottery Round
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Entry Fee (ETH)</label>
                <input
                  type="number"
                  value={fee}
                  onChange={e => setFee(e.target.value)}
                  className="w-full bg-black/40 border border-red-900/30 rounded-lg p-2 text-white outline-none focus:border-red-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Duration (Hours)</label>
                <input
                  type="number"
                  value={durationHours}
                  onChange={e => setDurationHours(e.target.value)}
                  className="w-full bg-black/40 border border-red-900/30 rounded-lg p-2 text-white outline-none focus:border-red-500"
                />
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCreating ? <Loader2 className="animate-spin w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
              Deploy New Round
            </button>
          </div>

          <div className="border-t border-red-900/20 pt-6">
            {/* Section for Picking Winner (onPick) goes here... */}
            <button
              onClick={onPick}
              disabled={isPicking || status !== LotteryStatus.CLOSED}
              className="w-full py-4 bg-slate-800 border border-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-30"
            >
              <Trophy className="w-5 h-5 text-yellow-500" />
              Pick Winner (Requires VRF)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
