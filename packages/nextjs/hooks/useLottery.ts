import { useCallback, useEffect, useState } from "react";
import { CONTRACT_ADDRESS, OMEGA_LOTTERY_ABI } from "../constants/abi";
import { decodeEventLog, keccak256, parseEther, toBytes } from "viem";
import { useAccount, useBalance, usePublicClient, useReadContract, useWriteContract } from "wagmi";

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!;
const ALCHEMY_URL = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

const CONTRACT_DEPLOY_BLOCK = "0x9DC513";

// FIX 1: correct 5-param signature — was missing treasuryFee
const WINNER_PAID_TOPIC = keccak256(toBytes("WinnerPaid(uint256,address,uint256,uint256,uint256)"));

export const useLottery = (lotteryId: bigint) => {
  const { address: connectedAddress } = useAccount();
  const publicClient = usePublicClient();
  const [winnerHistory, setWinnerHistory] = useState<any[]>([]);

  // FIX 2: disable reads until lotteryId is valid (> 0n)
  const enabled = lotteryId > 0n;

  const { data: lotteryData, refetch: refetchLottery } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "getLottery",
    args: [lotteryId],
    query: { enabled },
  });

  const { data: players, refetch: refetchPlayers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "getPlayersByLotteryId",
    args: [lotteryId],
    query: { enabled },
  });

  const { data: ownerAddress, isLoading: isOwnerLoading } = useReadContract({
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
    query: {
      enabled: !!treasuryAddress && treasuryAddress !== "0x0000000000000000000000000000000000000000",
    },
  });

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

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch(ALCHEMY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getLogs",
          params: [
            {
              address: CONTRACT_ADDRESS,
              topics: [WINNER_PAID_TOPIC],
              fromBlock: CONTRACT_DEPLOY_BLOCK,
              toBlock: "latest",
            },
          ],
        }),
      });

      const json = await response.json();

      if (json.error) {
        console.warn("Alchemy getLogs error:", json.error);
        setWinnerHistory([]);
        return;
      }

      const rawLogs: any[] = json.result ?? [];

      const formattedHistory = rawLogs
        .map(log => {
          try {
            const decoded = decodeEventLog({
              abi: OMEGA_LOTTERY_ABI,
              eventName: "WinnerPaid",
              data: log.data,
              topics: log.topics,
            });
            const args = decoded.args as any;
            return {
              lotteryId: args.lotteryId,
              winnerAddress: args.winnerAddress,
              winnerPayout: args.winnerPayout,
              treasuryFee: args.treasuryFee,
              totalPot: args.totalPot,
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .reverse();

      setWinnerHistory(formattedHistory);
    } catch (error) {
      console.warn("History fetch failed:", error);
      setWinnerHistory([]);
    }
  }, []);

  const isOwner =
    !isOwnerLoading &&
    !!connectedAddress &&
    !!ownerAddress &&
    connectedAddress.toLowerCase() === (ownerAddress as string).toLowerCase();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const refetchAll = () => {
    refetchLottery();
    refetchPlayers();
  };

  return {
    lotteryData,
    players: (players as readonly string[]) || [],
    winnerHistory,
    treasuryBalance,
    isOwner,
    isOwnerLoading,
    isJoining,
    isRequesting,
    isCreating,
    joinLottery,
    refetchHistory: fetchHistory,
    refetchAll,
  };
};
