"use client";

import { useEffect, useRef, useState } from "react";
import { EmptySigil } from "./ChronicleShared";
import TableRow from "./TableRow";
import { classifyPrize } from "./lib";
import { formatEther } from "viem";
import { type WinnerEntry } from "~~/hooks/useWinnerHistory";

interface AddressChronicleProps {
  winnerHistory: WinnerEntry[];
  activeSource: number;
}

const TABLE_COLS = ["#", "Address", "Prize", "Rank"];

const SCAN_PHRASES = [
  "Accessing the ledger…",
  "Cross-referencing known wallets…",
  "Tracing on-chain activity…",
  "Pulling transaction history…",
  "Verifying round records…",
  "Compiling the file…",
];

function ProgressBar({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phraseRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const DURATION = 6500;
  const TICK = 50;

  useEffect(() => {
    const steps = DURATION / TICK;
    let current = 0;

    intervalRef.current = setInterval(() => {
      current += 1;
      const t = current / steps;
      // Heavy cubic ease-out — fast start, then drags hard before 100
      // Also stalls artificially between 70-90% to feel like it's working
      let eased: number;
      if (t < 0.6) {
        eased = Math.round((1 - Math.pow(1 - t / 0.6, 3)) * 70);
      } else if (t < 0.85) {
        // Crawl through 70–88%
        eased = Math.round(70 + ((t - 0.6) / 0.25) * 18);
      } else {
        // Final push to 100
        eased = Math.round(88 + ((t - 0.85) / 0.15) * 12);
      }
      eased = Math.min(100, eased);
      setProgress(eased);
      if (current >= steps) {
        clearInterval(intervalRef.current!);
        setTimeout(onComplete, 350);
      }
    }, TICK);

    phraseRef.current = setInterval(() => {
      setPhraseIndex(i => (i + 1) % SCAN_PHRASES.length);
    }, DURATION / SCAN_PHRASES.length);

    return () => {
      clearInterval(intervalRef.current!);
      clearInterval(phraseRef.current!);
    };
  }, [onComplete]);

  return (
    <div className="mt-4 space-y-2">
      {/* Label */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-yellow-600 font-bold uppercase tracking-widest animate-pulse">
          {SCAN_PHRASES[phraseIndex]}
        </span>
        <span className="text-[10px] text-slate-600 font-mono">{progress}%</span>
      </div>

      {/* Track */}
      <div className="h-px w-full bg-yellow-900/20 relative overflow-hidden rounded-full">
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 bg-yellow-600/60 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
        {/* Shimmer */}
        <div
          className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent"
          style={{
            left: `calc(${progress}% - 4rem)`,
            transition: "left 75ms linear",
          }}
        />
      </div>

      {/* Tick marks — decorative */}
      <div className="flex justify-between px-0.5">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`w-px h-1 rounded-full transition-colors duration-300 ${
              (i / 11) * 100 <= progress ? "bg-yellow-700/60" : "bg-yellow-900/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function AddressChronicle({ winnerHistory, activeSource }: AddressChronicleProps) {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const pendingRef = useRef("");

  const matches = submitted ? winnerHistory.filter(e => e.winner.toLowerCase().includes(submitted.toLowerCase())) : [];

  const totalWon = matches.reduce((acc, e) => acc + e.prizeAmount, 0n);
  const hasResults = submitted && matches.length > 0;
  const hasNoResults = submitted && matches.length === 0;

  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed || isScanning) return;
    pendingRef.current = trimmed;
    setSubmitted("");
    setIsScanning(true);
  };

  const handleComplete = () => {
    setIsScanning(false);
    setSubmitted(pendingRef.current);
  };

  const handleClear = () => {
    setQuery("");
    setSubmitted("");
    setIsScanning(false);
    pendingRef.current = "";
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
              if (e.key === "Enter") handleSearch();
            }}
            placeholder="0x…"
            disabled={isScanning}
            className="flex-1 min-w-0 bg-black/40 border border-yellow-900/30 rounded-xl px-4 py-2 text-sm font-mono text-white placeholder-slate-600 outline-none focus:border-yellow-700/60 transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim() || isScanning}
            className="px-4 py-2 bg-yellow-900/40 hover:bg-yellow-900/60 border border-yellow-700/40 rounded-xl text-xs font-bold text-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isScanning ? "Scanning…" : "Pull the File"}
          </button>
          {(submitted || isScanning) && (
            <button
              onClick={handleClear}
              className="px-3 py-2 border border-yellow-900/20 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Progress bar — only shown while scanning */}
        {isScanning && <ProgressBar key={pendingRef.current} onComplete={handleComplete} />}
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
