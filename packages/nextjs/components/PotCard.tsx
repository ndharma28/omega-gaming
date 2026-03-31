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
  const isResolved = status === 4;
  const isNotStarted = status === 0;
  const potEth = parseFloat(formatEther(potBalance));
  const dateLabel = isNotStarted ? `STARTS · ${formatDate(startTime)}` : `DRAW · ${formatDate(endTime)}`;

  return (
    <div
      style={{
        background: "rgba(10,10,8,0.85)",
        border: "1px solid rgba(239,159,39,0.55)",
        borderRadius: "8px",
        padding: "28px 32px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes og-ping {
          0%   { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes og-winner-in {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <CornerBrackets />

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        {/* LEFT: jackpot amount */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(239,159,39,0.85)",
                fontFamily: "var(--og-mono)",
              }}
            >
              {isResolved ? "TOTAL PAYOUT" : "CURRENT JACKPOT"}
            </span>
            {lotteryId !== undefined && (
              <span
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.2em",
                  fontFamily: "var(--og-mono)",
                  color: "rgba(239,159,39,0.75)",
                  border: "0.5px solid rgba(239,159,39,0.45)",
                  borderRadius: "3px",
                  padding: "2px 7px",
                }}
              >
                EPOCH #{lotteryId.toString()}
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <span
              style={{
                fontSize: "48px",
                fontWeight: 800,
                lineHeight: 1,
                color: "var(--og-amber)",
                fontFamily: "var(--og-mono)",
                letterSpacing: "-0.02em",
              }}
            >
              {potEth.toFixed(4).replace(/\.?0+$/, "") || "0"}
            </span>
            <span
              style={{
                fontSize: "18px",
                color: "var(--og-text-dim)",
                fontFamily: "var(--og-mono)",
                letterSpacing: "0.1em",
              }}
            >
              ETH
            </span>
          </div>

          <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "7px" }}>
            <CalendarIcon />
            <span
              style={{
                fontSize: "11px",
                color: "var(--og-text-muted)",
                fontFamily: "var(--og-mono)",
                letterSpacing: "0.08em",
              }}
            >
              {dateLabel}
            </span>
          </div>
        </div>

        {/* RIGHT: status */}
        <PotCardStatus status={status} winner={winner} />
      </div>
    </div>
  );
}
