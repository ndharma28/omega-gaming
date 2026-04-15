"use client";

import CornerBrackets from "./CornerBrackets";
import PotCardStatus from "./PotCardStatus";
import { formatEther } from "viem";

interface PotCardProps {
  lotteryId?: bigint | number;
  potBalance: bigint;
  status: number;
  startTime: bigint;
  endTime: bigint;
  winner?: string;
}

function formatDate(timestamp: bigint): string {
  if (timestamp === 0n) return "TBD";
  return new Date(Number(timestamp) * 1000).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const CalendarIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="rgba(239,159,39,0.35)"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

export default function PotCard({ lotteryId, potBalance, status, startTime, endTime, winner }: PotCardProps) {
  const isResolved = status === 2;
  const potEth = parseFloat(formatEther(potBalance));
  const dateLabel = isResolved ? `EXTRACTED · ${formatDate(endTime)}` : `EXTRACTION · ${formatDate(startTime)}`;

  return (
    <div className="og-card">
      <CornerBrackets />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        {/* LEFT: jackpot amount */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span className="og-label">{isResolved ? "TOTAL PAYOUT" : "ACTIVE DOSSIER"}</span>
            {lotteryId !== undefined && (
              <span className="og-epoch-badge">OP {lotteryId.toString().padStart(2, "0")}</span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <span className="og-amount">{potEth.toFixed(4).replace(/\.?0+$/, "") || "0"}</span>
            <span className="og-unit">ETH</span>
          </div>

          <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "7px" }}>
            <CalendarIcon />
            <span className="og-date-label">{dateLabel}</span>
          </div>
        </div>

        {/* RIGHT: status */}
        <PotCardStatus status={status} winner={winner} />
      </div>
    </div>
  );
}
