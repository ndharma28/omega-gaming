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
      refetchInterval: 5000,
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

  // 3. Fetch last VRF request ID from OmegaLottery
  const { data: lastRequestId } = useScaffoldReadContract({
    contractName: "OmegaLottery",
    functionName: "lastRequestId",
    watch: true,
  });

  // 4. Setup Write Functions
  const { writeContractAsync: joinLotteryContract, isPending: isJoining } = useScaffoldWriteContract({
    contractName: "OmegaLottery",
  });

  const { writeContractAsync: requestWinnerContract, isPending: isRequesting } = useScaffoldWriteContract({
    contractName: "OmegaLottery",
  });

  // Owner state logic
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
      await requestWinnerContract({
        functionName: "requestWinner",
        args: [lotteryId],
      });
    } catch (e) {
      console.error("Error requesting winner:", e);
    }
  };

  return {
    treasuryBalance,
    lotteryData,
    owner,
    isOwner,
    lastRequestId,
    joinLottery: handleJoin,
    requestWinner: handleRequestWinner,
    isJoining,
    isRequesting,
    status: lotteryData?.status,
  };
}
