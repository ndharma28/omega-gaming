"use client";

import { useEffect, useState } from "react";
import { ALL_RANKS, RANK_COLORS, classifyPrize, formatTimestamp, formatTimestampShort, shortenAddress } from "./lib";
import { formatEther } from "viem";
import { type WinnerEntry } from "~~/hooks/useWinnerHistory";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[2.5rem_1fr_5rem_5rem] md:grid-cols-[2.5rem_1fr_6rem_6rem_7rem] gap-3 px-4 md:px-6 py-4 border-b border-yellow-900/10">
      {[...Array(4)].map((_, i) => (
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

// ─── Table rows ───────────────────────────────────────────────────────────────

function TableRow({
  entry,
  activeSource,
  isRevealed,
  highlightAddress,
}: {
  entry: WinnerEntry;
  activeSource: number;
  isRevealed: boolean;
  highlightAddress?: string;
}) {
  const ethAmount = parseFloat(formatEther(entry.prizeAmount));
  const rank = classifyPrize(ethAmount);
  const isHighlighted = highlightAddress && entry.winner.toLowerCase() === highlightAddress.toLowerCase();

  return (
    <div
      key={`${entry.roundId}-${activeSource}`}
      className={`grid grid-cols-[2.5rem_1fr_5rem_5rem] md:grid-cols-[2.5rem_1fr_6rem_6rem_7rem] gap-3 px-4 md:px-6 py-3 transition-all duration-300 ${
        isHighlighted ? "bg-yellow-950/30" : "hover:bg-yellow-950/10"
      } ${isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      {/* Round # */}
      <span className="text-xs font-bold text-slate-500 self-center">#{entry.roundId}</span>

      {/* Address + date stacked on mobile */}
      <span className="self-center min-w-0">
        <span
          className={`block text-xs font-mono truncate ${isHighlighted ? "text-yellow-300" : "text-yellow-400"}`}
          title={entry.winner}
        >
          {shortenAddress(entry.winner)}
        </span>
        {/* Date shown below address on mobile only */}
        <span className="block md:hidden text-[10px] text-slate-500 mt-0.5">{formatTimestampShort(entry.endTime)}</span>
      </span>

      {/* Prize */}
      <span className="text-xs font-bold text-green-400 self-center">{ethAmount.toFixed(4)} ETH</span>

      {/* Rank */}
      <span className="self-center">
        <span
          className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full border tracking-wide ${RANK_COLORS[rank]}`}
        >
          {rank.toUpperCase()}
        </span>
      </span>

      {/* Date — desktop only */}
      <span className="hidden md:block text-[11px] text-slate-400 self-center">{formatTimestamp(entry.endTime)}</span>
    </div>
  );
}

// ─── Address Chronicle ────────────────────────────────────────────────────────

function AddressChronicle({ winnerHistory, activeSource }: { winnerHistory: WinnerEntry[]; activeSource: number }) {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const matches = submitted ? winnerHistory.filter(e => e.winner.toLowerCase().includes(submitted.toLowerCase())) : [];

  const totalWon = matches.reduce((acc, e) => acc + e.prizeAmount, 0n);
  const hasResults = submitted && matches.length > 0;
  const hasNoResults = submitted && matches.length === 0;

  return (
    <div className="rounded-2xl border border-yellow-900/20 bg-black/30 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-yellow-900/20 bg-yellow-950/10">
        <p className="text-[10px] text-yellow-700 uppercase tracking-widest font-bold mb-3">Address Chronicle</p>
        <p className="text-xs text-slate-400 mb-4">
          Every address leaves a trail. Drop one in and we&apos;ll pull everything the ledger has on it.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") setSubmitted(query.trim());
            }}
            placeholder="0x…"
            className="flex-1 min-w-0 bg-black/40 border border-yellow-900/30 rounded-xl px-4 py-2 text-sm font-mono text-white placeholder-slate-600 outline-none focus:border-yellow-700/60 transition-colors"
          />
          <button
            onClick={() => setSubmitted(query.trim())}
            disabled={!query.trim()}
            className="px-4 py-2 bg-yellow-900/40 hover:bg-yellow-900/60 border border-yellow-700/40 rounded-xl text-xs font-bold text-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Pull the File
          </button>
          {submitted && (
            <button
              onClick={() => {
                setQuery("");
                setSubmitted("");
              }}
              className="px-3 py-2 border border-yellow-900/20 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {hasNoResults && (
        <div className="py-12 text-center space-y-2">
          <EmptySigil />
          <p className="text-sm text-slate-500">No wins found for this address.</p>
          <p className="text-[11px] text-slate-600">The ledger has no record of this wallet.</p>
        </div>
      )}

      {hasResults && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-px bg-yellow-900/10 border-b border-yellow-900/20">
            {[
              { label: "Wins", value: matches.length.toString() },
              { label: "Total Won", value: `${parseFloat(formatEther(totalWon)).toFixed(4)} ETH` },
              {
                label: "Best Rank",
                value: classifyPrize(
                  Math.max(...matches.map(e => parseFloat(formatEther(e.prizeAmount)))),
                ).toUpperCase(),
              },
            ].map(({ label, value }) => (
              <div key={label} className="bg-black/40 px-4 py-3 text-center">
                <p className="text-[10px] text-yellow-700 uppercase tracking-widest font-bold">{label}</p>
                <p className="text-sm font-black text-white mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[2.5rem_1fr_5rem_5rem] md:grid-cols-[2.5rem_1fr_6rem_6rem_7rem] gap-3 px-4 md:px-6 py-3 bg-yellow-950/20 border-b border-yellow-900/20">
            {["#", "Address", "Prize", "Rank"].map(col => (
              <span key={col} className="text-[10px] text-yellow-700 uppercase tracking-widest font-bold">
                {col}
              </span>
            ))}
            <span className="hidden md:block text-[10px] text-yellow-700 uppercase tracking-widest font-bold">
              Date
            </span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-yellow-900/10">
            {matches
              .sort((a, b) => Number(b.endTime) - Number(a.endTime))
              .map((entry, i) => (
                <TableRow
                  key={entry.roundId}
                  entry={entry}
                  activeSource={activeSource}
                  isRevealed={true}
                  highlightAddress={submitted}
                />
              ))}
          </div>

          <div className="px-6 py-3 bg-yellow-950/10 border-t border-yellow-900/20 flex justify-between items-center">
            <span className="text-[10px] text-slate-500">
              {matches.length} win{matches.length !== 1 ? "s" : ""} found
            </span>
            <span className="text-[10px] text-yellow-600 font-bold">
              {parseFloat(formatEther(totalWon)).toFixed(4)} ETH won
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

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
        {/* Header */}
        <div className="grid grid-cols-[2.5rem_1fr_5rem_5rem] md:grid-cols-[2.5rem_1fr_6rem_6rem_7rem] gap-3 px-4 md:px-6 py-3 bg-yellow-950/20 border-b border-yellow-900/20">
          {["#", "Address", "Prize", "Rank"].map(col => (
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
              {parseFloat(formatEther(processedHistory.reduce((acc, e) => acc + e.prizeAmount, 0n))).toFixed(4)} ETH
              paid out
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
