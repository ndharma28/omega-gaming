"use client";

import { useEffect, useState } from "react";
import CipherField from "./CipherField";
import CipherHeader from "./CipherHeader";
import CornerBrackets from "./CornerBrackets";
import { formatUnits, parseUnits } from "viem";

type Unit = "ether" | "gwei" | "wei" | "usd";

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

  useEffect(() => {
    setInputVal(initialEth || "1");
  }, [initialEth]);

  const result = convert(inputVal, fromUnit, toUnit, ethPrice);

  return (
    <div style={{ marginTop: "12px" }}>
      <CipherHeader ethPrice={ethPrice} />

      <div className="og-cipher-panel">
        <CornerBrackets color="rgba(239,159,39,0.35)" size={8} offset={5} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "start", gap: "10px" }}>
          <CipherField
            label="INPUT DENOMINATION"
            unit={fromUnit}
            onUnitChange={setFromUnit}
            value={inputVal}
            onValueChange={setInputVal}
          />

          {/* Swap column */}
          <div
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", paddingTop: "18px" }}
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

          <CipherField label="OUTPUT DENOMINATION" unit={toUnit} onUnitChange={setToUnit} result={result} />
        </div>
      </div>
    </div>
  );
};
