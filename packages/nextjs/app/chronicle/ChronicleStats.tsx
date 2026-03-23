"use client";

import { classifyPrize } from "./lib";
import { formatEther } from "viem";
import { type WinnerEntry } from "~~/hooks/useWinnerHistory";

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="chronicle-card p-5 space-y-1">
      <p className="chronicle-label">{label}</p>
      <p className="chronicle-text-primary">{value}</p>
      {sub && <p className="chronicle-text-secondary">{sub}</p>}
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
