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

const TABLE_COLS = ["#", "Address", "Prize", "Clearance"];

const SCAN_PHRASES = [
  "Every address leaves a trail. Finding yours…",
  "Cross-referencing with the ledger. It remembers everything…",
  "The blockchain doesn't forget. Neither do we…",
  "Pulling the file. This always takes longer than it should…",
  "Corroborating the record. Math doesn't lie…",
  "Compiling the dossier. Almost there…",
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
      let eased: number;
      if (t < 0.6) eased = Math.round((1 - Math.pow(1 - t / 0.6, 3)) * 70);
      else if (t < 0.85) eased = Math.round(70 + ((t - 0.6) / 0.25) * 18);
      else eased = Math.round(88 + ((t - 0.85) / 0.15) * 12);
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
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-yellow-600 uppercase tracking-widest font-bold animate-pulse">
          {SCAN_PHRASES[phraseIndex]}
        </span>
        <span className="text-[10px] text-yellow-700 font-mono">{progress}%</span>
      </div>
      <div className="chronicle-progress-track">
        <div className="chronicle-progress-fill" style={{ width: `${progress}%` }} />
        <div
          className="chronicle-progress-shimmer"
          style={{ left: `calc(${progress}% - 4rem)`, transition: "left 75ms linear" }}
        />
      </div>
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

  const totalsByAddress = winnerHistory.reduce(
    (acc, entry) => {
      const addr = entry.winner.toLowerCase();
      const amount = parseFloat(formatEther(entry.prizeAmount));
      acc[addr] = (acc[addr] || 0) + amount;
      return acc;
    },
    {} as Record<string, number>,
  );

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
    <div className="chronicle-container">
      {/* Header */}
      <div className="px-6 py-5 border-b border-yellow-900/25 bg-yellow-950/10 space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] text-yellow-600 uppercase tracking-widest font-bold">Address Chronicle</p>
          <p className="text-[11px] text-yellow-700 leading-relaxed">
            Every address leaves a trail. They always think they&apos;ve covered it. They never have.
          </p>
        </div>

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
            className="chronicle-input"
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim() || isScanning}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-yellow-900/40
                       disabled:text-yellow-800 disabled:cursor-not-allowed
                       text-black text-xs font-black uppercase tracking-widest
                       rounded-xl transition-all"
          >
            {isScanning ? "Scanning…" : "Pull the File"}
          </button>
          {(submitted || isScanning) && (
            <button
              onClick={handleClear}
              className="px-3 py-2 border border-yellow-900/20 rounded-xl text-xs font-bold text-yellow-800 hover:text-yellow-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {isScanning && <ProgressBar key={pendingRef.current} onComplete={handleComplete} />}
      </div>

      {/* No results */}
      {hasNoResults && (
        <div className="py-12 text-center space-y-2">
          <EmptySigil />
          <p className="text-[11px] text-yellow-800">No wins found for this address.</p>
          <p className="text-[10px] text-yellow-900/60">The ledger has no record of this wallet.</p>
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-px bg-yellow-900/20 border-b border-yellow-900/25">
            {[
              { label: "Wins", value: matches.length.toString() },
              { label: "Total Won", value: `${parseFloat(formatEther(totalWon)).toFixed(4)} ETH` },
              { label: "Clearance", value: classifyPrize(parseFloat(formatEther(totalWon))).toUpperCase() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-black/60 px-4 py-3 text-center">
                <p className="text-[10px] text-yellow-600 uppercase tracking-widest font-bold">{label}</p>
                <p className="text-sm font-black text-yellow-300 mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[3rem_1fr_5.5rem_6rem] md:grid-cols-[3rem_1fr_5.5rem_6rem_8rem] bg-yellow-950/40 border-b-2 border-yellow-900/50">
            {TABLE_COLS.map(col => (
              <span
                key={col}
                className="px-4 py-3 text-[10px] text-yellow-600 uppercase tracking-widest font-bold border-r border-yellow-900/30 last:border-r-0"
              >
                {col}
              </span>
            ))}
            <span className="hidden md:block px-4 py-3 text-[10px] text-yellow-600 uppercase tracking-widest font-bold">
              Date
            </span>
          </div>

          {/* Rows */}
          <div>
            {[...matches]
              .sort((a, b) => Number(b.endTime) - Number(a.endTime))
              .map(entry => (
                <TableRow
                  key={entry.roundId}
                  entry={entry}
                  activeSource={activeSource}
                  isRevealed={true}
                  highlightAddress={submitted}
                  totalsByAddress={totalsByAddress}
                />
              ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-yellow-950/10 border-t border-yellow-900/20 flex justify-between items-center">
            <span className="text-[10px] text-yellow-800">
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
