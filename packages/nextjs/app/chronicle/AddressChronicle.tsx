"use client";

import { useState } from "react";
import { EmptySigil } from "./ChronicleShared.tsx";
import TableRow from "./TableRow.tsx";
import { classifyPrize } from "./lib";
import { formatEther } from "viem";
import { type WinnerEntry } from "~~/hooks/useWinnerHistory";

interface AddressChronicleProps {
  winnerHistory: WinnerEntry[];
  activeSource: number;
}

const TABLE_COLS = ["#", "Address", "Prize", "Rank"];

export default function AddressChronicle({ winnerHistory, activeSource }: AddressChronicleProps) {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const matches = submitted ? winnerHistory.filter(e => e.winner.toLowerCase().includes(submitted.toLowerCase())) : [];

  const totalWon = matches.reduce((acc, e) => acc + e.prizeAmount, 0n);
  const hasResults = submitted && matches.length > 0;
  const hasNoResults = submitted && matches.length === 0;

  const handleClear = () => {
    setQuery("");
    setSubmitted("");
  };

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
              onClick={handleClear}
              className="px-3 py-2 border border-yellow-900/20 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* No results */}
      {hasNoResults && (
        <div className="py-12 text-center space-y-2">
          <EmptySigil />
          <p className="text-sm text-slate-500">No wins found for this address.</p>
          <p className="text-[11px] text-slate-600">The ledger has no record of this wallet.</p>
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <>
          {/* Summary stats */}
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
            {TABLE_COLS.map(col => (
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
            {[...matches]
              .sort((a, b) => Number(b.endTime) - Number(a.endTime))
              .map(entry => (
                <TableRow
                  key={entry.roundId}
                  entry={entry}
                  activeSource={activeSource}
                  isRevealed={true}
                  highlightAddress={submitted}
                />
              ))}
          </div>

          {/* Footer */}
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
