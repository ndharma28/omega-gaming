"use client";
"use client";

import { RANK_COLORS, classifyPrize, formatTimestamp, formatTimestampShort, shortenAddress } from "./lib";
import { formatEther } from "viem";
import { type WinnerEntry } from "~~/hooks/useWinnerHistory";

interface TableRowProps {
  entry: WinnerEntry;
  activeSource: number;
  isRevealed: boolean;
  highlightAddress?: string;
  totalsByAddress: Record<string, number>;
}

export default function TableRow({ entry, isRevealed, highlightAddress, totalsByAddress }: TableRowProps) {
  const ethAmount = parseFloat(formatEther(entry.prizeAmount));
  const totalWon = totalsByAddress[entry.winner.toLowerCase()] || 0;
  const rank = classifyPrize(totalWon);
  const isHighlighted = highlightAddress && entry.winner.toLowerCase() === highlightAddress.toLowerCase();

  return (
    <div
      className={`chronicle-table-row transition-all duration-300 ${
        isHighlighted ? "chronicle-table-row-highlight" : "chronicle-table-row-hover"
      } ${isRevealed ? "chronicle-fade-in" : "chronicle-fade-out"}`}
    >
      {/* # */}
      <span className="text-xs font-bold text-yellow-900/60 flex items-center">#{entry.roundId}</span>

      {/* Operative */}
      <span className="flex flex-col justify-center min-w-0">
        <span
          className={`text-xs font-mono truncate ${isHighlighted ? "text-yellow-300" : "text-yellow-500"}`}
          title={entry.winner}
        >
          {shortenAddress(entry.winner)}
        </span>
        <span className="block md:hidden text-[10px] text-yellow-900/50 mt-0.5">
          {formatTimestampShort(entry.endTime)}
        </span>
      </span>

      {/* Extracted */}
      <span className="text-xs font-bold flex items-center" style={{ color: "#fbbf24" }}>
        {ethAmount.toFixed(4)} ETH
      </span>

      {/* Clearance */}
      <span className="flex items-center">
        <span
          className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${RANK_COLORS[rank].className}`}
          style={RANK_COLORS[rank].style}
        >
          {rank.toUpperCase()}
        </span>
      </span>

      {/* Last Seen */}
      <span className="hidden md:flex items-center text-[11px] text-yellow-900/60">
        {formatTimestamp(entry.endTime)}
      </span>
    </div>
  );
}
