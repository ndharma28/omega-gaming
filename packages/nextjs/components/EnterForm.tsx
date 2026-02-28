"use client";

import { LotteryStatus } from "./StatusBar";
import { AlertCircle, RefreshCw } from "lucide-react";

interface EnterFormProps {
  entryAmount: string;
  setEntryAmount: (val: string) => void;
  onEnter: () => Promise<void>;
  disabled: boolean;
  isEntering: boolean;
  isInvalid: boolean;
  minEntry: number;
  walletBalance: number; // add this prop
  status: LotteryStatus;
}

export default function EnterForm({
  entryAmount,
  setEntryAmount,
  onEnter,
  disabled,
  isEntering,
  isInvalid,
  minEntry,
  walletBalance,
  status,
}: EnterFormProps) {
  const minEntryDisplay = minEntry.toFixed(4).replace(/\.?0+$/, "") || "0";
  const parsedAmount = parseFloat(entryAmount);
  const isTooHigh = !!entryAmount && !isNaN(parsedAmount) && parsedAmount > walletBalance;
  const hasError = isInvalid || isTooHigh;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow only digits and a single decimal point
    const sanitized = raw.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    setEntryAmount(sanitized);
  };

  const getButtonLabel = () => {
    if (isEntering)
      return (
        <span className="flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" /> Processing...
        </span>
      );
    if (status === LotteryStatus.DRAWING) return "Selecting Winner...";
    if (status === LotteryStatus.RESOLVED) return "Lottery Completed";
    if (status === LotteryStatus.CLOSED) return "Lottery Closed";
    if (status === LotteryStatus.NOT_STARTED) return "Not Started Yet";
    if (isTooHigh) return "Insufficient Balance";
    if (isInvalid) return "Invalid Amount";
    return "Enter Lottery";
  };

  const getErrorMessage = () => {
    if (isTooHigh) return `Insufficient balance — max ${walletBalance.toFixed(4).replace(/\.?0+$/, "")} ETH`;
    if (isInvalid) return `Minimum entry: ${minEntryDisplay} ETH required`;
    return null;
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
          <span className="text-yellow-500">🎟️</span>
        </div>
        <h3 className="font-semibold text-lg text-white">Enter the Lottery</h3>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium text-white">
            Amount (ETH)
          </label>
          <div className="relative">
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              value={entryAmount}
              onChange={handleAmountChange}
              className={`w-full bg-slate-950 border rounded-lg h-12 px-4 text-lg text-white transition-all outline-none
                ${
                  hasError
                    ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    : "border-slate-800 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/50"
                }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">ETH</span>
          </div>

          <div className="flex items-center gap-2 min-h-[20px] mt-2">
            {errorMessage ? (
              <div className="flex items-center gap-1.5 animate-in fade-in duration-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 w-full">
                <AlertCircle className="w-4 h-4 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <p className="text-xs font-black text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,1)] tracking-widest uppercase">
                  {errorMessage}
                </p>
              </div>
            ) : (
              <p className="text-xs font-bold text-white tracking-wide">Minimum entry: {minEntryDisplay} ETH</p>
            )}
          </div>
        </div>

        <button
          onClick={onEnter}
          disabled={disabled || isTooHigh}
          className={`w-full h-12 rounded-lg font-bold text-lg transition-all active:scale-[0.98] 
            ${
              disabled || isTooHigh
                ? "bg-slate-700 text-white cursor-not-allowed shadow-none opacity-100"
                : "bg-yellow-500 text-slate-900 hover:bg-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
            }`}
        >
          {getButtonLabel()}
        </button>
      </div>
    </div>
  );
}
