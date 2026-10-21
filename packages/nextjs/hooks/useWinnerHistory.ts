import { useMemo } from "react";
import { type Address } from "viem";
import { useReadContract, useReadContracts } from "wagmi";
import {
  CONTRACT_ADDRESS,
  LEGACY_CONTRACT_ADDRESS,
  LEGACY_CONTRACT_ADDRESS2,
  LEGACY_CONTRACT_ADDRESS3,
  LEGACY_OMEGA_LOTTERY_ABI,
  OMEGA_LOTTERY_ABI,
} from "~~/constants/abi";

export interface WinnerEntry {
  roundId: number;
  winner: string;
  totalPot: bigint;
  prizeAmount: bigint;
  treasuryFee: bigint;
  startTime: bigint;
  endTime: bigint;
}

type LotteryStruct = {
  id: bigint;
  entryFee: bigint;
  startTime: bigint;
  endTime: bigint;
  totalPot: bigint;
  status: number;
  winner: string;
  randomValue: bigint;
  requestId?: bigint; // VRF-era contracts only
  vrfRequestTime?: bigint; // VRF-era contracts only
};

type SupportedAbi = typeof OMEGA_LOTTERY_ABI | typeof LEGACY_OMEGA_LOTTERY_ABI;

// Re-read finished rounds every 30s so a new winner shows up without a page reload.
const HISTORY_REFETCH_MS = 30_000;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function useContractHistory(address: Address | undefined, abi: SupportedAbi) {
  const { data: counterData, isLoading: counterLoading } = useReadContract({
    address,
    abi,
    functionName: "lotteryIdCounter",
    query: { enabled: !!address, refetchInterval: HISTORY_REFETCH_MS },
  });

  const currentId = counterData ? Number(counterData) - 1 : 0;

  // Memoized: a fresh array every render made every memo below recompute on every render.
  const allIds = useMemo(() => (currentId > 0 ? Array.from({ length: currentId }, (_, i) => i + 1) : []), [currentId]);

  const { data: lotteriesData, isLoading: lotteriesLoading } = useReadContracts({
    contracts: allIds.map(id => ({
      address: address!,
      abi,
      functionName: "getLottery" as const,
      args: [BigInt(id)] as const,
    })),
    query: { enabled: !!address && allIds.length > 0, refetchInterval: HISTORY_REFETCH_MS },
  });

  const { data: winnerCutData } = useReadContract({
    address,
    abi,
    functionName: "getWinnerCut",
    query: { enabled: !!address },
  });

  const winnerCut = winnerCutData !== undefined ? winnerCutData : 90n;

  const entries = useMemo(
    () =>
      (lotteriesData ?? [])
        .map((result, i) => {
          if (result.status !== "success" || !result.result) return null;
          const lottery = result.result as LotteryStruct;

          // Only RESOLVED rounds with a winner. Empty rollovers and refunded rounds have no winner.
          if (lottery.status !== 2) return null;
          if (!lottery.winner || lottery.winner === ZERO_ADDRESS) return null;

          const prizeAmount = (lottery.totalPot * winnerCut) / 100n;
          const treasuryFee = lottery.totalPot - prizeAmount;

          return {
            roundId: allIds[i],
            winner: lottery.winner,
            totalPot: lottery.totalPot,
            prizeAmount,
            treasuryFee,
            startTime: lottery.startTime,
            endTime: lottery.endTime,
          };
        })
        .filter((e): e is WinnerEntry => e !== null),
    [lotteriesData, winnerCut, allIds],
  );

  return { entries, isLoading: counterLoading || lotteriesLoading };
}

export function useWinnerHistory() {
  const legacy1 = useContractHistory(LEGACY_CONTRACT_ADDRESS, LEGACY_OMEGA_LOTTERY_ABI);
  const legacy2 = useContractHistory(LEGACY_CONTRACT_ADDRESS2, LEGACY_OMEGA_LOTTERY_ABI);
  const legacy3 = useContractHistory(LEGACY_CONTRACT_ADDRESS3, LEGACY_OMEGA_LOTTERY_ABI);
  const current = useContractHistory(CONTRACT_ADDRESS, OMEGA_LOTTERY_ABI);

  const allSorted = useMemo(
    () =>
      [...legacy1.entries, ...legacy2.entries, ...legacy3.entries, ...current.entries].sort((a, b) =>
        Number(a.endTime - b.endTime),
      ),
    [legacy1.entries, legacy2.entries, legacy3.entries, current.entries],
  );

  const winnerHistory: WinnerEntry[] = useMemo(
    () => allSorted.map((e, i) => ({ ...e, roundId: i + 1 })).reverse(),
    [allSorted],
  );

  const totalFeesCollected = useMemo(() => winnerHistory.reduce((acc, e) => acc + e.treasuryFee, 0n), [winnerHistory]);

  return {
    winnerHistory,
    totalFeesCollected,
    totalRounds: winnerHistory.length,
    isLoading: legacy1.isLoading || legacy2.isLoading || legacy3.isLoading || current.isLoading,
  };
}
