"use client";

import { AlertCircle, ChevronDown, ChevronUp, Wallet } from "lucide-react";

interface OwnerPanelProps {
  show: boolean;
  toggle: () => void;
  onPick: () => Promise<void>;
  isPicking: boolean;
  hasPlayers: boolean;
  // 👉 NEW: Add the balance object to the props interface
  treasuryBalance?: {
    formatted: string;
    symbol: string;
  };
}

export default function OwnerPanel({ show, toggle, onPick, isPicking, hasPlayers, treasuryBalance }: OwnerPanelProps) {
  return (
    <div className="rounded-xl border border-red-900/30 bg-red-950/10 overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer bg-red-950/20 hover:bg-red-950/30 transition-colors"
        onClick={toggle}
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="font-semibold text-red-100">Owner Panel</span>
        </div>
        {show ? <ChevronUp className="w-5 h-5 text-red-400" /> : <ChevronDown className="w-5 h-5 text-red-400" />}
      </div>

      {show && (
        <div className="p-6 border-t border-red-900/30 space-y-4">
          {/* 👉 NEW: Treasury Balance Display */}
          <div className="flex items-center justify-between bg-red-950/40 p-4 rounded-lg border border-red-900/50">
            <div className="flex items-center gap-2 text-red-200/80">
              <Wallet className="w-5 h-5" />
              <span className="font-medium text-sm">Treasury Balance</span>
            </div>
            <div className="text-xl font-bold text-red-100">
              {treasuryBalance ? `${treasuryBalance.formatted} ${treasuryBalance.symbol}` : "Loading..."}
            </div>
          </div>

          <p className="text-sm text-red-200/70">
            As the admin, you can trigger the random winner selection. The entire pot will be transferred immediately.
          </p>
          <button
            onClick={onPick}
            disabled={isPicking || !hasPlayers}
            className="w-full h-12 rounded-lg font-bold text-lg bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPicking ? "Picking Winner..." : "Pick Winner Now"}
          </button>
        </div>
      )}
    </div>
  );
}
