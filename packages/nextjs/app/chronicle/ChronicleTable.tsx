"use client";

import { useEffect, useState } from "react";
import AddressChronicle from "./AddressChronicle.tsx";
import { EmptySigil, SkeletonRow } from "./ChronicleShared.tsx";
import TableRow from "./TableRow.tsx";
import { ALL_RANKS, RANK_COLORS, classifyPrize } from "./lib";
import { formatEther } from "viem";
import { type WinnerEntry } from "~~/hooks/useWinnerHistory";

const TABLE_COLS = ["#", "Operative", "Extracted", "Clearance", "Last Seen"];

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

  const totalsByAddress = winnerHistory.reduce(
    (acc, entry) => {
      const addr = entry.winner.toLowerCase();
      const amount = parseFloat(formatEther(entry.prizeAmount));
      acc[addr] = (acc[addr] || 0) + amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const processedHistory = [...winnerHistory]
    .sort((a, b) =>
      sortDir === "desc" ? Number(b.endTime) - Number(a.endTime) : Number(a.endTime) - Number(b.endTime),
    )
    .filter(entry => {
      if (filterRank === "All") return true;
      const total = totalsByAddress[entry.winner.toLowerCase()] || 0;
      return classifyPrize(total) === filterRank;
    });

  const totalPaidOut = processedHistory.reduce((acc, e) => acc + e.prizeAmount, 0n);

  return (
    <div className="space-y-8">
      {/* Filters + sort */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 gap-0 border border-yellow-900/30 rounded-xl overflow-hidden">
          {ALL_RANKS.map(rank => (
            <button
              key={rank}
              onClick={() => setFilterRank(rank)}
              style={{ color: filterRank === rank ? "#fde68a" : "#854d0e" }}
              className={`flex-1 py-2.5 text-[11px] font-bold border-r border-yellow-900/30 last:border-r-0
                transition-all duration-200
                ${filterRank === rank ? "bg-yellow-900/40" : "bg-transparent hover:bg-yellow-900/20"}`}
            >
              {rank}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSortDir(d => (d === "desc" ? "asc" : "desc"))}
          className="text-[11px] text-yellow-800 hover:text-yellow-600 font-bold flex items-center gap-1 transition-colors"
        >
          {sortDir === "desc" ? "↓ Most recent first" : "↑ Oldest first"}
        </button>
      </div>

      {/* Main table */}
      <div className="chronicle-container">
        {/* Column headers */}
        <div className="grid grid-cols-[3rem_1fr_5.5rem_6rem] md:grid-cols-[3rem_1fr_5.5rem_6rem_8rem] bg-yellow-950/40 border-b-2 border-yellow-900/50">
          {["#", "Operative", "Extracted", "Clearance"].map(col => (
            <span
              key={col}
              className="px-4 py-3 text-[10px] text-yellow-600 uppercase tracking-widest font-bold border-r border-yellow-900/30 last:border-r-0"
            >
              {col}
            </span>
          ))}
          <span className="hidden md:block px-4 py-3 text-[10px] text-yellow-600 uppercase tracking-widest font-bold">
            Last Seen
          </span>
        </div>

        {isLoading && (
          <div>
            {[...Array(6)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {!isLoading && winnerHistory.length === 0 && (
          <div className="chronicle-empty-container-large">
            <EmptySigil />
            <p className="text-[11px] text-yellow-800">The ledger has no names yet.</p>
            <p className="text-[10px] text-yellow-900/60">
              Either no one has won yet or someone made sure you can&apos;t see who did.
            </p>
          </div>
        )}

        {!isLoading && winnerHistory.length > 0 && processedHistory.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-yellow-800">
              Nothing at this clearance level. That doesn&apos;t mean nothing happened.
            </p>
          </div>
        )}

        {!isLoading && processedHistory.length > 0 && (
          <div>
            {processedHistory.map((entry, i) => (
              <TableRow
                key={`${entry.roundId}-${activeSource}`}
                entry={entry}
                activeSource={activeSource}
                isRevealed={revealedRows.has(i)}
                totalsByAddress={totalsByAddress}
              />
            ))}
          </div>
        )}

        {processedHistory.length > 0 && (
          <div className="px-6 py-3 bg-yellow-950/10 border-t border-yellow-900/20 flex justify-between items-center">
            <span className="text-[10px] text-yellow-800">
              {processedHistory.length} operative{processedHistory.length === 1 ? "" : "s"} on record
            </span>
            <span className="text-[10px] text-yellow-600 font-bold">
              {parseFloat(formatEther(totalPaidOut)).toFixed(4)} ETH extracted
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
        <p className="text-[10px] text-yellow-600 uppercase tracking-widest font-bold">Clearance Classification</p>
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
                className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${RANK_COLORS[rank].className}`}
                style={RANK_COLORS[rank].style}
              >
                {rank.toUpperCase()}
              </span>
              <p className="text-[11px] text-yellow-800">{range}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
