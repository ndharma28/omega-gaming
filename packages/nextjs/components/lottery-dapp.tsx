"use client";

import { useEffect, useRef, useState } from "react";
import EnterForm from "./EnterForm";
import LotteryHeader from "./LotteryHeader";
import OwnerPanel from "./OwnerPanel";
import PlayersList from "./PlayersList";
import PotCard from "./PotCard";
import StatusBar, { LotteryStatus } from "./StatusBar";
import { useAccount, useReadContract } from "wagmi";
import { OMEGA_LOTTERY_ABI } from "~~/constants/abi";
import { useLottery } from "~~/hooks/useLottery";

const CONTRACT_ADDRESS = "0x256aA1F20fEFd5d8E8A4Eab916af17A36323eC97";

export default function LotteryDapp() {
  const [mounted, setMounted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const { address: connectedAddress } = useAccount();

  const { data: idCounter, refetch: refetchCounter } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "lotteryIdCounter",
  });

  const activeLotteryId =
    !idCounter || idCounter === 0n ? 1n : (idCounter as bigint) > 0n ? (idCounter as bigint) - 1n : 1n;

  const { data: rawOwnerAddress, isLoading: rawOwnerLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "owner",
  });

  const isOwnerDirect =
    !rawOwnerLoading &&
    !!connectedAddress &&
    !!rawOwnerAddress &&
    connectedAddress.toLowerCase() === (rawOwnerAddress as string).toLowerCase();

  const {
    lotteryData,
    players,
    winnerHistory,
    treasuryBalance,
    joinLottery,
    requestWinner,
    createNewLottery,
    isJoining,
    isRequesting,
    isCreating,
    refetchAll,
  } = useLottery(activeLotteryId);

  const [entryAmount, setEntryAmount] = useState("0.02");
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const refetchAllRef = useRef(refetchAll);
  useEffect(() => {
    refetchAllRef.current = refetchAll;
  }, [refetchAll]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetchAllRef.current();
      refetchCounter();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetchCounter]);

  const status = (lotteryData?.status as LotteryStatus) ?? LotteryStatus.NOT_STARTED;
  const startTime = Number(lotteryData?.startTime ?? 0n);
  const endTime = Number(lotteryData?.endTime ?? 0n);

  // 1-second countdown timer
  useEffect(() => {
    const calculate = () => {
      const secondsLeft = Math.max(0, endTime - Math.floor(Date.now() / 1000));
      if (secondsLeft <= 0) {
        setTimeRemaining("0s");
        return;
      }
      if (secondsLeft < 60) {
        setTimeRemaining(`${secondsLeft}s`);
      } else if (secondsLeft < 3600) {
        setTimeRemaining(`${Math.floor(secondsLeft / 60)}m ${secondsLeft % 60}s`);
      } else {
        setTimeRemaining(
          `${Math.floor(secondsLeft / 3600)}h ${Math.floor((secondsLeft % 3600) / 60)}m ${secondsLeft % 60}s`,
        );
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const displayStatus = timeRemaining === "0s" && status === LotteryStatus.OPEN ? LotteryStatus.CLOSED : status;

  const isOpen = displayStatus === LotteryStatus.OPEN;
  const isEntryAllowed =
    (status === LotteryStatus.NOT_STARTED || status === LotteryStatus.OPEN) &&
    timeRemaining !== "0s" &&
    endTime > 0 &&
    Math.floor(Date.now() / 1000) >= startTime;

  const minEntry = lotteryData ? Number(lotteryData.entryFee) / 1e18 : 0.01;
  const isInvalidAmount = Number(entryAmount) < minEntry || isNaN(Number(entryAmount));

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
      <LotteryHeader address={connectedAddress} />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <StatusBar
          status={displayStatus}
          timeRemaining={timeRemaining}
          startTime={lotteryData?.startTime}
          endTime={lotteryData?.endTime}
        />

        <PotCard
          potBalance={lotteryData?.totalPot ?? 0n}
          status={displayStatus}
          startTime={lotteryData?.startTime ?? 0n}
          endTime={lotteryData?.endTime ?? 0n}
          winner={lotteryData?.winner}
        />

        <EnterForm
          entryAmount={entryAmount}
          setEntryAmount={setEntryAmount}
          onEnter={async () => {
            await joinLottery(entryAmount);
          }}
          disabled={isJoining || isInvalidAmount || !isEntryAllowed}
          isEntering={isJoining}
          isInvalid={isInvalidAmount}
          isOpen={isOpen}
          minEntry={minEntry}
          status={displayStatus}
        />

        <PlayersList players={players} connectedAddress={connectedAddress} />

        {isOwnerDirect && (
          <div className="mt-12 pt-8 border-t border-slate-900/50">
            <OwnerPanel
              show={showOwnerPanel}
              toggle={() => setShowOwnerPanel(prev => !prev)}
              onPick={async () => {
                await requestWinner();
              }}
              onCreate={async (f, s, e) => {
                await createNewLottery(f, s, e);
                refetchCounter();
                refetchAll();
              }}
              isPicking={isRequesting}
              isCreating={isCreating}
              status={displayStatus}
              treasuryBalance={treasuryBalance}
              winnerHistory={winnerHistory}
            />
          </div>
        )}
      </main>
    </div>
  );
}
