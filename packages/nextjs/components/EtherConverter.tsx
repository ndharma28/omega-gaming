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
      {/* Toggle button */}
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
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--og-amber-dim)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--og-amber)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,159,39,0.25)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--og-text-dim)";
        }}
      >
        {/* swap icon */}
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
          <path d="M7 16V4m0 0L3 8m4-4l4 4" />
          <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        Eth Converter
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: 0,
            width: "280px",
            background: "#0E0E0C",
            border: "0.5px solid rgba(239,159,39,0.18)",
            borderRadius: "6px",
            padding: "0",
            zIndex: 50,
            animation: "og-fade-up 0.18s ease forwards",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "0.5px solid rgba(239,159,39,0.07)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "var(--og-amber-dim)",
                }}
              >
                {/* Unit Converter */}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--og-text-muted)",
                cursor: "pointer",
                padding: "2px",
                lineHeight: 1,
                fontSize: "16px",
              }}
            >
              x
            </button>
          </div>

          {/* ETH price pill */}
          {ethPrice > 0 && (
            <div style={{ padding: "8px 16px 0" }}>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--og-text-muted)",
                  letterSpacing: "0.06em",
                }}
              >
                1 ETH = <span style={{ color: "var(--og-green)", fontWeight: 500 }}>${ethPrice.toLocaleString()}</span>
              </span>
            </div>
          )}

          {/* Fields */}
          <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {FIELDS.map(({ label, key, unit, accent }) => (
              <div key={key}>
                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: accent,
                    marginBottom: "5px",
                  }}
                >
                  {label}
                </div>
                <input
                  type="number"
                  value={values[key]}
                  onChange={e => handleChange(e.target.value, unit)}
                  style={{
                    width: "100%",
                    background: "#1A1A16",
                    border: "0.5px solid rgba(239,159,39,0.14)",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    fontFamily: "var(--og-mono)",
                    fontSize: "13px",
                    color: "var(--og-text-bright)",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "var(--og-amber-dim)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(239,159,39,0.14)")}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
