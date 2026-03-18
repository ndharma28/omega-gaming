"use client";

import { useEffect, useState } from "react";
import AddressChronicle from "./AddressChronicle.tsx";
import { EmptySigil, SkeletonRow } from "./ChronicleShared.tsx";
import TableRow from "./TableRow.tsx";
import { ALL_RANKS, RANK_COLORS, classifyPrize } from "./lib";
import { formatEther } from "viem";
import { type WinnerEntry } from "~~/hooks/useWinnerHistory";

const TABLE_COLS = ["#", "Address", "Prize", "Rank"];

interface ChronicleTableProps {
  winnerHistory: WinnerEntry[];
  isLoading: boolean;
  activeSource: number;
}

export default function ChronicleTable({ winnerHistory, isLoading, activeSource }: ChronicleTableProps) {
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

      {/* Main table */}
      <div className="rounded-2xl border border-yellow-900/20 overflow-hidden backdrop-blur-sm">
        {/* Column headers */}
        <div className="grid grid-cols-[2.5rem_1fr_5rem_5rem] md:grid-cols-[2.5rem_1fr_6rem_6rem_7rem] gap-3 px-4 md:px-6 py-3 bg-yellow-950/20 border-b border-yellow-900/20">
          {TABLE_COLS.map(col => (
            <span key={col} className="text-[10px] text-yellow-700 uppercase tracking-widest font-bold">
              {col}
            </span>
          ))}
          <span className="hidden md:block text-[10px] text-yellow-700 uppercase tracking-widest font-bold">Date</span>
        </div>

        {isLoading && (
          <div>
            {[...Array(6)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {!isLoading && winnerHistory.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <EmptySigil />
            <p className="text-sm text-slate-500">The ledger awaits its first entry.</p>
            <p className="text-[11px] text-slate-600">No rounds have concluded on this contract yet.</p>
          </div>
        )}

        {!isLoading && winnerHistory.length > 0 && processedHistory.length === 0 && (
          <div className="py-12 text-center">
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

      {/* Address Chronicle */}
      {!isLoading && winnerHistory.length > 0 && (
        <AddressChronicle winnerHistory={winnerHistory} activeSource={activeSource} />
      )}

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
