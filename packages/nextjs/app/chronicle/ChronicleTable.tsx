"use client";

import { useEffect, useState } from "react";
import { ALL_RANKS, RANK_COLORS, classifyPrize, formatTimestamp, shortenAddress } from "./lib";
import { formatEther } from "viem";
import { type WinnerEntry } from "~~/hooks/useWinnerHistory";

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[3rem_1fr_1fr_1fr_6rem] gap-4 px-6 py-4 border-b border-yellow-900/10">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-3 rounded bg-yellow-900/10 animate-pulse" />
      ))}
    </div>
  );
}

function EmptySigil() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-yellow-700/60 mx-auto">
      <polygon points="24,4 44,36 4,36" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="0.75" fill="none" />
      <line x1="24" y1="4" x2="24" y2="44" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
      <line x1="4" y1="36" x2="44" y2="36" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
      <line x1="4" y1="36" x2="44" y2="12" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
    </svg>
  );
}

interface ChronicleTableProps {
  winnerHistory: WinnerEntry[];
  totalFeesCollected: bigint;
  isLoading: boolean;
  activeSource: number;
}

export default function ChronicleTable({
  winnerHistory,
  totalFeesCollected,
  isLoading,
  activeSource,
}: ChronicleTableProps) {
  const [revealedRows, setRevealedRows] = useState<Set<number>>(new Set());
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterRank, setFilterRank] = useState("All");

  // Staggered row reveal on load
  useEffect(() => {
    if (isLoading || winnerHistory.length === 0) return;
    setRevealedRows(new Set());
    winnerHistory.forEach((_, i) => {
      setTimeout(() => {
        setRevealedRows(prev => new Set([...prev, i]));
      }, 80 * i);
    });
  }, [isLoading, winnerHistory]);

  const processedHistory = [...winnerHistory]
    .sort((a, b) =>
      sortDir === "desc" ? Number(b.endTime) - Number(a.endTime) : Number(a.endTime) - Number(b.endTime),
    )
    .filter(entry => {
      if (filterRank === "All") return true;
      return classifyPrize(parseFloat(formatEther(entry.prizeAmount))) === filterRank;
    });

  return (
    <div className="space-y-8">
      {/* Filters + sort */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {ALL_RANKS.map(rank => (
            <button
              key={rank}
              onClick={() => setFilterRank(rank)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                filterRank === rank
                  ? "bg-yellow-900/30 border-yellow-700/50 text-yellow-300"
                  : "bg-black/40 border-yellow-900/20 text-slate-500 hover:text-slate-300"
              }`}
            >
              {rank}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSortDir(d => (d === "desc" ? "asc" : "desc"))}
          className="text-[11px] text-slate-500 hover:text-slate-200 font-bold flex items-center gap-1 transition-colors"
        >
          {sortDir === "desc" ? "↓ Newest first" : "↑ Oldest first"}
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-yellow-900/20 overflow-hidden backdrop-blur-sm">
        {/* Header */}
        <div className="grid grid-cols-[3rem_1fr_1fr_1fr_6rem] gap-4 px-6 py-3 bg-yellow-950/20 border-b border-yellow-900/20">
          {["#", "Address", "Prize", "Rank", "Date"].map(col => (
            <span key={col} className="text-[10px] text-yellow-700 uppercase tracking-widest font-bold">
              {col}
            </span>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div>
            {[...Array(6)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && winnerHistory.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <EmptySigil />
            <p className="text-sm text-slate-500">The ledger awaits its first entry.</p>
            <p className="text-[11px] text-slate-600">No rounds have concluded on this contract yet.</p>
          </div>
        )}

        {/* No filter results */}
        {!isLoading && winnerHistory.length > 0 && processedHistory.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-500">No entries match this rank filter.</p>
          </div>
        )}

        {/* Rows */}
        {!isLoading && processedHistory.length > 0 && (
          <div className="divide-y divide-yellow-900/10">
            {processedHistory.map((entry, i) => {
              const ethAmount = parseFloat(formatEther(entry.prizeAmount));
              const rank = classifyPrize(ethAmount);
              const isRevealed = revealedRows.has(i);

              return (
                <div
                  key={`${entry.roundId}-${activeSource}`}
                  className={`grid grid-cols-[3rem_1fr_1fr_1fr_6rem] gap-4 px-6 py-4 hover:bg-yellow-950/10 transition-all duration-300 ${
                    isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
                >
                  <span className="text-xs font-bold text-slate-500 self-center">#{entry.roundId}</span>
                  <span className="text-xs font-mono text-yellow-400 self-center truncate" title={entry.winner}>
                    {shortenAddress(entry.winner)}
                  </span>
                  <span className="text-xs font-bold text-green-400 self-center">{ethAmount.toFixed(4)} ETH</span>
                  <span className="self-center">
                    <span
                      className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full border tracking-wide ${RANK_COLORS[rank]}`}
                    >
                      {rank.toUpperCase()}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400 self-center">{formatTimestamp(entry.endTime)}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {processedHistory.length > 0 && (
          <div className="px-6 py-3 bg-yellow-950/10 border-t border-yellow-900/20 flex justify-between items-center">
            <span className="text-[10px] text-slate-500">
              {processedHistory.length} entr{processedHistory.length === 1 ? "y" : "ies"} shown
            </span>
            <span className="text-[10px] text-yellow-600 font-bold">
              {parseFloat(formatEther(totalFeesCollected)).toFixed(4)} ETH total
            </span>
          </div>
        )}
      </div>

      {/* Rank legend */}
      <div className="rounded-2xl border border-yellow-900/20 bg-black/30 p-6 space-y-4 backdrop-blur-sm">
        <p className="text-[10px] text-yellow-700 uppercase tracking-widest font-bold">Tier Classification</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { rank: "Spark", range: "< 0.01 ETH" },
            { rank: "Initiate", range: "0.01 – 0.1 ETH" },
            { rank: "Ascendant", range: "0.1 – 0.5 ETH" },
            { rank: "Titan", range: "0.5 – 1 ETH" },
            { rank: "Sovereign", range: "≥ 1 ETH" },
          ].map(({ rank, range }) => (
            <div key={rank} className="space-y-1">
              <span
                className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full border tracking-wide ${RANK_COLORS[rank]}`}
              >
                {rank.toUpperCase()}
              </span>
              <p className="text-[11px] text-slate-400">{range}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
