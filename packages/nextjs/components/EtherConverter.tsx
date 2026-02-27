"use client";

import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { ArrowsRightLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Unit = "eth" | "gwei" | "wei" | "usd";

const toStateKey = (unit: "ether" | "gwei" | "wei" | "usd"): Unit => (unit === "ether" ? "eth" : unit);

const FIELDS = [
  { label: "USD ($)", key: "usd" as const, unit: "usd" as const, colorClass: "text-success" },
  { label: "Ether", key: "eth" as const, unit: "ether" as const, colorClass: "text-gray-500" },
  { label: "Gwei", key: "gwei" as const, unit: "gwei" as const, colorClass: "text-gray-500" },
  { label: "Wei", key: "wei" as const, unit: "wei" as const, colorClass: "text-gray-500" },
];

export const EtherConverter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ethPrice, setEthPrice] = useState(0);
  const [values, setValues] = useState({
    eth: "1",
    gwei: "1000000000",
    wei: "1000000000000000000",
    usd: "0.00",
  });

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
    if (ethPrice > 0) {
      setValues(prev => ({
        ...prev,
        usd: (parseFloat(prev.eth) * ethPrice).toFixed(2),
      }));
    }
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
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="btn btn-primary btn-sm font-normal gap-2 shadow-lg">
        <ArrowsRightLeftIcon className="h-4 w-4" />
        <span>Eth Converter</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-12 left-0 w-80 bg-base-100 border border-base-300 shadow-xl rounded-xl p-4 animate-fade-in-up">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm">Unit Converter</h3>
            <button onClick={() => setIsOpen(false)} className="btn btn-ghost btn-xs btn-circle">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {FIELDS.map(({ label, key, unit, colorClass }) => (
              <div className="form-control" key={key}>
                <label className="label pt-0 pb-1">
                  <span className={`label-text text-xs font-bold ${colorClass}`}>{label}</span>
                </label>
                <input
                  type="number"
                  value={values[key]}
                  onChange={e => handleChange(e.target.value, unit)}
                  className="input input-bordered input-sm w-full font-mono focus:outline-none focus:border-primary"
                  placeholder={label}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
