import { LotteryStatus } from "./StatusBar";
import { formatEther } from "viem";

interface PotCardProps {
  potBalance: bigint;
  status: number;
  startTime: bigint;
  endTime: bigint;
  winner?: string; // Add this line
}

export default function PotCard({ potBalance, status, startTime, endTime, winner }: PotCardProps) {
  const isResolved = status === 4; // RESOLVED status
  const isDrawing = status === 3; // DRAWING status

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">Current Jackpot</p>
          <h2 className="text-4xl font-bold text-yellow-500">
            {formatEther(potBalance)} <span className="text-xl text-slate-500">ETH</span>
          </h2>
        </div>

        <div className="text-right">
          {isResolved ? (
            <div className="animate-in zoom-in duration-500">
              <p className="text-green-400 text-xs font-bold uppercase tracking-wider">Winner Selected</p>
              <p className="text-slate-200 font-mono text-sm">
                {winner?.slice(0, 6)}...{winner?.slice(-4)}
              </p>
            </div>
          ) : isDrawing ? (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
              <p className="text-yellow-500 text-sm font-medium">Selecting Winner...</p>
            </div>
          ) : (
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Status</p>
              <p className="text-slate-200 font-medium">{status === 1 ? "Open" : "Pending"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
