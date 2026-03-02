"use client";

// Mirrors the NEW Solidity enum exactly
export enum LotteryStatus {
  OPEN = 0,
  DRAWING = 1,
  RESOLVED = 2,
}

interface StatusBarProps {
  status: LotteryStatus;
  timeRemaining: string;
  startTime?: bigint;
  endTime?: bigint;
}

function formatTime(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusConfig(status: LotteryStatus, isClosingSoon: boolean, isTimeExpired: boolean) {
  // If time has passed but Chainlink hasn't updated the state to DRAWING yet
  if (status === LotteryStatus.OPEN && isTimeExpired) {
    return {
      label: "Awaiting Draw",
      containerClass: "bg-purple-900/20 border-purple-500/40",
      dotClass: "bg-purple-500 animate-pulse",
      textClass: "text-purple-400",
    };
  }

  if (isClosingSoon && status === LotteryStatus.OPEN) {
    return {
      label: "Closing Soon",
      containerClass: "bg-yellow-500/10 border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.2)]",
      dotClass: "bg-yellow-500 animate-bounce",
      textClass: "text-yellow-500",
    };
  }

  switch (status) {
    case LotteryStatus.OPEN:
      return {
        label: "Entries Open",
        containerClass: "bg-green-900/20 border-green-500/40",
        dotClass: "bg-green-500 animate-pulse",
        textClass: "text-green-400",
      };
    case LotteryStatus.DRAWING:
      return {
        label: "Selecting Winner...",
        containerClass: "bg-orange-900/20 border-orange-500/40",
        dotClass: "bg-orange-500 animate-ping",
        textClass: "text-orange-400",
      };
    case LotteryStatus.RESOLVED:
    default:
      return {
        label: "Lottery Completed",
        containerClass: "bg-blue-900/20 border-blue-500/40",
        dotClass: "bg-blue-400",
        textClass: "text-blue-300",
      };
  }
}

export default function StatusBar({ status, timeRemaining, startTime, endTime }: StatusBarProps) {
  const isOpen = status === LotteryStatus.OPEN;
  const isDrawing = status === LotteryStatus.DRAWING;
  const isResolved = status === LotteryStatus.RESOLVED;

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const secondsRemaining = endTime ? Number(endTime) - currentTimestamp : null;

  const isTimeExpired = isOpen && secondsRemaining !== null && secondsRemaining <= 0;
  const isClosingSoon = isOpen && !isTimeExpired && secondsRemaining !== null && secondsRemaining <= 5 * 60;

  const config = getStatusConfig(status, isClosingSoon, isTimeExpired);

  return (
    <div
      className={`flex items-center gap-4 py-3 px-4 rounded-xl border transition-all duration-500 ${config.containerClass}`}
    >
      <div className={`w-2.5 h-2.5 rounded-full ${config.dotClass}`} />

      <div className="flex flex-col">
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${config.textClass}`}>{config.label}</p>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          {isOpen && !isTimeExpired && endTime && `Ends at ${formatTime(endTime)}`}
          {isTimeExpired && "Time expired. Chainlink Automation will draw shortly."}
          {isDrawing && "Chainlink VRF is generating randomness..."}
          {isResolved && "Grand prize has been distributed"}
        </p>
      </div>

      <div className="ml-auto text-right">
        {isClosingSoon ? (
          <div className="flex flex-col animate-in fade-in slide-in-from-right-2">
            <span className="text-yellow-500/70 text-[9px] block uppercase font-black tracking-tighter">Ending In</span>
            <span className="text-yellow-500 font-mono font-black text-lg drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
              {timeRemaining}
            </span>
          </div>
        ) : (
          <div className="flex flex-col">
            <span className="text-slate-500 text-[9px] block uppercase font-bold">
              {isResolved ? "Final Payout" : isTimeExpired ? "Draw Processing" : "Next Draw"}
            </span>
            <span
              className={`font-black text-sm uppercase ${isResolved ? "text-blue-400" : isTimeExpired ? "text-purple-400" : "text-white"}`}
            >
              {endTime ? formatTime(endTime) : "TBD"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
