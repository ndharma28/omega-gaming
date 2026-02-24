"use client";

import { LotteryStatus } from "./StatusBar";
import { AlertCircle, ChevronDown, ChevronUp, Clock, Loader2, Trophy, Wallet } from "lucide-react";

interface OwnerPanelProps {
  show: boolean;
  toggle: () => void;
  onPick: () => Promise<void>;
  isPicking: boolean;
  hasPlayers: boolean;
  status: LotteryStatus;
  treasuryBalance?: {
    formatted: string;
    symbol: string;
  };
}

function StatusBadge({ status }: { status: LotteryStatus }) {
  const config = {
    [LotteryStatus.NOT_STARTED]: { label: "Not Started", class: "bg-slate-700 text-slate-300" },
    [LotteryStatus.OPEN]: { label: "Open", class: "bg-green-900/60 text-green-300" },
    [LotteryStatus.CLOSED]: { label: "Closed", class: "bg-red-900/60 text-red-300" },
    [LotteryStatus.DRAWING]: { label: "Drawing...", class: "bg-yellow-900/60 text-yellow-300" },
    [LotteryStatus.RESOLVED]: { label: "Resolved", class: "bg-slate-700 text-slate-300" },
  };

  const { label, class: cls } = config[status];
  return <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-md ${cls}`}>{label}</span>;
}

function getButtonConfig(status: LotteryStatus, isPicking: boolean, hasPlayers: boolean) {
  if (isPicking || status === LotteryStatus.DRAWING) {
    return {
      label: "Requesting Randomness...",
      disabled: true,
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
      class: "bg-yellow-700/50 cursor-not-allowed opacity-60",
    };
  }
  if (status === LotteryStatus.RESOLVED) {
    return {
      label: "Lottery Already Resolved",
      disabled: true,
      icon: <Trophy className="w-4 h-4" />,
      class: "bg-slate-700 cursor-not-allowed opacity-60",
    };
  }
  if (status === LotteryStatus.NOT_STARTED) {
    return {
      label: "Lottery Not Started Yet",
      disabled: true,
      icon: <Clock className="w-4 h-4" />,
      class: "bg-slate-700 cursor-not-allowed opacity-60",
    };
  }
  if (!hasPlayers) {
    return {
      label: "No Players Yet",
      disabled: true,
      icon: <AlertCircle className="w-4 h-4" />,
      class: "bg-red-900/40 cursor-not-allowed opacity-60",
    };
  }
  if (status === LotteryStatus.OPEN) {
    return {
      label: "Lottery Still Open",
      disabled: true,
      icon: <Clock className="w-4 h-4" />,
      class: "bg-slate-700 cursor-not-allowed opacity-60",
    };
  }
  // CLOSED — ready to draw
  return {
    label: "Pick Winner Now",
    disabled: false,
    icon: <Trophy className="w-4 h-4" />,
    class: "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-900/20",
  };
}

export default function OwnerPanel({
  show,
  toggle,
  onPick,
  isPicking,
  hasPlayers,
  status,
  treasuryBalance,
}: OwnerPanelProps) {
  const btn = getButtonConfig(status, isPicking, hasPlayers);

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
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          {show ? <ChevronUp className="w-5 h-5 text-red-400" /> : <ChevronDown className="w-5 h-5 text-red-400" />}
        </div>
      </div>

      {show && (
        <div className="p-6 border-t border-red-900/30 space-y-4">
          {/* Treasury Balance */}
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
            Winner selection can only be triggered once the lottery is{" "}
            <span className="text-red-300 font-semibold">Closed</span> and has at least one player. Chainlink VRF
            provides verifiable randomness on-chain.
          </p>

          <button
            onClick={onPick}
            disabled={btn.disabled}
            className={`w-full h-12 rounded-lg font-bold text-lg text-white flex items-center justify-center gap-2 transition-all ${btn.class}`}
          >
            {btn.icon}
            {btn.label}
          </button>
        </div>
      )}
    </div>
  );
}
