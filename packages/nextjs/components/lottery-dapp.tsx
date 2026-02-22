"use client";

import { useEffect, useState } from "react";
import EnterForm from "./EnterForm";
import LotteryHeader from "./LotteryHeader";
import OwnerPanel from "./OwnerPanel";
import PlayersList from "./PlayersList";
import PotCard from "./PotCard";
import { useAccount } from "wagmi";
import { useLottery } from "~~/hooks/useLottery";
import { useOpenHours } from "~~/hooks/useOpenHours";

export default function LotteryDapp() {
  const [mounted, setMounted] = useState(false);
  const { address: connectedAddress } = useAccount();

  // 1. Updated Destructuring: Pulling treasuryBalance from the hook!
  const {
    lotteryData,
    isOwner,
    joinLottery,
    requestWinner,
    isJoining,
    isRequesting,
    treasuryBalance, // 👉 Added here
  } = useLottery(1n);

  const { currentTime, isOpen, isClosingSoon, timeRemaining, isInitialized } = useOpenHours();

  const [entryAmount, setEntryAmount] = useState("0.02");
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use the entryFee from the contract if available, otherwise fallback to 0.01
  const minEntry = lotteryData ? Number(lotteryData.entryFee) / 1e18 : 0.01;
  const isInvalid = Number(entryAmount) < minEntry || isNaN(Number(entryAmount));

  // 2. Updated Join Logic
  const handleEnter = async () => {
    try {
      await joinLottery();
    } catch (e) {
      console.error("Join Error:", e);
    }
  };

  // 3. Updated Admin Logic (Chainlink VRF Trigger)
  const handlePickWinner = async () => {
    try {
      await requestWinner();
    } catch (e) {
      console.error("VRF Request Error:", e);
    }
  };

  // Check if there's actually money in the pot so the Owner doesn't draw an empty lottery
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
                // Accessing the totalPot from the new struct
                potBalance={lotteryData.totalPot}
                currentTime={currentTime}
                isOpen={lotteryData.status === 1} // 1 = OPEN in your Enum
                isClosingSoon={isClosingSoon}
                timeRemaining={timeRemaining}
              />
            </div>
          )}
        </div>

        <EnterForm
          entryAmount={entryAmount}
          setEntryAmount={setEntryAmount}
          onEnter={handleEnter}
          // The button is disabled if status isn't OPEN (1)
          disabled={!isInitialized || isJoining || isInvalid || lotteryData?.status !== 1}
          isEntering={isJoining}
          isInvalid={isInvalid}
          isOpen={lotteryData?.status === 1}
        />

        {/* Note: You'll need to update PlayersList to handle the players array from contract */}
        <PlayersList players={[]} connectedAddress={connectedAddress} />

        {isOwner && (
          <OwnerPanel
            show={showOwnerPanel}
            toggle={() => setShowOwnerPanel(b => !b)}
            onPick={handlePickWinner}
            isPicking={isRequesting}
            hasPlayers={hasPlayers} // 👉 Dynamically set based on the pot size
            treasuryBalance={treasuryBalance} // 👉 Passed into the panel UI!
          />
        )}
      </main>
    </div>
  );
}
