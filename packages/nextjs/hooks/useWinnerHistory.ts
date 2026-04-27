import { useMemo } from "react";
import { type Address } from "viem";
import { useReadContract, useReadContracts } from "wagmi";
import {
  CONTRACT_ADDRESS,
  LEGACY_CONTRACT_ADDRESS,
  LEGACY_CONTRACT_ADDRESS2,
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
  requestId: bigint;
  vrfRequestTime?: bigint;
};

type SupportedAbi = typeof OMEGA_LOTTERY_ABI | typeof LEGACY_OMEGA_LOTTERY_ABI;

function useContractHistory(address: Address | undefined, abi: SupportedAbi) {
  const { data: counterData, isLoading: counterLoading } = useReadContract({
    address,
    abi,
    functionName: "lotteryIdCounter",
    query: { enabled: !!address },
  });

  const currentId = counterData ? Number(counterData) - 1 : 0;
  const allIds = currentId > 0 ? Array.from({ length: currentId }, (_, i) => i + 1) : [];

  const { data: lotteriesData, isLoading: lotteriesLoading } = useReadContracts({
    contracts: allIds.map(id => ({
      address: address!,
      abi,
      functionName: "getLottery" as const,
      args: [BigInt(id)] as const,
    })),
    query: { enabled: !!address && allIds.length > 0 },
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

          if (lottery.status !== 2) return null;
          if (!lottery.winner || lottery.winner === "0x0000000000000000000000000000000000000000") return null;

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
  const current = useContractHistory(CONTRACT_ADDRESS, OMEGA_LOTTERY_ABI);

  const allSorted = useMemo(
    () => [...legacy1.entries, ...legacy2.entries, ...current.entries].sort((a, b) => Number(a.endTime - b.endTime)),
    [legacy1.entries, legacy2.entries, current.entries],
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
    isLoading: legacy1.isLoading || legacy2.isLoading || current.isLoading,
  };
}
