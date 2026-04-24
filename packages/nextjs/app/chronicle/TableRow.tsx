"use client";

import { RANK_COLORS, classifyPrize, formatTimestamp, formatTimestampShort, shortenAddress } from "./lib";
import { formatEther } from "viem";
import { type WinnerEntry } from "~~/hooks/useWinnerHistory";

const cell = "px-4 py-3 border-r border-yellow-900/20 last:border-r-0 flex items-center";

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
      className={`grid grid-cols-[3rem_1fr_5.5rem_6rem] md:grid-cols-[3rem_1fr_5.5rem_6rem_8rem]
        border-b border-yellow-900/15 last:border-b-0 transition-all duration-300
        ${isHighlighted ? "bg-yellow-950/30" : "hover:bg-yellow-950/10"}
        ${isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      {/* # */}
      <span className={cell}>
        <span className="text-[11px] font-mono text-yellow-800">#{entry.roundId}</span>
      </span>

      {/* Operative */}
      <span className={`${cell} min-w-0`}>
        <span className="flex flex-col min-w-0 w-full">
          <span
            className={`text-xs font-mono truncate ${isHighlighted ? "text-yellow-300" : "text-yellow-500"}`}
            title={entry.winner}
          >
            {shortenAddress(entry.winner)}
          </span>
          <span className="block md:hidden text-[10px] text-yellow-800 mt-0.5">
            {formatTimestampShort(entry.endTime)}
          </span>
        </span>
      </span>

      {/* Extracted */}
      <span className={cell}>
        <span className="text-xs font-bold font-mono" style={{ color: "#fbbf24" }}>
          {ethAmount.toFixed(4)}
        </span>
      </span>

      {/* Clearance */}
      <span className={cell}>
        <span
          className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${RANK_COLORS[rank].className}`}
          style={RANK_COLORS[rank].style}
        >
          {rank.toUpperCase()}
        </span>
      </span>

      {/* Last Seen */}
      <span className={`${cell} hidden md:flex`}>
        <span className="text-[10px] font-mono text-yellow-800">{formatTimestamp(entry.endTime)}</span>
      </span>
    </div>
  );
}
