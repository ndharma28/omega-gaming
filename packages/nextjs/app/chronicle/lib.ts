import { type Address } from "viem";
import { CONTRACT_ADDRESS } from "~~/constants/abi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContractSource {
  label: string;
  address: Address;
}

// ─── Contract sources ─────────────────────────────────────────────────────────

// Add past contract addresses here to preserve cross-deployment history.
// The current contract is always first.
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

export const RANK_COLORS: Record<string, string> = {
  Sovereign: "text-yellow-300 border-yellow-400/40 bg-yellow-400/10",
  Titan: "text-orange-300 border-orange-400/40 bg-orange-400/10",
  Ascendant: "text-red-300 border-red-400/40 bg-red-400/10",
  Initiate: "text-slate-300 border-slate-400/30 bg-slate-400/10",
  Spark: "text-slate-500 border-slate-600/30 bg-slate-600/10",
};

export const ALL_RANKS = ["All", "Sovereign", "Titan", "Ascendant", "Initiate", "Spark"];
