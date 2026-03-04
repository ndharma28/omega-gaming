"use client";

import { useEffect, useRef, useState } from "react";
import EnterForm from "./EnterForm";
import LotteryHeader from "./LotteryHeader";
import OwnerPanel from "./OwnerPanel";
import PlayersList from "./PlayersList";
import PotCard from "./PotCard";
import StatusBar, { LotteryStatus } from "./StatusBar";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, OMEGA_LOTTERY_ABI } from "~~/constants/abi";
import { useLottery } from "~~/hooks/useLottery";

export default function LotteryDapp() {
  const [mounted, setMounted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const { address: connectedAddress } = useAccount();
  const { data: balanceData } = useBalance({ address: connectedAddress });
  const walletBalance = balanceData ? Number(balanceData.value) / 1e18 : 0;

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

  const { lotteryData, players, treasuryBalance, joinLottery, isJoining, refetchAll } = useLottery(activeLotteryId);

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

  // Default to OPEN (0) since NOT_STARTED no longer exists
  const status = (lotteryData?.status as LotteryStatus) ?? LotteryStatus.OPEN;
  const endTime = Number(lotteryData?.endTime ?? 0n);

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

  // Simplify entry logic: only enter if status is OPEN and timer is running
  const isEntryAllowed = status === LotteryStatus.OPEN && timeRemaining !== "0s" && endTime > 0;

  const minEntry = lotteryData ? Number(lotteryData.entryFee) / 1e18 : 0.01;
  const isInvalidAmount = Number(entryAmount) < minEntry || isNaN(Number(entryAmount));

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 font-sans">
      <LotteryHeader address={connectedAddress} />

      {/* Changed max-w-4xl to max-w-7xl for a wider desktop footprint */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8">
        {/* CSS Grid: 1 column on mobile, 12 columns on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12">
          {/* LEFT COLUMN (Takes up 7/12 of the screen on desktop) */}
          {/* Houses the visual state of the lottery */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            <StatusBar status={status} timeRemaining={timeRemaining} endTime={lotteryData?.endTime} />

            <PotCard
              potBalance={lotteryData?.totalPot ?? 0n}
              status={status}
              startTime={lotteryData?.startTime ?? 0n}
              endTime={lotteryData?.endTime ?? 0n}
              winner={lotteryData?.winner}
            />

            <PlayersList players={players} connectedAddress={connectedAddress} />
          </div>

          {/* RIGHT COLUMN (Takes up 5/12 of the screen on desktop) */}
          {/* Houses the interactive forms and admin panels */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <EnterForm
              entryAmount={entryAmount}
              setEntryAmount={setEntryAmount}
              onEnter={async () => {
                await joinLottery(entryAmount);
              }}
              disabled={isJoining || isInvalidAmount || !isEntryAllowed}
              isEntering={isJoining}
              isInvalid={isInvalidAmount}
              minEntry={minEntry}
              walletBalance={walletBalance}
              status={status}
            />

            {isOwnerDirect && (
              <div className="pt-6 mt-6 border-t border-slate-800/50">
                <OwnerPanel
                  show={showOwnerPanel}
                  toggle={() => setShowOwnerPanel(prev => !prev)}
                  treasuryBalance={treasuryBalance}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
