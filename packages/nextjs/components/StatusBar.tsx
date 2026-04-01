"use client";

export enum LotteryStatus {
  OPEN = 0,
  DRAWING = 1,
  RESOLVED = 2,
}

interface StatusBarProps {
  status: LotteryStatus;
  timeRemaining: string;
  endTime?: bigint;
}

function formatTime(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusConfig(status: LotteryStatus, isClosingSoon: boolean, isTimeExpired: boolean, endTime?: bigint) {
  if (status === LotteryStatus.OPEN && isTimeExpired) {
    return {
      label: "Awaiting Chainlink",
      subtext: "Time elapsed. VRF has been summoned. The void is responding.",
      rightLabel: "Processing",
      rightValue: "Stand by",
      containerClass: "bg-purple-900/20 border-purple-500/40",
      dotClass: "bg-purple-500 animate-pulse",
      textClass: "text-purple-400",
      rightClass: "text-purple-400",
    };
  }

  if (isClosingSoon && status === LotteryStatus.OPEN) {
    return {
      label: "Window Closing",
      subtext: "Entry period ending. The contract doesn't wait.",
      rightLabel: "Remaining",
      rightValue: null, // signals to use live countdown
      containerClass: "bg-yellow-500/10 border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.2)]",
      dotClass: "bg-yellow-500 animate-bounce",
      textClass: "text-yellow-500",
      rightClass: "text-yellow-500",
    };
  }

  switch (status) {
    case LotteryStatus.OPEN:
      return {
        label: "Window Open",
        subtext: endTime
          ? `Contract accepts entries until ${formatTime(endTime)}. No extensions.`
          : "Contract is accepting entries.",
        rightLabel: "Closes",
        rightValue: endTime ? formatTime(endTime) : "TBD",
        containerClass: "bg-green-900/20 border-green-500/40",
        dotClass: "bg-green-500 animate-pulse",
        textClass: "text-og-accent",
        rightClass: "text-white",
      };

    case LotteryStatus.DRAWING:
      return {
        label: "VRF Active",
        subtext: "Chainlink is reaching into the void. The number already exists. It's being retrieved.",
        rightLabel: "Status",
        rightValue: "Extracting",
        containerClass: "bg-orange-900/20 border-orange-500/40",
        dotClass: "bg-orange-500 animate-ping",
        textClass: "text-orange-400",
        rightClass: "text-orange-400",
      };

    case LotteryStatus.RESOLVED:
    default:
      return {
        label: "Operation Closed",
        subtext: "Extraction complete. The record has been updated. Find it in the Archive.",
        rightLabel: "Filed",
        rightValue: endTime ? formatTime(endTime) : "—",
        containerClass: "bg-og-surface border-og-border",
        dotClass: "bg-og-accent",
        textClass: "text-og-accent",
        rightClass: "text-og-dim",
      };
  }
}

export default function StatusBar({ status, timeRemaining, endTime }: StatusBarProps) {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const secondsRemaining = endTime ? Number(endTime) - currentTimestamp : null;

  const isOpen = status === LotteryStatus.OPEN;
  const isTimeExpired = isOpen && secondsRemaining !== null && secondsRemaining <= 0;
  const isClosingSoon = isOpen && !isTimeExpired && secondsRemaining !== null && secondsRemaining <= 5 * 60;

  const config = getStatusConfig(status, isClosingSoon, isTimeExpired, endTime);

  return (
    <div
      className={`flex items-center gap-4 py-3 px-4 rounded-xl border transition-all duration-500 ${config.containerClass}`}
    >
      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${config.dotClass}`} />

      <div className="flex flex-col min-w-0">
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${config.textClass}`}>{config.label}</p>
        <p className="text-xs text-og-dim font-medium mt-0.5 leading-snug">{config.subtext}</p>
      </div>

      <div className="ml-auto text-right shrink-0">
        {config.rightValue === null ? (
          // Closing soon — live countdown
          <div className="flex flex-col animate-in fade-in slide-in-from-right-2">
            <span className="text-yellow-500/70 text-[9px] block uppercase font-black tracking-tighter">Remaining</span>
            <span className="text-yellow-500 font-mono font-black text-lg drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
              {timeRemaining}
            </span>
          </div>
        ) : (
          <div className="flex flex-col">
            <span className="text-og-dim text-[9px] block uppercase font-bold tracking-widest">
              {config.rightLabel}
            </span>
            <span className={`font-black text-sm uppercase ${config.rightClass}`}>{config.rightValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}
