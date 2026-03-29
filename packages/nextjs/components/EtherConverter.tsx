"use client";

import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";

type Unit = "eth" | "gwei" | "wei" | "usd";

const toStateKey = (unit: "ether" | "gwei" | "wei" | "usd"): Unit => (unit === "ether" ? "eth" : unit);

const FIELDS = [
  { label: "USD", key: "usd" as const, unit: "usd" as const, accent: "var(--og-green)" },
  { label: "ETH", key: "eth" as const, unit: "ether" as const, accent: "var(--og-amber)" },
  { label: "Gwei", key: "gwei" as const, unit: "gwei" as const, accent: "var(--og-text-dim)" },
  { label: "Wei", key: "wei" as const, unit: "wei" as const, accent: "var(--og-text-dim)" },
];

export const EtherConverter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ethPrice, setEthPrice] = useState(0);
  const [values, setValues] = useState({ eth: "1", gwei: "1000000000", wei: "1000000000000000000", usd: "0.00" });
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        const data = await res.json();
        setEthPrice(data.ethereum.usd);
      } catch {
        console.log("Price fetch failed");
      }
    };
    fetchPrice();
  }, []);

  useEffect(() => {
    if (ethPrice > 0) setValues(prev => ({ ...prev, usd: (parseFloat(prev.eth) * ethPrice).toFixed(2) }));
  }, [ethPrice]);

  // Animate scan line when panel is open
  useEffect(() => {
    if (!isOpen) return;
    let frame = 0;
    const id = setInterval(() => {
      frame = (frame + 1) % 100;
      setScanLine(frame);
    }, 30);
    return () => clearInterval(id);
  }, [isOpen]);

  const handleChange = (amount: string, unit: "ether" | "gwei" | "wei" | "usd") => {
    const key = toStateKey(unit);
    if (!amount || amount === ".") {
      setValues(prev => ({ ...prev, [key]: amount }));
      return;
    }
    try {
      let weiValue: bigint;
      if (unit === "usd") {
        if (ethPrice <= 0) return;
        weiValue = parseUnits((parseFloat(amount) / ethPrice).toFixed(18), 18);
      } else {
        const decimals = unit === "ether" ? 18 : unit === "gwei" ? 9 : 0;
        weiValue = parseUnits(amount, decimals);
      }
      const eth = formatUnits(weiValue, 18);
      setValues({
        eth,
        gwei: formatUnits(weiValue, 9),
        wei: formatUnits(weiValue, 0),
        usd: unit === "usd" ? amount : ethPrice > 0 ? (parseFloat(eth) * ethPrice).toFixed(2) : "0.00",
      });
    } catch {
      setValues(prev => ({ ...prev, [key]: amount }));
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        @keyframes og-fade-up {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cipher-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        .cipher-btn:hover .cipher-icon { color: var(--og-amber); }
      `}</style>

      {/* Toggle button */}
      <button
        className="cipher-btn"
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
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--og-amber-dim)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--og-amber)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,159,39,0.25)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--og-text-dim)";
        }}
      >
        {/* Signal / decode icon */}
        <svg
          className="cipher-icon"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "color 0.2s" }}
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M6.3 6.3a8 8 0 0 0 0 11.4" />
          <path d="M17.7 6.3a8 8 0 0 1 0 11.4" />
          <path d="M3.5 3.5a14 14 0 0 0 0 17" />
          <path d="M20.5 3.5a14 14 0 0 1 0 17" />
        </svg>
        SIGNAL DECODE
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: 0,
            width: "292px",
            background: "#0A0A08",
            border: "0.5px solid rgba(239,159,39,0.22)",
            borderRadius: "6px",
            padding: "0",
            zIndex: 50,
            animation: "og-fade-up 0.18s ease forwards",
            boxShadow: "0 8px 40px rgba(0,0,0,0.75), inset 0 0 60px rgba(239,159,39,0.015)",
            overflow: "hidden",
          }}
        >
          {/* Scan line overlay */}
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

          {/* Corner brackets — top-left */}
          <div
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              width: 12,
              height: 12,
              borderTop: "1px solid rgba(239,159,39,0.45)",
              borderLeft: "1px solid rgba(239,159,39,0.45)",
            }}
          />
          {/* Corner brackets — top-right */}
          <div
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 12,
              height: 12,
              borderTop: "1px solid rgba(239,159,39,0.45)",
              borderRight: "1px solid rgba(239,159,39,0.45)",
            }}
          />
          {/* Corner brackets — bottom-left */}
          <div
            style={{
              position: "absolute",
              bottom: 6,
              left: 6,
              width: 12,
              height: 12,
              borderBottom: "1px solid rgba(239,159,39,0.45)",
              borderLeft: "1px solid rgba(239,159,39,0.45)",
            }}
          />
          {/* Corner brackets — bottom-right */}
          <div
            style={{
              position: "absolute",
              bottom: 6,
              right: 6,
              width: 12,
              height: 12,
              borderBottom: "1px solid rgba(239,159,39,0.45)",
              borderRight: "1px solid rgba(239,159,39,0.45)",
            }}
          />

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 18px 10px",
              borderBottom: "0.5px solid rgba(239,159,39,0.08)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: "rgba(239,159,39,0.35)",
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
                lineHeight: 1,
                fontSize: "10px",
                fontFamily: "var(--og-mono)",
                letterSpacing: "0.1em",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,159,39,0.4)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--og-amber)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,159,39,0.15)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--og-text-muted)";
              }}
            >
              ✕ CLOSE
            </button>
          </div>

          {/* ETH price intercept */}
          {ethPrice > 0 && (
            <div
              style={{
                padding: "8px 18px",
                borderBottom: "0.5px solid rgba(239,159,39,0.06)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--og-green)",
                  boxShadow: "0 0 6px var(--og-green)",
                  animation: "cipher-blink 2s ease-in-out infinite",
                  flexShrink: 0,
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

          {/* Field label strip */}
          <div style={{ padding: "10px 18px 0" }}>
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "0.25em",
                color: "rgba(239,159,39,0.25)",
                fontFamily: "var(--og-mono)",
                textTransform: "uppercase",
              }}
            >
              ENTER ANY UNIT · ALL OTHERS DECODE AUTOMATICALLY
            </span>
          </div>

          {/* Fields */}
          <div style={{ padding: "10px 18px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {FIELDS.map(({ label, key, unit, accent }) => (
              <div key={key} style={{ position: "relative" }}>
                <div
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: accent,
                    marginBottom: "5px",
                    fontFamily: "var(--og-mono)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "4px",
                      height: "4px",
                      background: accent,
                      borderRadius: "50%",
                      opacity: 0.6,
                    }}
                  />
                  {label}
                </div>
                <input
                  type="number"
                  value={values[key]}
                  onChange={e => handleChange(e.target.value, unit)}
                  style={{
                    width: "100%",
                    background: "rgba(20,20,16,0.9)",
                    border: "0.5px solid rgba(239,159,39,0.12)",
                    borderRadius: "3px",
                    padding: "8px 12px",
                    fontFamily: "var(--og-mono)",
                    fontSize: "13px",
                    color: "var(--og-text-bright)",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = "var(--og-amber-dim)";
                    e.target.style.boxShadow = "0 0 0 1px rgba(239,159,39,0.08)";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "rgba(239,159,39,0.12)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            ))}
          </div>

          {/* Footer stamp */}
          <div
            style={{
              padding: "6px 18px 10px",
              borderTop: "0.5px solid rgba(239,159,39,0.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "8px",
                color: "rgba(239,159,39,0.2)",
                fontFamily: "var(--og-mono)",
                letterSpacing: "0.2em",
              }}
            >
              ΩG-CIPHER-V1
            </span>
            <span
              style={{
                fontSize: "8px",
                color: "rgba(239,159,39,0.2)",
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
