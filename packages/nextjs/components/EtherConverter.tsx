"use client";

import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { ArrowsRightLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";

export const EtherConverter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState({
    eth: "1",
    gwei: "1000000000",
    wei: "1000000000000000000",
  });

  const handleChange = (amount: string, unit: "ether" | "gwei" | "wei") => {
    if (!amount || amount === ".") {
      setValues({ ...values, [unit === "ether" ? "eth" : unit]: amount });
      return;
    }

    try {
      const weiValue = parseUnits(amount, unit === "ether" ? 18 : unit === "gwei" ? 9 : 0);
      setValues({
        eth: formatUnits(weiValue, 18),
        gwei: formatUnits(weiValue, 9),
        wei: formatUnits(weiValue, 0),
      });
    } catch {
      // ✅ FIX: No (e) here. We just ignore errors silently.
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
                <span className="label-text text-xs font-bold text-gray-500">Ether</span>
              </label>
              <input
                type="text"
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
                type="text"
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
                type="text"
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
