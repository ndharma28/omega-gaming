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
        <span className="chronicle-label animate-pulse">{SCAN_PHRASES[phraseIndex]}</span>
        <span className="chronicle-text-muted font-mono">{progress}%</span>
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
      <div className="chronicle-section chronicle-section-accent px-6 py-5">
        <p className="chronicle-label mb-2">Address Chronicle</p>
        <p className="text-[11px] text-yellow-800 mb-4 leading-relaxed">
          {"Every address leaves a trail. They always think they've covered it. They never have."}
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
            className="chronicle-input"
          />
          <button onClick={handleSearch} disabled={!query.trim() || isScanning} className="chronicle-btn-primary">
            {isScanning ? "Scanning…" : "Pull the File"}
          </button>
          {(submitted || isScanning) && (
            <button onClick={handleClear} className="chronicle-btn-clear">
              ✕
            </button>
          )}
        </div>
        {isScanning && <ProgressBar key={pendingRef.current} onComplete={handleComplete} />}
      </div>

      {/* No results */}
      {hasNoResults && (
        <div className="chronicle-empty-container">
          <EmptySigil />
          <p className="text-[11px] text-yellow-800">No wins found for this address.</p>
          <p className="text-[10px] text-yellow-900/60">The ledger has no record of this wallet.</p>
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <>
          <div className="chronicle-stats-grid">
            {[
              { label: "Wins", value: matches.length.toString() },
              { label: "Total Won", value: `${parseFloat(formatEther(totalWon)).toFixed(4)} ETH` },
              { label: "Clearance", value: classifyPrize(parseFloat(formatEther(totalWon))).toUpperCase() },
            ].map(({ label, value }) => (
              <div key={label} className="chronicle-stat-card">
                <p className="chronicle-label">{label}</p>
                <p className="chronicle-text-primary mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          <div className="chronicle-table-header">
            {TABLE_COLS.map(col => (
              <span key={col} className="chronicle-label">
                {col}
              </span>
            ))}
            <span className="hidden md:block chronicle-label">Date</span>
          </div>

          <div className="chronicle-divider">
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

          <div className="px-6 py-3 bg-yellow-950/10 border-t border-yellow-900/20 flex justify-between items-center">
            <span className="text-[10px] text-yellow-900/50">
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
