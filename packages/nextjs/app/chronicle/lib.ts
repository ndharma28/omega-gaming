import type React from "react";
import { type Address } from "viem";
import { CONTRACT_ADDRESS } from "~~/constants/abi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContractSource {
  label: string;
  address: Address;
}

// ─── Contract sources ─────────────────────────────────────────────────────────

export const CONTRACT_SOURCES: ContractSource[] = [
  { label: "Current", address: CONTRACT_ADDRESS },
  // { label: "Season I",  address: "0x..." },
  // { label: "Genesis",   address: "0x..." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function shortenAddress(addr?: string) {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function formatTimestamp(ts?: bigint) {
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

export function formatTimestampShort(ts?: bigint) {
  if (!ts) return "—";
  const date = new Date(Number(ts) * 1000);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function classifyPrize(eth: number): string {
  if (eth >= 1) return "Sovereign";
  if (eth >= 0.5) return "Titan";
  if (eth >= 0.1) return "Ascendant";
  if (eth >= 0.01) return "Initiate";
  return "Spark";
}

export const RANK_COLORS: Record<string, { className: string; style: React.CSSProperties }> = {
  Sovereign: {
    className: "border font-black tracking-wide",
    style: { color: "#fde68a", borderColor: "rgba(253,230,138,0.4)", background: "rgba(253,230,138,0.08)" },
  },
  Titan: {
    className: "border font-black tracking-wide",
    style: { color: "#fed7aa", borderColor: "rgba(253,215,170,0.35)", background: "rgba(253,215,170,0.07)" },
  },
  Ascendant: {
    className: "border font-black tracking-wide",
    style: { color: "#fca5a5", borderColor: "rgba(252,165,165,0.3)", background: "rgba(252,165,165,0.06)" },
  },
  Initiate: {
    className: "border font-black tracking-wide",
    style: { color: "#94a3b8", borderColor: "rgba(148,163,184,0.25)", background: "rgba(148,163,184,0.06)" },
  },
  Spark: {
    className: "border font-black tracking-wide",
    style: { color: "#475569", borderColor: "rgba(71,85,105,0.25)", background: "rgba(71,85,105,0.05)" },
  },
};

export const ALL_RANKS = ["All", "Sovereign", "Titan", "Ascendant", "Initiate", "Spark"];
