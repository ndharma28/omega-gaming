import { useEffect, useMemo, useState } from "react";
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

const CONTRACT_ADDRESS = "0xf073F96E5Dd3813d16bff9E167600Bc93de20FCc";

export const useLottery = (lotteryId: bigint) => {
  const { address: connectedAddress } = useAccount();
  const publicClient = usePublicClient();

  // Local state for winner logs
  const [winnerHistory, setWinnerHistory] = useState<any[]>([]);

  // --- 1. DATA READS ---

  // Fetch specific lottery struct
  const { data: lotteryData, refetch: refetchLottery } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "getLottery",
    args: [lotteryId],
  });

  // Fetch list of player addresses
  const { data: players, refetch: refetchPlayers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "getPlayersByLotteryId",
    args: [lotteryId],
  });

  // Fetch contract owner for the Admin Panel
  const { data: ownerAddress } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "owner",
  });

  // Fetch treasury address for balance check
  const { data: treasuryAddress } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "getTreasuryAddress",
  });

  // Fetch treasury ETH balance
  const { data: treasuryBalance } = useBalance({
    address: treasuryAddress as `0x${string}`,
  });

  // --- 2. ADMIN/OWNER LOGIC ---

  // Memoized check to ensure lowercase comparison (fixes visibility issues)
  const isOwner = useMemo(() => {
    if (!connectedAddress || !ownerAddress) return false;
    return connectedAddress.toLowerCase() === (ownerAddress as string).toLowerCase();
  }, [connectedAddress, ownerAddress]);

  // --- 3. EVENT LOG FETCHING (Winner History) ---

  const fetchHistory = async () => {
    if (!publicClient) return;
    try {
      const logs = await publicClient.getContractEvents({
        address: CONTRACT_ADDRESS,
        abi: OMEGA_LOTTERY_ABI,
        eventName: "WinnerPaid",
        fromBlock: BigInt(0), // Ideally replace with your contract's deployment block
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
      console.error("Failed to fetch winner history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [publicClient]);

  // --- 4. REAL-TIME UPDATES (Event Watching) ---

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    eventName: "WinnerPaid",
    onLogs() {
      fetchHistory();
      refetchLottery();
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    eventName: "LotteryEntered",
    onLogs() {
      refetchPlayers();
      refetchLottery();
    },
  });

  // --- 5. CONTRACT WRITES ---

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

  // --- 6. EXPORTS ---

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
