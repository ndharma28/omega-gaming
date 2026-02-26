import { useEffect, useState } from "react";
import { OMEGA_LOTTERY_ABI } from "../constants/abi";
import { parseEther } from "viem";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useReadContract,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";

export const useLottery = (lotteryId: bigint) => {
  const { address: connectedAddress } = useAccount();
  const publicClient = usePublicClient();
  const [winnerHistory, setWinnerHistory] = useState<any[]>([]);

  const contractConfig = {
    address: "0xf073F96E5Dd3813d16bff9E167600Bc93de20FCc" as `0x${string}`,
    abi: OMEGA_LOTTERY_ABI,
  };

  // 1. MAIN LOTTERY DATA
  const { data: lotteryData, refetch: refetchLottery } = useReadContract({
    ...contractConfig,
    functionName: "getLottery",
    args: [lotteryId],
  });

  // 2. PLAYERS
  const { data: players, refetch: refetchPlayers } = useReadContract({
    ...contractConfig,
    functionName: "getPlayersByLotteryId",
    args: [lotteryId],
  });

  // 3. TREASURY & OWNER
  const { data: treasuryAddress } = useReadContract({ ...contractConfig, functionName: "getTreasuryAddress" });
  const { data: ownerAddress } = useReadContract({ ...contractConfig, functionName: "owner" });

  const { data: treasuryBalance } = useBalance({
    address: treasuryAddress,
  });

  // 4. HISTORICAL WINNERS (Fetching Logs)
  const fetchHistory = async () => {
    if (!publicClient) return;
    try {
      const logs = await publicClient.getContractEvents({
        ...contractConfig,
        eventName: "WinnerPaid",
        fromBlock: BigInt(0), // Ideally use the block number where contract was deployed
      });

      // Map logs to match the WinnerHistoryItem interface in OwnerPanel
      const formattedHistory = logs
        .map((log: any) => ({
          lotteryId: log.args.lotteryId,
          winnerAddress: log.args.winnerAddress,
          winnerPayout: log.args.winnerPayout,
          totalPot: log.args.totalPot,
        }))
        .reverse(); // Newest first

      setWinnerHistory(formattedHistory);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [publicClient]);

  // 5. REAL-TIME EVENT WATCHING
  useWatchContractEvent({
    ...contractConfig,
    eventName: "WinnerPaid",
    onLogs() {
      fetchHistory(); // Refresh history list
      refetchLottery(); // Update status to RESOLVED
    },
  });

  useWatchContractEvent({
    ...contractConfig,
    eventName: "LotteryEntered",
    onLogs() {
      refetchPlayers();
      refetchLottery();
    },
  });

  // 6. CONTRACT ACTIONS
  const { writeContractAsync: joinTx, isPending: isJoining } = useWriteContract();
  const { writeContractAsync: requestTx, isPending: isRequesting } = useWriteContract();

  return {
    lotteryData,
    players: players || [],
    winnerHistory,
    treasuryBalance,
    isJoining,
    isRequesting,
    isOwner: connectedAddress?.toLowerCase() === ownerAddress?.toLowerCase(),
    joinLottery: (amount: string) =>
      joinTx({ ...contractConfig, functionName: "joinLottery", args: [lotteryId], value: parseEther(amount) }),
    requestWinner: () => requestTx({ ...contractConfig, functionName: "requestWinner", args: [lotteryId] }),
  };
};
