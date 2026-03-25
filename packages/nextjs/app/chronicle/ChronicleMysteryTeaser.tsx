"use client";

import { RANK_COLORS, classifyPrize, formatTimestampShort, shortenAddress } from "./lib";
import { formatEther } from "viem";
import { type WinnerEntry } from "~~/hooks/useWinnerHistory";

interface ChronicleMysteryTeaserProps {
  winnerHistory: WinnerEntry[];
  isLoading: boolean;
}

const REDACTION_GLYPHS = ["▓▓▓▓▓▓▓▓", "████████", "▒▒▒▒▒▒▒▒"];

function RedactedAddress() {
  const glyph = REDACTION_GLYPHS[Math.floor(Math.random() * REDACTION_GLYPHS.length)];
  return (
    <span className="font-mono text-xs text-yellow-900/60 tracking-widest select-none" aria-hidden>
      {glyph}
    </span>
  );
}

export default function ChronicleMysteryTeaser({ winnerHistory, isLoading }: ChronicleMysteryTeaserProps) {
  const recentEntries = [...winnerHistory].sort((a, b) => Number(b.endTime) - Number(a.endTime)).slice(0, 5);

  // ── Loading state ──────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-px">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 border border-yellow-900/10 bg-black/20"
            style={{ opacity: 1 - i * 0.18 }}
          >
            <div className="w-6 h-2 bg-yellow-900/20 rounded-sm" />
            <div className="flex-1 h-2 bg-yellow-900/15 rounded-sm" />
            <div className="w-16 h-2 bg-yellow-900/10 rounded-sm" />
            <div className="w-12 h-2 bg-yellow-900/10 rounded-sm" />
          </div>
        ))}
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────
  if (recentEntries.length === 0) {
    return (
      <div className="px-4 py-8 text-center border border-yellow-900/15 bg-black/20">
        <p className="text-[11px] text-yellow-900/50 uppercase tracking-widest font-bold">[ NO ENTRIES CLASSIFIED ]</p>
        <p className="text-[10px] text-slate-600 mt-1">The ledger awaits its first entry.</p>
      </div>
    );
  }

  // ── Rows ───────────────────────────────────────────────
  return (
    <div className="relative">
      {/* Faint scanline texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)",
          backgroundSize: "100% 3px",
        }}
      />

      {/* Column headers */}
      <div className="flex items-center gap-3 px-4 py-1.5 border-b border-yellow-900/20 bg-yellow-950/10">
        <span className="w-6 text-[9px] text-yellow-800/60 uppercase tracking-widest font-bold">#</span>
        <span className="flex-1 text-[9px] text-yellow-800/60 uppercase tracking-widest font-bold">Subject</span>
        <span className="w-20 text-[9px] text-yellow-800/60 uppercase tracking-widest font-bold text-right">Award</span>
        <span className="w-16 text-[9px] text-yellow-800/60 uppercase tracking-widest font-bold text-right">
          Class.
        </span>
        <span className="hidden md:block w-20 text-[9px] text-yellow-800/60 uppercase tracking-widest font-bold text-right">
          Filed
        </span>
      </div>

      {/* Rows — fade out toward bottom */}
      <div className="divide-y divide-yellow-900/10">
        {recentEntries.map((entry, i) => {
          const ethAmount = parseFloat(formatEther(entry.prizeAmount));
          const rank = classifyPrize(ethAmount);
          // Each row dims progressively
          const rowOpacity = Math.max(0.25, 1 - i * 0.17);

          return (
            <div
              key={entry.roundId}
              className="flex items-center gap-3 px-4 py-3 bg-black/20 hover:bg-yellow-950/10 transition-colors duration-200"
              style={{ opacity: rowOpacity }}
            >
              {/* Round */}
              <span className="w-6 text-[10px] font-bold text-slate-600 shrink-0">#{entry.roundId}</span>

              {/* Address */}
              <span className="flex-1 min-w-0">
                {i === 0 ? (
                  // Most recent: show real address
                  <span className="block text-xs font-mono text-yellow-500/80 truncate" title={entry.winner}>
                    {shortenAddress(entry.winner)}
                  </span>
                ) : i < 3 ? (
                  // Middle rows: partially obscured
                  <span className="block text-xs font-mono text-yellow-700/50 truncate">
                    {entry.winner.slice(0, 6)}
                    <span className="text-yellow-900/40">{"·".repeat(8)}</span>
                    {entry.winner.slice(-4)}
                  </span>
                ) : (
                  // Oldest shown: fully redacted
                  <RedactedAddress />
                )}
              </span>

              {/* Prize */}
              <span className="w-20 text-right text-xs font-bold text-green-500/70 shrink-0">
                {ethAmount.toFixed(4)}
                <span className="text-green-700/50 font-normal ml-0.5">Ξ</span>
              </span>

              {/* Rank badge */}
              <span className="w-16 text-right shrink-0">
                <span
                  className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded-full border tracking-wide opacity-70 ${RANK_COLORS[rank]}`}
                >
                  {rank.toUpperCase()}
                </span>
              </span>

              {/* Date */}
              <span className="hidden md:block w-20 text-right text-[10px] text-slate-600 shrink-0">
                {formatTimestampShort(entry.endTime)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom fade-out gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-linear-to-t from-black/60 to-transparent z-10" />

      {/* Entry count stamp */}
      {winnerHistory.length > 5 && (
        <div className="px-4 py-2 bg-black/30 border-t border-yellow-900/15 flex justify-between items-center">
          <span className="text-[9px] text-yellow-900/50 uppercase tracking-widest font-bold">
            [ {winnerHistory.length - 5} ENTRIES WITHHELD ]
          </span>
          <span className="text-[9px] text-yellow-900/40 uppercase tracking-widest">CLEARANCE REQUIRED</span>
        </div>
      )}
    </div>
  );
}
