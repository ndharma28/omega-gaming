"use client";

import { classifyPrize } from "./lib";
import { formatEther } from "viem";
import { type WinnerEntry } from "~~/hooks/useWinnerHistory";

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-black/40 border border-yellow-900/20 rounded-2xl p-5 space-y-1 backdrop-blur-sm">
      <p className="text-[10px] text-yellow-700 uppercase tracking-widest font-bold">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
      {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
    </div>
  );
}

interface ChronicleStatsProps {
  winnerHistory: WinnerEntry[];
}

export default function ChronicleStats({ winnerHistory }: ChronicleStatsProps) {
  const uniqueWinners = new Set(winnerHistory.map(e => e.winner)).size;
  const topPrize =
    winnerHistory.length > 0 ? Math.max(...winnerHistory.map(e => parseFloat(formatEther(e.prizeAmount)))) : 0;
  const totalDistributed = winnerHistory.reduce((acc, e) => acc + e.prizeAmount, 0n);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Rounds Completed" value={winnerHistory.length.toString()} sub="verified on-chain" />
      <StatCard
        label="Total Distributed"
        value={`${parseFloat(formatEther(totalDistributed)).toFixed(4)} ETH`}
        sub="to winners"
      />
      <StatCard
        label="Unique Winners"
        value={uniqueWinners.toString()}
        sub={`${winnerHistory.length > 0 ? ((uniqueWinners / winnerHistory.length) * 100).toFixed(0) : 0}% unique`}
      />
      <StatCard
        label="Record Prize"
        value={topPrize > 0 ? `${topPrize.toFixed(4)} ETH` : "—"}
        sub={topPrize > 0 ? `${classifyPrize(topPrize)} tier` : "no rounds yet"}
      />
    </div>
  );
}
