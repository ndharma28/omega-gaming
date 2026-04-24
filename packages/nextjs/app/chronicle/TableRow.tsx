"use client";

import { RANK_COLORS, classifyPrize, formatTimestamp, formatTimestampShort, shortenAddress } from "./lib";
import { formatEther } from "viem";
import { type WinnerEntry } from "~~/hooks/useWinnerHistory";

const cellCls = "px-4 py-3 border-r border-yellow-900/20 last:border-r-0 flex items-center";

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
      className={`grid grid-cols-[2.5rem_1fr_5rem_5rem] md:grid-cols-[2.5rem_1fr_6rem_6rem_7rem]
        border-b border-yellow-900/15 last:border-b-0 transition-all duration-300
        ${isHighlighted ? "bg-yellow-950/30" : "hover:bg-yellow-950/15"}
        ${isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      {/* # */}
      <span className={cellCls}>
        <span className="text-xs font-bold text-yellow-900/60">#{entry.roundId}</span>
      </span>

      {/* Operative */}
      <span className={`${cellCls} min-w-0`}>
        <span className="flex flex-col min-w-0 w-full">
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
      </span>

      {/* Extracted */}
      <span className={cellCls}>
        <span className="text-xs font-bold" style={{ color: "#fbbf24" }}>
          {ethAmount.toFixed(4)}
        </span>
      </span>

      {/* Clearance */}
      <span className={cellCls}>
        <span
          className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${RANK_COLORS[rank].className}`}
          style={RANK_COLORS[rank].style}
        >
          {rank.toUpperCase()}
        </span>
      </span>

      {/* Last Seen */}
      <span className={`${cellCls} hidden md:flex`}>
        <span className="text-[11px] text-yellow-900/60">{formatTimestamp(entry.endTime)}</span>
      </span>
    </div>
  );
}
