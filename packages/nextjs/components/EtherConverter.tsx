"use client";

import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";

type Unit = "ether" | "gwei" | "wei" | "usd";

const UNITS: { label: string; value: Unit }[] = [
  { label: "ETH", value: "ether" },
  { label: "Gwei", value: "gwei" },
  { label: "Wei", value: "wei" },
  { label: "USD", value: "usd" },
];

function convert(amount: string, from: Unit, to: Unit, ethPrice: number): string {
  if (!amount || amount === "." || isNaN(parseFloat(amount))) return "";
  try {
    let weiValue: bigint;
    if (from === "usd") {
      if (ethPrice <= 0) return "";
      weiValue = parseUnits((parseFloat(amount) / ethPrice).toFixed(18), 18);
    } else {
      const decimals = from === "ether" ? 18 : from === "gwei" ? 9 : 0;
      weiValue = parseUnits(amount, decimals);
    }
    if (to === "usd") {
      const eth = parseFloat(formatUnits(weiValue, 18));
      return ethPrice > 0 ? (eth * ethPrice).toFixed(2) : "";
    }
    const decimals = to === "ether" ? 18 : to === "gwei" ? 9 : 0;
    return formatUnits(weiValue, decimals);
  } catch {
    return "";
  }
}

interface EtherConverterProps {
  /** Seed the FROM input with this value (e.g. the entry amount) */
  initialEth?: string;
}

export const EtherConverter = ({ initialEth = "1" }: EtherConverterProps) => {
  const [ethPrice, setEthPrice] = useState(0);
  const [fromUnit, setFromUnit] = useState<Unit>("ether");
  const [toUnit, setToUnit] = useState<Unit>("usd");
  const [inputVal, setInputVal] = useState(initialEth);

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
      .then(r => r.json())
      .then(d => setEthPrice(d.ethereum.usd))
      .catch(() => {});
  }, []);

  // Keep in sync when parent entry amount changes
  useEffect(() => {
    setInputVal(initialEth || "1");
  }, [initialEth]);

  const result = convert(inputVal, fromUnit, toUnit, ethPrice);

  const selectStyle: React.CSSProperties = {
    background: "rgba(20,20,16,0.95)",
    border: "0.5px solid rgba(239,159,39,0.18)",
    borderRadius: "3px",
    color: "var(--og-amber)",
    fontFamily: "var(--og-mono)",
    fontSize: "11px",
    letterSpacing: "0.12em",
    padding: "5px 8px",
    cursor: "pointer",
    outline: "none",
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    width: "100%",
    textAlign: "center" as const,
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ marginTop: "12px" }}>
      <style>{`
        @keyframes cipher-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        .og-cipher-select:focus { border-color: rgba(239,159,39,0.45) !important; }
        .og-cipher-select:hover { border-color: rgba(239,159,39,0.32) !important; }
        .og-cipher-select option { background: #0A0A08; color: #EF9F27; }
        .og-cipher-input:focus {
          border-color: rgba(239,159,39,0.45) !important;
          box-shadow: 0 0 0 1px rgba(239,159,39,0.06);
        }
        .og-swap-btn:hover {
          border-color: rgba(239,159,39,0.35) !important;
          color: var(--og-amber) !important;
        }
      `}</style>

      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          <span
            style={{
              fontSize: "8px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(239,159,39,0.8)",
              fontFamily: "var(--og-mono)",
            }}
          >
            ████ CLASSIFIED ████
          </span>
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--og-amber)",
              fontFamily: "var(--og-mono)",
              fontWeight: 600,
            }}
          >
            VALUE CIPHER
          </span>
        </div>

        {/* Live price pill */}
        {ethPrice > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                flexShrink: 0,
                background: "var(--og-green)",
                display: "inline-block",
                animation: "cipher-blink 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontSize: "10px",
                color: "var(--og-text-muted)",
                fontFamily: "var(--og-mono)",
                letterSpacing: "0.08em",
              }}
            >
              1 ETH = <span style={{ color: "var(--og-green)", fontWeight: 600 }}>${ethPrice.toLocaleString()}</span>
            </span>
          </div>
        )}
      </div>

      {/* Two-column converter */}
      <div
        style={{
          background: "rgba(10,10,8,0.7)",
          border: "0.5px solid rgba(239,159,39,0.15)",
          borderRadius: "5px",
          padding: "12px 14px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Corner brackets */}
        {(
          [
            {
              top: 5,
              left: 5,
              borderTop: "1px solid rgba(239,159,39,0.35)",
              borderLeft: "1px solid rgba(239,159,39,0.35)",
            },
            {
              top: 5,
              right: 5,
              borderTop: "1px solid rgba(239,159,39,0.35)",
              borderRight: "1px solid rgba(239,159,39,0.35)",
            },
            {
              bottom: 5,
              left: 5,
              borderBottom: "1px solid rgba(239,159,39,0.35)",
              borderLeft: "1px solid rgba(239,159,39,0.35)",
            },
            {
              bottom: 5,
              right: 5,
              borderBottom: "1px solid rgba(239,159,39,0.35)",
              borderRight: "1px solid rgba(239,159,39,0.35)",
            },
          ] as React.CSSProperties[]
        ).map((s, i) => (
          <div key={i} style={{ position: "absolute", width: 8, height: 8, ...s }} />
        ))}

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "start", gap: "10px" }}>
          {/* FROM */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <span
              style={{
                fontSize: "8px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(239,159,39,0.8)",
                fontFamily: "var(--og-mono)",
              }}
            >
              FROM
            </span>
            <input
              className="og-cipher-input"
              type="number"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              style={{
                background: "rgba(20,20,16,0.95)",
                border: "0.5px solid rgba(239,159,39,0.18)",
                borderRadius: "3px",
                padding: "7px 9px",
                fontFamily: "var(--og-mono)",
                fontSize: "13px",
                color: "var(--og-text-bright)",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
            />
            <select
              className="og-cipher-select"
              value={fromUnit}
              onChange={e => setFromUnit(e.target.value as Unit)}
              style={selectStyle}
            >
              {UNITS.map(u => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          {/* Center: arrow + swap */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "5px",
              paddingTop: "18px",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(239,159,39,0.3)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            <button
              className="og-swap-btn"
              onClick={() => {
                setFromUnit(toUnit);
                setToUnit(fromUnit);
              }}
              title="Swap units"
              style={{
                background: "transparent",
                border: "0.5px solid rgba(239,159,39,0.12)",
                borderRadius: "3px",
                color: "rgba(239,159,39,0.28)",
                cursor: "pointer",
                padding: "3px 5px",
                display: "flex",
                alignItems: "center",
                transition: "all 0.15s",
              }}
            >
              <svg
                width="9"
                height="9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 16V4m0 0L3 8m4-4l4 4" />
                <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* TO */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <span
              style={{
                fontSize: "8px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(239,159,39,0.8)",
                fontFamily: "var(--og-mono)",
              }}
            >
              TO
            </span>
            <div
              style={{
                background: "rgba(12,12,10,0.95)",
                border: "0.5px solid rgba(239,159,39,0.1)",
                borderRadius: "3px",
                padding: "7px 9px",
                fontFamily: "var(--og-mono)",
                fontSize: "13px",
                color: result ? "var(--og-green)" : "var(--og-text-muted)",
                minHeight: "35px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                boxSizing: "border-box",
              }}
            >
              {result || "—"}
            </div>
            <select
              className="og-cipher-select"
              value={toUnit}
              onChange={e => setToUnit(e.target.value as Unit)}
              style={selectStyle}
            >
              {UNITS.map(u => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
