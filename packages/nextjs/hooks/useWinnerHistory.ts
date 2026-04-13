// hooks/useWinnerHistory.ts
import { type Address } from "viem";
import { useReadContract, useReadContracts } from "wagmi";
import { CONTRACT_ADDRESS, LEGACY_CONTRACT_ADDRESS, OMEGA_LOTTERY_ABI } from "~~/constants/abi";

export interface WinnerEntry {
  roundId: string; // changed: "v1-3" or "v2-1" to avoid ID collisions
  winner: string;
  totalPot: bigint;
  prizeAmount: bigint;
  treasuryFee: bigint;
  startTime: bigint;
  endTime: bigint;
  contractVersion: "v1" | "v2"; // lets Chronicle page style/label them differently
}

// one contract's worth of history
function useContractHistory(address: Address, version: "v1" | "v2") {
  const { data: counterData } = useReadContract({
    address,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "lotteryIdCounter",
  });

  const totalRounds = counterData ? Number(counterData) - 1 : 0;
  const completedIds = totalRounds > 1 ? Array.from({ length: totalRounds - 1 }, (_, i) => i + 1) : [];

  const { data: lotteriesData, isLoading } = useReadContracts({
    contracts: completedIds.map(id => ({
      address,
      abi: OMEGA_LOTTERY_ABI,
      functionName: "getLottery" as const,
      args: [BigInt(id)] as const,
    })),
    query: { enabled: completedIds.length > 0 },
  });

  const { data: winnerCutData } = useReadContract({
    address,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "getWinnerCut", // reads _winnerCut — no more hardcoded 98
  });

  const winnerCut = winnerCutData ?? 90n; // fallback

  const entries: WinnerEntry[] = (lotteriesData ?? [])
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
        requestId: bigint;
        vrfRequestTime: bigint;
      };

      if (lottery.status !== 2) return null;
      if (!lottery.winner || lottery.winner === "0x0000000000000000000000000000000000000000") return null;

      const prizeAmount = (lottery.totalPot * winnerCut) / 100n;
      const treasuryFee = lottery.totalPot - prizeAmount;

      return {
        roundId: `${version}-${completedIds[i]}`, // "v1-3", "v2-1", etc.
        winner: lottery.winner,
        totalPot: lottery.totalPot,
        prizeAmount,
        treasuryFee,
        startTime: lottery.startTime,
        endTime: lottery.endTime,
        contractVersion: version,
      } satisfies WinnerEntry;
    })
    .filter((e): e is WinnerEntry => e !== null);

  return { entries, isLoading };
}

export function useWinnerHistory() {
  const legacy = useContractHistory(LEGACY_CONTRACT_ADDRESS, "v1");
  const current = useContractHistory(CONTRACT_ADDRESS, "v2");

  const winnerHistory = [...legacy.entries, ...current.entries].sort((a, b) => Number(b.endTime - a.endTime)); // newest first

  const totalFeesCollected = winnerHistory.reduce((acc, e) => acc + e.treasuryFee, 0n);

  return {
    winnerHistory,
    totalFeesCollected,
    totalRounds: winnerHistory.length,
    isLoading: legacy.isLoading || current.isLoading,
  };
}
