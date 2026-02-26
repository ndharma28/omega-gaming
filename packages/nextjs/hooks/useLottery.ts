import { useEffect, useMemo, useState } from "react";
// Added getAddress
import { OMEGA_LOTTERY_ABI } from "../constants/abi";
import { getAddress, parseEther } from "viem";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useReadContract,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";

const CONTRACT_ADDRESS = "0xf073F96E5Dd3813d16bff9E167600Bc93de20FCc";

export const useLottery = (lotteryId: bigint) => {
  const { address: connectedAddress } = useAccount();
  const publicClient = usePublicClient();
  const [winnerHistory, setWinnerHistory] = useState<any[]>([]);

  // READS
  const { data: lotteryData, refetch: refetchLottery } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "getLottery",
    args: [lotteryId],
  });

  const { data: players, refetch: refetchPlayers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "getPlayersByLotteryId",
    args: [lotteryId],
  });

  const { data: ownerAddress } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "owner",
  });

  const { data: treasuryAddress } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "getTreasuryAddress",
  });

  const { data: treasuryBalance } = useBalance({
    address: treasuryAddress as `0x${string}`,
  });

  // --- THE FIX: Robust Owner Comparison ---
  const isOwner = useMemo(() => {
    if (!connectedAddress || !ownerAddress) return false;

    const wallet = getAddress(connectedAddress);
    const contractOwner = getAddress(ownerAddress as string);

    return wallet === contractOwner;
  }, [connectedAddress, ownerAddress]);

  // WRITES
  const { writeContractAsync: joinTx, isPending: isJoining } = useWriteContract();
  const { writeContractAsync: requestTx, isPending: isRequesting } = useWriteContract();
  const { writeContractAsync: createTx, isPending: isCreating } = useWriteContract();

  const joinLottery = async (amount: string) => {
    return await joinTx({
      address: CONTRACT_ADDRESS,
      abi: OMEGA_LOTTERY_ABI,
      functionName: "joinLottery",
      args: [lotteryId],
      value: parseEther(amount),
    });
  };

  const requestWinner = async () => {
    return await requestTx({
      address: CONTRACT_ADDRESS,
      abi: OMEGA_LOTTERY_ABI,
      functionName: "requestWinner",
      args: [lotteryId],
    });
  };

  const createNewLottery = async (fee: string, start: number, end: number) => {
    return await createTx({
      address: CONTRACT_ADDRESS,
      abi: OMEGA_LOTTERY_ABI,
      functionName: "createLottery",
      args: [parseEther(fee), BigInt(start), BigInt(end)],
    });
  };

  // Event History Fetching...
  const fetchHistory = async () => {
    if (!publicClient) return;
    try {
      // Try to get a more recent block to start from
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock - 9000n; // Only scan the last 9k blocks to stay under limits

      const logs = await publicClient.getContractEvents({
        address: CONTRACT_ADDRESS,
        abi: OMEGA_LOTTERY_ABI,
        eventName: "WinnerPaid",
        fromBlock: fromBlock > 0n ? fromBlock : 0n,
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
      // Crucial: Log the error but DON'T let it stop the hook
      console.warn("History fetch failed (RPC Limit), using empty history for now:", error);
      setWinnerHistory([]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [publicClient]);

  return {
    lotteryData,
    players: (players as readonly string[]) || [],
    winnerHistory,
    treasuryBalance,
    isOwner,
    isJoining,
    isRequesting,
    isCreating,
    joinLottery,
    requestWinner,
    createNewLottery,
  };
};
