import { CONTRACT_ADDRESS, OMEGA_LOTTERY_ABI } from "../constants/abi";
import { parseEther } from "viem";
import { useAccount, useBalance, useReadContract, useWriteContract } from "wagmi";

// Winner history lives in useWinnerHistory (on-chain reads across every contract).
// The old Alchemy getLogs fetch that used to be here is removed: nothing rendered its output,
// its field names didn't match the events, and it needed a deploy block that is now stale.

export const useLottery = (lotteryId: bigint) => {
  const { address: connectedAddress } = useAccount();

  // Reads stay off until the id is valid (> 0n)
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

  // `amount` is in ETH (e.g. "0.05"), not wei.
  const joinLottery = async (amount: string) => {
    return await joinTx({
      address: CONTRACT_ADDRESS,
      abi: OMEGA_LOTTERY_ABI,
      functionName: "joinLottery",
      args: [lotteryId],
      value: parseEther(amount),
    });
  };

  const isOwner =
    !isOwnerLoading &&
    !!connectedAddress &&
    !!ownerAddress &&
    connectedAddress.toLowerCase() === (ownerAddress as string).toLowerCase();

  const refetchAll = () => {
    refetchLottery();
    refetchPlayers();
  };

  return {
    lotteryData,
    players: (players as readonly string[]) || [],
    treasuryBalance,
    isOwner,
    isOwnerLoading,
    isJoining,
    joinLottery,
    refetchAll,
  };
};
