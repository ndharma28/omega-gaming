import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export function useLottery(lotteryId: bigint = 1n) {
  const { address } = useAccount();

  const { data: lotteryContractInfo } = useDeployedContractInfo({
    contractName: "OmegaLottery",
  });

  const { data: treasuryBalance } = useBalance({
    address: lotteryContractInfo?.address,
    query: {
      refetchInterval: 5000, // Refresh every 5 seconds
    },
  });

  // 1. Fetch Lottery Data from OmegaLottery
  const { data: lotteryData } = useScaffoldReadContract({
    contractName: "OmegaLottery",
    functionName: "getLottery",
    args: [lotteryId],
    watch: true,
  });

  // 2. Fetch the Owner of the contract
  const { data: owner } = useScaffoldReadContract({
    contractName: "OmegaLottery",
    functionName: "owner",
  });

  // 3. Fetch randomness status from the RandomNumber contract
  // 👉 UPDATE "RandomNumber" to match deployedContracts.ts exactly!
  const { data: lastRequestId } = useScaffoldReadContract({
    contractName: "randomNumber",
    functionName: "lastRequestId",
    watch: true,
  });

  const { data: requestStatus } = useScaffoldReadContract({
    contractName: "randomNumber", // (Make sure this casing matches deployedContracts.ts!)
    functionName: "getRequestStatus",
    args: [lastRequestId], // <-- Simply wrap it in brackets
    watch: true,
  });

  // 4. Setup Write Functions
  const { writeContractAsync: joinLotteryContract, isPending: isJoining } = useScaffoldWriteContract({
    contractName: "OmegaLottery",
  });

  const { writeContractAsync: requestRandomness, isPending: isRequesting } = useScaffoldWriteContract({
    contractName: "randomNumber",
  });

  // Owner State logic
  const [isOwner, setIsOwner] = useState(false);
  useEffect(() => {
    if (owner && address) {
      setIsOwner(owner.toLowerCase() === address.toLowerCase());
    } else {
      setIsOwner(false);
    }
  }, [owner, address]);

  const handleJoin = async () => {
    if (!lotteryData || typeof lotteryData !== "object") {
      console.error("Lottery data not loaded");
      return;
    }

    try {
      await joinLotteryContract({
        functionName: "joinLottery",
        args: [lotteryId],
        value: lotteryData.entryFee,
      });
    } catch (e) {
      console.error("Error joining lottery:", e);
    }
  };

  const handleRequestWinner = async () => {
    try {
      await requestRandomness({
        functionName: "requestRandomWords",
        args: [false],
      });
    } catch (e) {
      console.error("Error requesting randomness:", e);
    }
  };

  return {
    treasuryBalance,
    lotteryData,
    owner,
    isOwner,
    joinLottery: handleJoin,
    requestWinner: handleRequestWinner,
    isJoining,
    isRequesting,
    randomResult: requestStatus ? requestStatus[1] : undefined,
    isRandomnessReady: requestStatus ? requestStatus[0] : false,
    status: lotteryData?.status,
  };
}
