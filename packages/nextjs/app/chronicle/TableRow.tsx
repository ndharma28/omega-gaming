"use client";

import { RANK_COLORS, classifyPrize, formatTimestamp, formatTimestampShort, shortenAddress } from "./lib";
import { formatEther } from "viem";
import { type WinnerEntry } from "~~/hooks/useWinnerHistory";

interface TableRowProps {
  entry: WinnerEntry;
  activeSource: number;
  isRevealed: boolean;
  highlightAddress?: string;
}

export default function TableRow({ entry, activeSource, isRevealed, highlightAddress }: TableRowProps) {
  const ethAmount = parseFloat(formatEther(entry.prizeAmount));
  const rank = classifyPrize(ethAmount);
  const isHighlighted = highlightAddress && entry.winner.toLowerCase() === highlightAddress.toLowerCase();

  return (
    <div
      className={`grid grid-cols-[2.5rem_1fr_5rem_5rem] md:grid-cols-[2.5rem_1fr_6rem_6rem_7rem] gap-3 px-4 md:px-6 py-3 transition-all duration-300 ${
        isHighlighted ? "bg-yellow-950/30" : "hover:bg-yellow-950/10"
      } ${isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      <span className="text-xs font-bold text-slate-500 self-center">#{entry.roundId}</span>

      <span className="self-center min-w-0">
        <span
          className={`block text-xs font-mono truncate ${isHighlighted ? "text-yellow-300" : "text-yellow-400"}`}
          title={entry.winner}
        >
          {shortenAddress(entry.winner)}
        </span>
        <span className="block md:hidden text-[10px] text-slate-500 mt-0.5">{formatTimestampShort(entry.endTime)}</span>
      </span>

      <span className="text-xs font-bold text-green-400 self-center">{ethAmount.toFixed(4)} ETH</span>

      <span className="self-center">
        <span
          className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full border tracking-wide ${RANK_COLORS[rank]}`}
        >
          {rank.toUpperCase()}
        </span>
      </span>

      <span className="hidden md:block text-[11px] text-slate-400 self-center">{formatTimestamp(entry.endTime)}</span>
    </div>
  );
}
