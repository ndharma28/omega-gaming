import { useEffect, useMemo, useState } from "react";
// Added useMemo
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

  const { data: lotteryData, refetch: refetchLottery } = useReadContract({
    ...contractConfig,
    functionName: "getLottery",
    args: [lotteryId],
  });

  const { data: players, refetch: refetchPlayers } = useReadContract({
    ...contractConfig,
    functionName: "getPlayersByLotteryId",
    args: [lotteryId],
  });

  const { data: treasuryAddress } = useReadContract({ ...contractConfig, functionName: "getTreasuryAddress" });

  // 1. Explicitly cast the return type to string to avoid comparison errors
  const { data: ownerAddress } = useReadContract({
    ...contractConfig,
    functionName: "owner",
  }) as { data: `0x${string}` | undefined };

  const { data: treasuryBalance } = useBalance({
    address: treasuryAddress,
  });

  // 2. Wrap the owner check in useMemo
  const isOwner = useMemo(() => {
    if (!connectedAddress || !ownerAddress) return false;
    return connectedAddress.toLowerCase() === ownerAddress.toLowerCase();
  }, [connectedAddress, ownerAddress]);

  const fetchHistory = async () => {
    if (!publicClient) return;
    try {
      const logs = await publicClient.getContractEvents({
        ...contractConfig,
        eventName: "WinnerPaid",
        fromBlock: BigInt(0),
      });

      const formattedHistory = logs
        .map((log: any) => ({
          lotteryId: log.args.lotteryId,
          winnerAddress: log.args.winnerAddress,
          winnerPayout: log.args.winnerPayout,
          totalPot: log.args.totalPot,
        }))
        .reverse();

      setWinnerHistory(formattedHistory);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [publicClient]);

  useWatchContractEvent({
    ...contractConfig,
    eventName: "WinnerPaid",
    onLogs() {
      fetchHistory();
      refetchLottery();
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

  const { writeContractAsync: joinTx, isPending: isJoining } = useWriteContract();
  const { writeContractAsync: requestTx, isPending: isRequesting } = useWriteContract();

  return {
    lotteryData,
    players: players || [],
    winnerHistory,
    treasuryBalance,
    isJoining,
    isRequesting,
    isOwner, // Return the memoized value
    joinLottery: (amount: string) =>
      joinTx({ ...contractConfig, functionName: "joinLottery", args: [lotteryId], value: parseEther(amount) }),
    requestWinner: () => requestTx({ ...contractConfig, functionName: "requestWinner", args: [lotteryId] }),
  };
};
