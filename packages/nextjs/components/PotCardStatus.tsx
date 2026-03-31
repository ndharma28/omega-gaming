"use client";

import PingDot from "./PingDot";

interface PotCardStatusProps {
  status: number;
  winner?: string;
}

const TrophyIcon = () => (
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
);

function ResolvedStatus({ winner }: { winner?: string }) {
  return (
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
        <TrophyIcon />
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
          border: "0.5px solid rgba(239,159,39,0.45)",
          borderRadius: "3px",
          padding: "5px 12px",
          letterSpacing: "0.05em",
        }}
      >
        {winner?.slice(0, 6)}…{winner?.slice(-4)}
      </span>
    </div>
  );
}

function DrawingStatus() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <PingDot color="var(--og-amber)" duration="1.2s" />
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
        style={{ fontSize: "9px", color: "rgba(239,159,39,0.7)", fontFamily: "var(--og-mono)", letterSpacing: "0.1em" }}
      >
        AWAITING VRF CALLBACK
      </span>
    </div>
  );
}

function LiveOrPendingStatus({ isLive }: { isLive: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
        {isLive && <PingDot color="var(--og-green)" size={7} duration="2s" />}
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "var(--og-mono)",
            fontWeight: 600,
            color: isLive ? "var(--og-green)" : "rgba(239,159,39,0.7)",
          }}
        >
          {isLive ? "LIVE" : "PENDING"}
        </span>
      </div>
      {isLive && (
        <span
          style={{
            fontSize: "9px",
            color: "rgba(239,159,39,0.7)",
            fontFamily: "var(--og-mono)",
            letterSpacing: "0.12em",
          }}
        >
          ENTRIES OPEN
        </span>
      )}
    </div>
  );
}

export default function PotCardStatus({ status, winner }: PotCardStatusProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
      <span
        style={{
          fontSize: "8px",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(239,159,39,0.85)",
          fontFamily: "var(--og-mono)",
        }}
      >
        STATUS
      </span>
      {status === 4 && <ResolvedStatus winner={winner} />}
      {status === 3 && <DrawingStatus />}
      {(status === 0 || status === 1) && <LiveOrPendingStatus isLive={status === 1} />}
    </div>
  );
}
