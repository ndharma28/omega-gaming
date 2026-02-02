"use client";

import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { ArrowsRightLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";

export const EtherConverter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ethPrice, setEthPrice] = useState(0);

  const [values, setValues] = useState({
    eth: "1",
    gwei: "1000000000",
    wei: "1000000000000000000",
    usd: "0.00",
  });

  // 1. Fetch Price Locally (No hooks needed!)
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        const data = await response.json();
        const price = data.ethereum.usd;
        setEthPrice(price);
      } catch {
        // Silently fail if API is down
        console.log("Price fetch failed");
      }
    };

    fetchPrice();
  }, []);

  // 2. Update USD when price loads
  useEffect(() => {
    if (ethPrice > 0 && values.eth) {
      const usdVal = (parseFloat(values.eth) * ethPrice).toFixed(2);

      setValues(prev => {
        if (prev.usd !== usdVal) return { ...prev, usd: usdVal };
        return prev;
      });
    }
  }, [ethPrice, values.eth]);

  const handleChange = (amount: string, unit: "ether" | "gwei" | "wei" | "usd") => {
    if (!amount || amount === ".") {
      setValues({ ...values, [unit === "ether" ? "eth" : unit]: amount });
      return;
    }

    try {
      let weiValue = 0n;
      let ethValueStr = "";

      if (unit === "usd") {
        if (ethPrice > 0) {
          const ethNum = parseFloat(amount) / ethPrice;
          ethValueStr = ethNum.toFixed(18);
          weiValue = parseUnits(ethValueStr, 18);
        }
      } else {
        weiValue = parseUnits(amount, unit === "ether" ? 18 : unit === "gwei" ? 9 : 0);
      }

      const eth = formatUnits(weiValue, 18);
      const usd = ethPrice > 0 ? (parseFloat(eth) * ethPrice).toFixed(2) : "0.00";

      setValues({
        eth: eth,
        gwei: formatUnits(weiValue, 9),
        wei: formatUnits(weiValue, 0),
        usd: unit === "usd" ? amount : usd,
      });
    } catch {
      setValues({ ...values, [unit === "ether" ? "eth" : unit]: amount });
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
            <div className="form-control">
              <label className="label pt-0 pb-1">
                <span className="label-text text-xs font-bold text-success">USD ($)</span>
              </label>
              <input
                type="number"
                value={values.usd}
                onChange={e => handleChange(e.target.value, "usd")}
                className="input input-bordered input-sm w-full font-mono focus:outline-none focus:border-success"
                placeholder="0.00"
              />
            </div>
            <div className="form-control">
              <label className="label pt-0 pb-1">
                <span className="label-text text-xs font-bold text-gray-500">Ether</span>
              </label>
              <input
                type="number"
                value={values.eth}
                onChange={e => handleChange(e.target.value, "ether")}
                className="input input-bordered input-sm w-full font-mono focus:outline-none focus:border-primary"
                placeholder="ETH"
              />
            </div>
            <div className="form-control">
              <label className="label pt-0 pb-1">
                <span className="label-text text-xs font-bold text-gray-500">Gwei</span>
              </label>
              <input
                type="number"
                value={values.gwei}
                onChange={e => handleChange(e.target.value, "gwei")}
                className="input input-bordered input-sm w-full font-mono focus:outline-none focus:border-primary"
                placeholder="Gwei"
              />
            </div>
            <div className="form-control">
              <label className="label pt-0 pb-1">
                <span className="label-text text-xs font-bold text-gray-500">Wei</span>
              </label>
              <input
                type="number"
                value={values.wei}
                onChange={e => handleChange(e.target.value, "wei")}
                className="input input-bordered input-sm w-full font-mono focus:outline-none focus:border-primary"
                placeholder="Wei"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
