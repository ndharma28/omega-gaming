import { useCallback, useEffect, useMemo, useState } from "react";
import { OMEGA_LOTTERY_ABI } from "../constants/abi";
import { encodeEventTopics, keccak256, parseEther, toHex } from "viem";
import { useAccount, useBalance, usePublicClient, useReadContract, useWriteContract } from "wagmi";

const CONTRACT_ADDRESS = "0xf073F96E5Dd3813d16bff9E167600Bc93de20FCc";

// Your Alchemy API key & base URL for Sepolia
const ALCHEMY_API_KEY = "x4GRTypNvMckD7pIeZpSi";
const ALCHEMY_URL = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

// The WinnerPaid event signature topic — precomputed to avoid runtime hashing issues
// keccak256("WinnerPaid(uint256,address,uint256,uint256)")
// Replace this with the exact event signature from your ABI if it differs
const WINNER_PAID_TOPIC = keccak256(toHex("WinnerPaid(uint256,address,uint256,uint256)"));

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

  // --- ALCHEMY getLogs — no block range limit ---
  // Uses eth_getLogs via Alchemy directly, which supports fromBlock: "earliest"
  // and doesn't enforce the 1,000-block restriction that thirdweb's RPC does.
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
              fromBlock: "0x9DC513",
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

      // Decode the logs using viem's decodeEventLog
      const { decodeEventLog } = await import("viem");

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
      console.warn("History fetch failed, but owner check will proceed:", error);
      setWinnerHistory([]);
    }
  }, []);

  // OWNER CHECK
  const isOwner = useMemo(() => {
    if (!connectedAddress || !ownerAddress) return false;
    try {
      return connectedAddress.toLowerCase() === (ownerAddress as string).toLowerCase();
    } catch {
      return false;
    }
  }, [connectedAddress, ownerAddress]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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
    refetchHistory: fetchHistory,
  };
};
