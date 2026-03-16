// hooks/useWinnerHistory.ts
import { type Address } from "viem";
import { useReadContract, useReadContracts } from "wagmi";
import { CONTRACT_ADDRESS, OMEGA_LOTTERY_ABI } from "~~/constants/abi";

export interface WinnerEntry {
  roundId: number;
  winner: string;
  totalPot: bigint;
  prizeAmount: bigint;
  treasuryFee: bigint;
  startTime: bigint;
  endTime: bigint;
}

export function useWinnerHistory(address: Address = CONTRACT_ADDRESS) {
  // Step 1: get total number of lotteries created
  const { data: counterData } = useReadContract({
    address,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "lotteryIdCounter",
  });

  // lotteryIdCounter is the NEXT id to be assigned, so completed rounds are 1...(counter-2)
  // (counter-1) is the currently active lottery
  const totalRounds = counterData ? Number(counterData) - 1 : 0;
  const completedIds =
    totalRounds > 1
      ? Array.from({ length: totalRounds - 1 }, (_, i) => i + 1) // [1, 2, ..., totalRounds-1]
      : [];

  // Step 2: batch-fetch all past lotteries in one multicall
  const { data: lotteriesData, isLoading } = useReadContracts({
    contracts: completedIds.map(id => ({
      address,
      abi: OMEGA_LOTTERY_ABI,
      functionName: "getLottery" as const,
      args: [BigInt(id)] as const,
    })),
    query: {
      enabled: completedIds.length > 0,
    },
  });

  // Step 3: filter to only RESOLVED rounds (status === 2) with a real winner
  const winnerHistory: WinnerEntry[] = (lotteriesData ?? [])
    .map((result, i) => {
      if (result.status !== "success" || !result.result) return null;
      const lottery = result.result as {
        id: bigint;
        entryFee: bigint;
        startTime: bigint;
        endTime: bigint;
        totalPot: bigint;
        status: number;
        winner: string;
        randomValue: bigint;
      };

      // status 2 = RESOLVED, skip zero address winners (rolled-over empty rounds)
      if (lottery.status !== 2) return null;
      if (!lottery.winner || lottery.winner === "0x0000000000000000000000000000000000000000") return null;

      const prizeAmount = (lottery.totalPot * 98n) / 100n;
      const treasuryFee = lottery.totalPot - prizeAmount;

      return {
        roundId: completedIds[i],
        winner: lottery.winner,
        totalPot: lottery.totalPot,
        prizeAmount,
        treasuryFee,
        startTime: lottery.startTime,
        endTime: lottery.endTime,
      } satisfies WinnerEntry;
    })
    .filter((e): e is WinnerEntry => e !== null);

  const totalFeesCollected = winnerHistory.reduce((acc, e) => acc + e.treasuryFee, 0n);

  return {
    winnerHistory,
    totalFeesCollected,
    totalRounds,
    isLoading,
  };
}
