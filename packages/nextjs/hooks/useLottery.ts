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

  // --- UPDATED HISTORY FETCHING ---
  const fetchHistory = async () => {
    if (!publicClient) return;
    try {
      // Get the latest block and look back only 5,000 blocks
      // This stays well within Alchemy's 10,000 block limit
      const latestBlock = await publicClient.getBlockNumber();
      const fromBlock = latestBlock > 5000n ? latestBlock - 5000n : 0n;

      const logs = await publicClient.getContractEvents({
        address: CONTRACT_ADDRESS,
        abi: OMEGA_LOTTERY_ABI,
        eventName: "WinnerPaid",
        fromBlock: fromBlock,
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
      // We catch the error here so the rest of the hook keeps working!
      console.warn("History fetch failed, but owner check will proceed:", error);
      setWinnerHistory([]);
    }
  };

  // --- ENSURE OWNER CHECK IS INDEPENDENT ---
  const isOwner = useMemo(() => {
    if (!connectedAddress || !ownerAddress) return false;
    // Standardizing to checksum addresses to prevent mismatch
    try {
      return connectedAddress.toLowerCase() === (ownerAddress as string).toLowerCase();
    } catch {
      return false;
    }
  }, [connectedAddress, ownerAddress]);

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
