"use client";

// Mirrors the Solidity enum exactly
export enum LotteryStatus {
  NOT_STARTED = 0,
  OPEN = 1,
  CLOSED = 2,
  DRAWING = 3,
  RESOLVED = 4,
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

function getStatusConfig(status: LotteryStatus, isClosingSoon: boolean) {
  if (isClosingSoon) {
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
        containerClass: "bg-green-950/40 border-green-500/20",
        dotClass: "bg-green-500 animate-pulse",
        textClass: "text-green-400",
      };
    case LotteryStatus.NOT_STARTED:
      return {
        label: "Not Yet Started",
        containerClass: "bg-red-950/40 border-red-500/20",
        dotClass: "bg-red-500",
        textClass: "text-red-400",
      };
    case LotteryStatus.DRAWING:
      return {
        label: "Drawing Winner",
        containerClass: "bg-red-950/40 border-red-500/20",
        dotClass: "bg-red-500 animate-pulse",
        textClass: "text-red-400",
      };
    case LotteryStatus.RESOLVED:
      return {
        label: "Lottery Resolved",
        containerClass: "bg-red-950/40 border-red-500/20",
        dotClass: "bg-red-500",
        textClass: "text-red-400",
      };
    case LotteryStatus.CLOSED:
    default:
      return {
        label: "Entries Closed",
        containerClass: "bg-red-950/40 border-red-500/20",
        dotClass: "bg-red-500",
        textClass: "text-red-400",
      };
  }
}

export default function StatusBar({ status, timeRemaining, startTime, endTime }: StatusBarProps) {
  const isOpen = status === LotteryStatus.OPEN;
  const isClosingSoon = isOpen && !!timeRemaining;
  const config = getStatusConfig(status, isClosingSoon);

  return (
    <div
      className={`flex items-center gap-4 py-3 px-4 rounded-lg border transition-all duration-500 ${config.containerClass}`}
    >
      <div className={`w-2.5 h-2.5 rounded-full ${config.dotClass}`} />

      <div className="flex flex-col">
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${config.textClass}`}>{config.label}</p>
        <p className="text-xs text-slate-400 font-medium">
          {isOpen
            ? endTime
              ? `Closes at ${formatTime(endTime)}`
              : "Closing time unknown"
            : startTime
              ? `Opens at ${formatTime(startTime)}`
              : "Opening time unknown"}
        </p>
      </div>

      <div className="ml-auto text-right">
        {isClosingSoon ? (
          <div className="flex flex-col animate-in fade-in slide-in-from-right-2">
            <span className="text-yellow-500/70 text-[9px] block uppercase font-black tracking-tighter">
              Time Remaining
            </span>
            <span className="text-yellow-500 font-mono font-black text-lg drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
              {timeRemaining}
            </span>
          </div>
        ) : (
          <div className="flex flex-col">
            <span className="text-slate-500 text-[9px] block uppercase font-bold">Next Grand Draw</span>
            <span className="text-white font-black text-sm uppercase">{endTime ? formatTime(endTime) : "TBD"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
