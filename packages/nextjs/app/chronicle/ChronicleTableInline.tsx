"use client";

import { useEffect, useState } from "react";
import { EmptySigil, SkeletonRow } from "./ChronicleShared.tsx";
import TableRow from "./TableRow.tsx";
import { ALL_RANKS, RANK_COLORS, classifyPrize } from "./lib";
import { formatEther } from "viem";
import { type WinnerEntry } from "~~/hooks/useWinnerHistory";

const TABLE_COLS = ["#", "Address", "Prize", "Rank"];

interface ChronicleTableInlineProps {
  winnerHistory: WinnerEntry[];
  isLoading: boolean;
  activeSource: number;
}

export default function ChronicleTableInline({ winnerHistory, isLoading, activeSource }: ChronicleTableInlineProps) {
  const [revealedRows, setRevealedRows] = useState<Set<number>>(new Set());
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterRank, setFilterRank] = useState("All");

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

  const totalPaidOut = processedHistory.reduce((acc, e) => acc + e.prizeAmount, 0n);

  return (
    <div className="space-y-4">
      {/* Filters + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {ALL_RANKS.map(rank => (
            <button
              key={rank}
              onClick={() => setFilterRank(rank)}
              className={`chronicle-btn-secondary ${
                filterRank === rank ? "chronicle-btn-secondary-active" : "chronicle-btn-secondary-inactive"
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
      <div className="chronicle-container">
        <div className="chronicle-table-header">
          {TABLE_COLS.map(col => (
            <span key={col} className="chronicle-label">
              {col}
            </span>
          ))}
          <span className="hidden md:block chronicle-label">Date</span>
        </div>

        {isLoading && (
          <div>
            {[...Array(4)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {!isLoading && winnerHistory.length === 0 && (
          <div className="chronicle-empty-container-large">
            <EmptySigil />
            <p className="chronicle-text-secondary">The ledger awaits its first entry.</p>
            <p className="chronicle-text-muted">No rounds have concluded on this contract yet.</p>
          </div>
        )}

        {!isLoading && winnerHistory.length > 0 && processedHistory.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm text-slate-500">No entries match this rank filter.</p>
          </div>
        )}

        {!isLoading && processedHistory.length > 0 && (
          <div className="divide-y divide-yellow-900/10">
            {processedHistory.map((entry, i) => (
              <TableRow
                key={`${entry.roundId}-${activeSource}`}
                entry={entry}
                activeSource={activeSource}
                isRevealed={revealedRows.has(i)}
              />
            ))}
          </div>
        )}

        {processedHistory.length > 0 && (
          <div className="px-6 py-3 bg-yellow-950/10 border-t border-yellow-900/20 flex justify-between items-center">
            <span className="text-[10px] text-slate-500">
              {processedHistory.length} entr{processedHistory.length === 1 ? "y" : "ies"} shown
            </span>
            <span className="text-[10px] text-yellow-600 font-bold">
              {parseFloat(formatEther(totalPaidOut)).toFixed(4)} ETH paid out
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
