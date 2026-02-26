"use client";

import { LotteryStatus } from "./StatusBar";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  Loader2,
  ShieldCheck,
  Trophy,
  Wallet,
} from "lucide-react";
import { formatEther } from "viem";

interface WinnerHistoryItem {
  lotteryId: bigint;
  winnerAddress: string;
  winnerPayout: bigint;
  totalPot: bigint;
}

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
  winnerHistory?: WinnerHistoryItem[];
}

/**
 * Status Badge for the Header
 */
function StatusBadge({ status }: { status: LotteryStatus }) {
  const config = {
    [LotteryStatus.NOT_STARTED]: { label: "Not Started", class: "bg-slate-800 text-slate-400" },
    [LotteryStatus.OPEN]: { label: "Open", class: "bg-green-500/20 text-green-400 border border-green-500/30" },
    [LotteryStatus.CLOSED]: { label: "Closed", class: "bg-red-500/20 text-red-400 border border-red-500/30" },
    [LotteryStatus.DRAWING]: {
      label: "Drawing...",
      class: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    },
    [LotteryStatus.RESOLVED]: { label: "Resolved", class: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
  };

  const { label, class: cls } = config[status] || config[LotteryStatus.NOT_STARTED];
  return (
    <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
  );
}

/**
 * Helper to determine button state based on contract status
 */
function getButtonConfig(status: LotteryStatus, isPicking: boolean, hasPlayers: boolean) {
  if (isPicking || status === LotteryStatus.DRAWING) {
    return {
      label: "Requesting VRF...",
      disabled: true,
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
      class: "bg-yellow-600/50 text-yellow-100 cursor-not-allowed",
    };
  }
  if (!hasPlayers) {
    return {
      label: "Waiting for Players",
      disabled: true,
      icon: <AlertCircle className="w-4 h-4" />,
      class: "bg-slate-800 text-slate-500 cursor-not-allowed",
    };
  }
  if (status === LotteryStatus.OPEN) {
    return {
      label: "Lottery Still Active",
      disabled: true,
      icon: <Clock className="w-4 h-4" />,
      class: "bg-slate-800 text-slate-500 cursor-not-allowed",
    };
  }
  if (status === LotteryStatus.RESOLVED) {
    return {
      label: "Lottery Completed",
      disabled: true,
      icon: <ShieldCheck className="w-4 h-4" />,
      class: "bg-blue-900/40 text-blue-300 cursor-not-allowed",
    };
  }

  // Ready to draw
  return {
    label: "Trigger Winner Selection",
    disabled: false,
    icon: <Trophy className="w-4 h-4" />,
    class:
      "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-900/20 active:scale-[0.98]",
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
  winnerHistory = [],
}: OwnerPanelProps) {
  const btn = getButtonConfig(status, isPicking, hasPlayers);

  return (
    <div className="group rounded-2xl border border-red-900/30 bg-red-950/5 backdrop-blur-sm overflow-hidden transition-all duration-300">
      {/* COLLAPSIBLE HEADER */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-red-500/5 transition-colors"
        onClick={toggle}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 leading-none">Administrative Panel</h3>
            <p className="text-[10px] text-red-400 font-medium uppercase mt-1 tracking-wider">Restricted Access</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={status} />
          {show ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
      </div>

      {/* EXPANDED CONTENT */}
      {show && (
        <div className="p-6 border-t border-red-900/20 space-y-6 animate-in slide-in-from-top-4 duration-300">
          {/* SECTION: TREASURY INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/40 border border-red-900/30 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-red-400" />
                <span className="text-xs font-semibold text-slate-400 uppercase">Treasury Pot</span>
              </div>
              <div className="text-2xl font-black text-white">
                {treasuryBalance ? `${parseFloat(treasuryBalance.formatted).toFixed(4)}` : "0.0000"}
                <span className="text-sm font-normal text-slate-500 ml-2">{treasuryBalance?.symbol || "ETH"}</span>
              </div>
            </div>

            <div className="bg-black/40 border border-red-900/30 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-red-400" />
                <span className="text-xs font-semibold text-slate-400 uppercase">Total Events</span>
              </div>
              <div className="text-2xl font-black text-white">
                {winnerHistory.length}
                <span className="text-sm font-normal text-slate-500 ml-2">Draws</span>
              </div>
            </div>
          </div>

          {/* SECTION: PREVIOUS WINNERS LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                <History className="w-3.5 h-3.5" /> Payout History
              </h4>
            </div>

            <div className="bg-black/40 rounded-xl border border-red-900/10 max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-900/50">
              {winnerHistory.length > 0 ? (
                <div className="divide-y divide-red-900/10">
                  {winnerHistory.map((log, i) => (
                    <div key={i} className="flex justify-between items-center p-3 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-[10px] font-bold text-red-400 border border-red-500/20">
                          #{log.lotteryId.toString()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-slate-300">
                            {log.winnerAddress.slice(0, 6)}...{log.winnerAddress.slice(-4)}
                          </span>
                          <span className="text-[9px] text-slate-500 uppercase">Selected Winner</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-400">
                          +{parseFloat(formatEther(log.winnerPayout)).toFixed(3)} ETH
                        </div>
                        <div className="text-[9px] text-slate-500">Lottery Pot: {formatEther(log.totalPot)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <Trophy className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 italic">No winners recorded on-chain yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION: ACTION */}
          <div className="pt-2">
            <button
              onClick={onPick}
              disabled={btn.disabled}
              className={`w-full h-14 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${btn.class}`}
            >
              {btn.icon}
              {btn.label}
            </button>
            <p className="text-[10px] text-center text-slate-500 mt-4 leading-relaxed">
              Selection requires a Chainlink VRF callback. This process typically takes 1-2 minutes. Once triggered, the
              lottery status will change to <span className="text-yellow-500">DRAWING</span>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
