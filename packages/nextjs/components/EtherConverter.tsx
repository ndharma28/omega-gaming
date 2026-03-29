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
  initialEth?: string;
  iconOnly?: boolean;
}

export const EtherConverter = ({ initialEth = "1", iconOnly = false }: EtherConverterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ethPrice, setEthPrice] = useState(0);
  const [fromUnit, setFromUnit] = useState<Unit>("ether");
  const [toUnit, setToUnit] = useState<Unit>("usd");
  const [inputVal, setInputVal] = useState(initialEth);
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
      .then(r => r.json())
      .then(d => setEthPrice(d.ethereum.usd))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen) setInputVal(initialEth || "1");
  }, [isOpen, initialEth]);

  useEffect(() => {
    if (!isOpen) return;
    let frame = 0;
    const id = setInterval(() => {
      frame = (frame + 1) % 100;
      setScanLine(frame);
    }, 30);
    return () => clearInterval(id);
  }, [isOpen]);

  const result = convert(inputVal, fromUnit, toUnit, ethPrice);

  const selectStyle: React.CSSProperties = {
    background: "rgba(20,20,16,0.95)",
    border: "0.5px solid rgba(239,159,39,0.18)",
    borderRadius: "3px",
    color: "var(--og-amber)",
    fontFamily: "var(--og-mono)",
    fontSize: "11px",
    letterSpacing: "0.15em",
    padding: "4px 6px",
    cursor: "pointer",
    outline: "none",
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    width: "62px",
    textAlign: "center" as const,
  };

  const SignalIcon = () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M6.3 6.3a8 8 0 0 0 0 11.4" />
      <path d="M17.7 6.3a8 8 0 0 1 0 11.4" />
      <path d="M3.5 3.5a14 14 0 0 0 0 17" />
      <path d="M20.5 3.5a14 14 0 0 1 0 17" />
    </svg>
  );

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <style>{`
        @keyframes og-fade-up {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cipher-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        .og-cipher-select:focus { border-color: rgba(239,159,39,0.45) !important; }
        .og-cipher-select option { background: #0A0A08; color: #EF9F27; }
        .og-cipher-input:focus {
          border-color: rgba(239,159,39,0.45) !important;
          box-shadow: 0 0 0 1px rgba(239,159,39,0.08);
        }
      `}</style>

      {/* Trigger */}
      {iconOnly ? (
        <button
          onClick={() => setIsOpen(o => !o)}
          title="Value Cipher — decode ETH amounts"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "22px",
            height: "22px",
            padding: 0,
            background: isOpen ? "rgba(239,159,39,0.1)" : "transparent",
            border: `0.5px solid ${isOpen ? "rgba(239,159,39,0.4)" : "rgba(239,159,39,0.2)"}`,
            borderRadius: "4px",
            color: isOpen ? "var(--og-amber)" : "rgba(239,159,39,0.45)",
            cursor: "pointer",
            transition: "all 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.borderColor = "rgba(239,159,39,0.5)";
            b.style.color = "var(--og-amber)";
            b.style.background = "rgba(239,159,39,0.08)";
          }}
          onMouseLeave={e => {
            if (isOpen) return;
            const b = e.currentTarget as HTMLButtonElement;
            b.style.borderColor = "rgba(239,159,39,0.2)";
            b.style.color = "rgba(239,159,39,0.45)";
            b.style.background = "transparent";
          }}
        >
          <SignalIcon />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(o => !o)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 14px",
            background: "transparent",
            border: "0.5px solid rgba(239,159,39,0.25)",
            borderRadius: "4px",
            color: "var(--og-text-dim)",
            fontFamily: "var(--og-mono)",
            fontSize: "12px",
            letterSpacing: "0.1em",
            cursor: "pointer",
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.borderColor = "var(--og-amber-dim)";
            b.style.color = "var(--og-amber)";
          }}
          onMouseLeave={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.borderColor = "rgba(239,159,39,0.25)";
            b.style.color = "var(--og-text-dim)";
          }}
        >
          <SignalIcon />
          SIGNAL DECODE
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: iconOnly ? "50%" : 0,
            transform: iconOnly ? "translateX(-50%)" : "none",
            width: "300px",
            background: "#0A0A08",
            border: "0.5px solid rgba(239,159,39,0.22)",
            borderRadius: "6px",
            zIndex: 50,
            animation: "og-fade-up 0.18s ease forwards",
            boxShadow: "0 8px 40px rgba(0,0,0,0.75)",
            overflow: "hidden",
          }}
        >
          {/* Scan line */}
          <div
            style={{
              position: "absolute",
              top: `${scanLine}%`,
              left: 0,
              right: 0,
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(239,159,39,0.06), transparent)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          />

          {/* Corner brackets */}
          {(
            [
              {
                top: 6,
                left: 6,
                borderTop: "1px solid rgba(239,159,39,0.4)",
                borderLeft: "1px solid rgba(239,159,39,0.4)",
              },
              {
                top: 6,
                right: 6,
                borderTop: "1px solid rgba(239,159,39,0.4)",
                borderRight: "1px solid rgba(239,159,39,0.4)",
              },
              {
                bottom: 6,
                left: 6,
                borderBottom: "1px solid rgba(239,159,39,0.4)",
                borderLeft: "1px solid rgba(239,159,39,0.4)",
              },
              {
                bottom: 6,
                right: 6,
                borderBottom: "1px solid rgba(239,159,39,0.4)",
                borderRight: "1px solid rgba(239,159,39,0.4)",
              },
            ] as React.CSSProperties[]
          ).map((s, i) => (
            <div key={i} style={{ position: "absolute", width: 10, height: 10, ...s }} />
          ))}

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "11px 18px 9px",
              borderBottom: "0.5px solid rgba(239,159,39,0.08)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span
                style={{
                  fontSize: "8px",
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: "rgba(239,159,39,0.3)",
                  fontFamily: "var(--og-mono)",
                }}
              >
                ████ CLASSIFIED ████
              </span>
              <span
                style={{
                  fontSize: "11px",
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
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "0.5px solid rgba(239,159,39,0.15)",
                borderRadius: "3px",
                color: "var(--og-text-muted)",
                cursor: "pointer",
                padding: "3px 7px",
                fontSize: "10px",
                fontFamily: "var(--og-mono)",
                letterSpacing: "0.1em",
                transition: "border-color 0.15s, color 0.15s",
                lineHeight: 1,
              }}
              onMouseEnter={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.borderColor = "rgba(239,159,39,0.4)";
                b.style.color = "var(--og-amber)";
              }}
              onMouseLeave={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.borderColor = "rgba(239,159,39,0.15)";
                b.style.color = "var(--og-text-muted)";
              }}
            >
              ✕ CLOSE
            </button>
          </div>

          {/* Live price strip */}
          {ethPrice > 0 && (
            <div
              style={{
                padding: "7px 18px",
                borderBottom: "0.5px solid rgba(239,159,39,0.06)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: "var(--og-green)",
                  boxShadow: "0 0 6px var(--og-green)",
                  animation: "cipher-blink 2s ease-in-out infinite",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: "10px",
                  color: "var(--og-text-muted)",
                  fontFamily: "var(--og-mono)",
                  letterSpacing: "0.1em",
                }}
              >
                LIVE INTERCEPT &nbsp;·&nbsp; 1 ETH ={" "}
                <span style={{ color: "var(--og-green)", fontWeight: 600 }}>${ethPrice.toLocaleString()}</span>
              </span>
            </div>
          )}

          {/* Two-column converter */}
          <div style={{ padding: "16px 18px 18px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "10px" }}>
              {/* FROM */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span
                  style={{
                    fontSize: "8px",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "rgba(239,159,39,0.35)",
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
                    padding: "8px 10px",
                    fontFamily: "var(--og-mono)",
                    fontSize: "14px",
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

              {/* Arrow + swap */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  paddingTop: "16px",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(239,159,39,0.35)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
                <button
                  onClick={() => {
                    setFromUnit(toUnit);
                    setToUnit(fromUnit);
                  }}
                  title="Swap units"
                  style={{
                    background: "transparent",
                    border: "0.5px solid rgba(239,159,39,0.12)",
                    borderRadius: "3px",
                    color: "rgba(239,159,39,0.3)",
                    cursor: "pointer",
                    padding: "3px 5px",
                    display: "flex",
                    alignItems: "center",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.borderColor = "rgba(239,159,39,0.35)";
                    b.style.color = "var(--og-amber)";
                  }}
                  onMouseLeave={e => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.borderColor = "rgba(239,159,39,0.12)";
                    b.style.color = "rgba(239,159,39,0.3)";
                  }}
                >
                  <svg
                    width="10"
                    height="10"
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
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span
                  style={{
                    fontSize: "8px",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "rgba(239,159,39,0.35)",
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
                    padding: "8px 10px",
                    fontFamily: "var(--og-mono)",
                    fontSize: "14px",
                    color: result ? "var(--og-green)" : "var(--og-text-muted)",
                    minHeight: "38px",
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

          {/* Footer stamp */}
          <div
            style={{
              padding: "5px 18px 9px",
              borderTop: "0.5px solid rgba(239,159,39,0.06)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "8px",
                color: "rgba(239,159,39,0.18)",
                fontFamily: "var(--og-mono)",
                letterSpacing: "0.2em",
              }}
            >
              ΩG-CIPHER-V1
            </span>
            <span
              style={{
                fontSize: "8px",
                color: "rgba(239,159,39,0.18)",
                fontFamily: "var(--og-mono)",
                letterSpacing: "0.1em",
              }}
            >
              FOR AUTHORIZED USE ONLY
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
