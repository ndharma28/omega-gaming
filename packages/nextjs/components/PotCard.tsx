"use client";

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

export default function PotCard({ lotteryId, potBalance, status, startTime, endTime, winner }: PotCardProps) {
  const isResolved = status === 4;
  const isDrawing = status === 3;
  const isNotStarted = status === 0;
  const isLive = status === 1;

  const potEth = parseFloat(formatEther(potBalance));

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

      {/* Corner brackets */}
      {(
        [
          {
            top: 8,
            left: 8,
            borderTop: "1px solid rgba(239,159,39,0.7)",
            borderLeft: "1px solid rgba(239,159,39,0.7)",
          },
          {
            top: 8,
            right: 8,
            borderTop: "1px solid rgba(239,159,39,0.7)",
            borderRight: "1px solid rgba(239,159,39,0.7)",
          },
          {
            bottom: 8,
            left: 8,
            borderBottom: "1px solid rgba(239,159,39,0.7)",
            borderLeft: "1px solid rgba(239,159,39,0.7)",
          },
          {
            bottom: 8,
            right: 8,
            borderBottom: "1px solid rgba(239,159,39,0.7)",
            borderRight: "1px solid rgba(239,159,39,0.7)",
          },
        ] as React.CSSProperties[]
      ).map((s, i) => (
        <div key={i} style={{ position: "absolute", width: 12, height: 12, ...s }} />
      ))}

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
          {/* Label + epoch */}
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

          {/* ETH amount */}
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

          {/* Date row */}
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            {/* Calendar dot */}
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
            <span
              style={{
                fontSize: "11px",
                color: "var(--og-text-muted)",
                fontFamily: "var(--og-mono)",
                letterSpacing: "0.08em",
              }}
            >
              {isNotStarted ? `STARTS · ${formatDate(startTime)}` : `DRAW · ${formatDate(endTime)}`}
            </span>
          </div>
        </div>

        {/* RIGHT: status readout */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
          <span
            style={{
              fontSize: "8px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(239,159,39,0.3)",
              fontFamily: "var(--og-mono)",
            }}
          >
            STATUS
          </span>

          {isResolved ? (
            <div
              style={{
                animation: "og-winner-in 0.4s ease forwards",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "5px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {/* Trophy icon */}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--og-green)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 21h8M12 17v4" />
                  <path d="M7 4H4a2 2 0 0 0-2 2v1c0 4 3 7 6 8" />
                  <path d="M17 4h3a2 2 0 0 1 2 2v1c0 4-3 7-6 8" />
                  <path d="M5 4h14v6a7 7 0 0 1-14 0V4z" />
                </svg>
                <span
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    color: "var(--og-green)",
                    fontFamily: "var(--og-mono)",
                  }}
                >
                  WINNER SELECTED
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--og-mono)",
                  fontSize: "13px",
                  color: "var(--og-text-bright)",
                  background: "rgba(20,20,16,0.9)",
                  border: "0.5px solid rgba(239,159,39,0.15)",
                  borderRadius: "3px",
                  padding: "5px 12px",
                  letterSpacing: "0.05em",
                }}
              >
                {winner?.slice(0, 6)}…{winner?.slice(-4)}
              </span>
            </div>
          ) : isDrawing ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ position: "relative", width: "8px", height: "8px" }}>
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background: "var(--og-amber)",
                      animation: "og-ping 1.2s cubic-bezier(0,0,0.2,1) infinite",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background: "var(--og-amber)",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--og-amber)",
                    fontFamily: "var(--og-mono)",
                    fontWeight: 600,
                  }}
                >
                  SELECTING WINNER
                </span>
              </div>
              <span
                style={{
                  fontSize: "9px",
                  color: "var(--og-text-muted)",
                  fontFamily: "var(--og-mono)",
                  letterSpacing: "0.1em",
                }}
              >
                AWAITING VRF CALLBACK
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                {isLive && (
                  <div style={{ position: "relative", width: "7px", height: "7px" }}>
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        background: "var(--og-green)",
                        animation: "og-ping 2s cubic-bezier(0,0,0.2,1) infinite",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        background: "var(--og-green)",
                      }}
                    />
                  </div>
                )}
                <span
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    fontFamily: "var(--og-mono)",
                    fontWeight: 600,
                    color: isLive ? "var(--og-green)" : "var(--og-text-dim)",
                  }}
                >
                  {isLive ? "LIVE" : "PENDING"}
                </span>
              </div>
              {isLive && (
                <span
                  style={{
                    fontSize: "9px",
                    color: "rgba(239,159,39,0.3)",
                    fontFamily: "var(--og-mono)",
                    letterSpacing: "0.12em",
                  }}
                >
                  ENTRIES OPEN
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
