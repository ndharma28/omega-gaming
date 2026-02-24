"use client";

import { useEffect, useState } from "react";
import EnterForm from "./EnterForm";
import LotteryHeader from "./LotteryHeader";
import OwnerPanel from "./OwnerPanel";
import PlayersList from "./PlayersList";
import PotCard from "./PotCard";
import { LotteryStatus } from "./StatusBar";
import { useAccount } from "wagmi";
import { useLottery } from "~~/hooks/useLottery";
import { useOpenHours } from "~~/hooks/useOpenHours";

export default function LotteryDapp() {
  const [mounted, setMounted] = useState(false);
  const { address: connectedAddress } = useAccount();

  const { lotteryData, isOwner, joinLottery, requestWinner, isJoining, isRequesting, treasuryBalance } = useLottery(1n);

  const { currentTime, isClosingSoon, timeRemaining, isInitialized } = useOpenHours();

  const [entryAmount, setEntryAmount] = useState("0.02");
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const minEntry = lotteryData ? Number(lotteryData.entryFee) / 1e18 : 0.01;
  const isInvalid = Number(entryAmount) < minEntry || isNaN(Number(entryAmount));

  const status: LotteryStatus = lotteryData?.status ?? LotteryStatus.NOT_STARTED;
  const isOpen = status === LotteryStatus.OPEN;

  const handleEnter = async () => {
    try {
      await joinLottery();
    } catch (e) {
      console.error("Join Error:", e);
    }
  };

  const handlePickWinner = async () => {
    try {
      await requestWinner();
    } catch (e) {
      console.error("VRF Request Error:", e);
    }
  };

  const hasPlayers = (lotteryData?.totalPot ?? 0n) > 0n;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-yellow-500/30">
      <LotteryHeader address={mounted ? connectedAddress : undefined} />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="min-h-[82px]">
          {!isInitialized || !lotteryData ? (
            <div className="w-full h-[74px] bg-slate-900/40 rounded-xl border border-slate-800 animate-pulse flex items-center px-4">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700 mr-4" />
              <div className="flex-1 space-y-2">
                <div className="h-2 w-20 bg-slate-700 rounded" />
                <div className="h-3 w-32 bg-slate-800 rounded" />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <PotCard
                potBalance={lotteryData.totalPot}
                currentTime={currentTime}
                status={status}
                timeRemaining={isClosingSoon ? timeRemaining : ""}
                startTime={lotteryData.startTime}
                endTime={lotteryData.endTime}
              />
            </div>
          )}
        </div>

        <EnterForm
          entryAmount={entryAmount}
          setEntryAmount={setEntryAmount}
          onEnter={handleEnter}
          disabled={!isInitialized || isJoining || isInvalid || !isOpen}
          isEntering={isJoining}
          isInvalid={isInvalid}
          isOpen={isOpen}
        />

        <PlayersList players={[]} connectedAddress={connectedAddress} />

        {isOwner && (
          <OwnerPanel
            show={showOwnerPanel}
            toggle={() => setShowOwnerPanel(b => !b)}
            onPick={handlePickWinner}
            isPicking={isRequesting}
            hasPlayers={hasPlayers}
            status={status}
            treasuryBalance={treasuryBalance}
          />
        )}
      </main>
    </div>
  );
}
