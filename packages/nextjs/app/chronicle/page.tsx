"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatEther } from "viem";
import { type Address } from "viem";
import { CONTRACT_ADDRESS } from "~~/constants/abi";
import { type WinnerEntry, useWinnerHistory } from "~~/hooks/useWinnerHistory";

interface ContractSource {
  label: string;
  address: Address;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Add past contract addresses here to preserve cross-deployment history.
// The current contract is always first.
const CONTRACT_SOURCES: ContractSource[] = [
  { label: "Current", address: CONTRACT_ADDRESS },
  // { label: "Season I",  address: "0x..." },
  // { label: "Genesis",   address: "0x..." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shortenAddress(addr?: string) {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatTimestamp(ts?: bigint) {
  if (!ts) return "—";
  const date = new Date(Number(ts) * 1000);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function classifyPrize(eth: number): string {
  if (eth >= 1) return "Sovereign";
  if (eth >= 0.5) return "Titan";
  if (eth >= 0.1) return "Ascendant";
  if (eth >= 0.01) return "Initiate";
  return "Spark";
}

const RANK_COLORS: Record<string, string> = {
  Sovereign: "text-yellow-300 border-yellow-400/40 bg-yellow-400/10",
  Titan: "text-orange-300 border-orange-400/40 bg-orange-400/10",
  Ascendant: "text-red-300 border-red-400/40 bg-red-400/10",
  Initiate: "text-slate-300 border-slate-400/30 bg-slate-400/10",
  Spark: "text-slate-500 border-slate-600/30 bg-slate-600/10",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function GlyphRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-3 text-yellow-700/80 text-xs tracking-[0.4em] select-none my-1">
      {children}
    </div>
  );
}

function Sigil() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-yellow-700/60">
      <polygon points="24,4 44,36 4,36" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="0.75" fill="none" />
      <line x1="24" y1="4" x2="24" y2="44" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
      <line x1="4" y1="36" x2="44" y2="36" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
      <line x1="4" y1="36" x2="44" y2="12" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
    </svg>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[3rem_1fr_1fr_1fr_6rem] gap-4 px-6 py-4 border-b border-red-900/10">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-3 rounded bg-red-900/10 animate-pulse" />
      ))}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-black/40 border border-yellow-900/20 rounded-2xl p-5 space-y-1 backdrop-blur-sm">
      <p className="text-[10px] text-yellow-700 uppercase tracking-widest font-bold">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
      {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
    </div>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useWinnerHistoryForAddress(address: Address) {
  return useWinnerHistory(address);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChronicleePage() {
  const [activeSource, setActiveSource] = useState(0);
  const [revealedRows, setRevealedRows] = useState<Set<number>>(new Set());
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterRank, setFilterRank] = useState<string>("All");
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { winnerHistory, totalFeesCollected, isLoading } = useWinnerHistoryForAddress(
    CONTRACT_SOURCES[activeSource].address,
  );

  // Staggered row reveal on load
  useEffect(() => {
    if (isLoading || winnerHistory.length === 0) return;
    const sorted = [...winnerHistory].reverse();
    sorted.forEach((_, i) => {
      setTimeout(() => {
        setRevealedRows(prev => new Set([...prev, i]));
      }, 80 * i);
    });
  }, [isLoading, winnerHistory]);

  const allRanks = ["All", "Sovereign", "Titan", "Ascendant", "Initiate", "Spark"];

  const processedHistory = [...winnerHistory]
    .sort((a, b) =>
      sortDir === "desc" ? Number(b.endTime) - Number(a.endTime) : Number(a.endTime) - Number(b.endTime),
    )
    .filter(entry => {
      if (filterRank === "All") return true;
      const eth = parseFloat(formatEther(entry.prizeAmount));
      return classifyPrize(eth) === filterRank;
    });

  const topPrize =
    winnerHistory.length > 0 ? Math.max(...winnerHistory.map(e => parseFloat(formatEther(e.prizeAmount)))) : 0;

  const uniqueWinners = new Set(winnerHistory.map(e => e.winner)).size;

  return (
    <main ref={containerRef} className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Ambient background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(202,138,4,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(202,138,4,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(120,80,0,0.2)_0%,transparent_70%)]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 space-y-16">
        {/* ── Back nav ───────────────────────────────────────────────────────── */}
        <div className="flex items-center">
          <button
            onClick={() => router.push("/")}
            className="group flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-yellow-500 transition-colors duration-200"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            Omega Gaming
          </button>
        </div>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Sigil />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] tracking-[0.5em] text-yellow-600 uppercase font-bold">
              Omega Gaming · Restricted Archive
            </p>
            <h1 className="text-5xl font-black tracking-tight text-white">The Chronicle</h1>
            <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              A ledger of those who have walked away with the pot. You&apos;re here. That means you already know more
              than most.
            </p>
          </div>

          <GlyphRow>
            <span>◆</span>
            <span className="opacity-50">· · · · · · · · · · · · · · ·</span>
            <span>◆</span>
          </GlyphRow>
        </div>

        {/* ── Stats ──────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Rounds Completed" value={winnerHistory.length.toString()} sub="verified on-chain" />
          <StatCard
            label="Total Distributed"
            value={`${parseFloat(formatEther(totalFeesCollected)).toFixed(4)} ETH`}
            sub="to winners"
          />
          <StatCard
            label="Unique Winners"
            value={uniqueWinners.toString()}
            sub={`${winnerHistory.length > 0 ? ((uniqueWinners / winnerHistory.length) * 100).toFixed(0) : 0}% unique`}
          />
          <StatCard
            label="Record Prize"
            value={topPrize > 0 ? `${topPrize.toFixed(4)} ETH` : "—"}
            sub={topPrize > 0 ? classifyPrize(topPrize) + " tier" : "no rounds yet"}
          />
        </div>

        {/* ── Source tabs (cross-contract history) ───────────────────────────── */}
        {CONTRACT_SOURCES.length > 1 && (
          <div className="space-y-3">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest">Contract Era</p>
            <div className="flex gap-2">
              {CONTRACT_SOURCES.map((src, i) => (
                <button
                  key={src.address}
                  onClick={() => {
                    setActiveSource(i);
                    setRevealedRows(new Set());
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    activeSource === i
                      ? "bg-red-600 border-red-500 text-white"
                      : "bg-black/40 border-red-900/30 text-slate-500 hover:text-white hover:border-red-700/50"
                  }`}
                >
                  {src.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Filters ────────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            {allRanks.map(rank => (
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

        {/* ── Table ──────────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-yellow-900/20 overflow-hidden backdrop-blur-sm">
          {/* Table header */}
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
              <Sigil />
              <p className="text-sm text-slate-600">The ledger awaits its first entry.</p>
              <p className="text-[11px] text-slate-700">No rounds have concluded on this contract yet.</p>
            </div>
          )}

          {/* No filter results */}
          {!isLoading && winnerHistory.length > 0 && processedHistory.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-600">No entries match this rank filter.</p>
            </div>
          )}

          {/* Rows */}
          {!isLoading && processedHistory.length > 0 && (
            <div className="divide-y divide-yellow-900/10">
              {processedHistory.map((entry, i) => {
                const ethAmount = parseFloat(formatEther(entry.prizeAmount));
                const rank = classifyPrize(ethAmount);
                const rankColor = RANK_COLORS[rank];
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
                        className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full border tracking-wide ${rankColor}`}
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

        {/* ── Rank legend ────────────────────────────────────────────────────── */}
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

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <div className="text-center space-y-4 pb-8">
          <GlyphRow>
            <span>◆</span>
            <span className="opacity-50">· · · · · · · · · · · · · · ·</span>
            <span>◆</span>
          </GlyphRow>
          <p className="text-[10px] text-slate-500 tracking-widest uppercase">
            All outcomes determined by Chainlink VRF · Immutable · Verifiable
          </p>
        </div>
      </div>
    </main>
  );
}
