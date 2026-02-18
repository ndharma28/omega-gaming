"use client";

import { useEffect, useState } from "react";
import EnterForm from "./EnterForm";
import LotteryHeader from "./LotteryHeader";
import OwnerPanel from "./OwnerPanel";
import PlayersList from "./PlayersList";
import PotCard from "./PotCard";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useLottery } from "~~/hooks/useLottery";
import { useOpenHours } from "~~/hooks/useOpenHours";

export default function LotteryDapp() {
  const [componentMounted, setComponentMounted] = useState(false);
  const { address: connectedAddress } = useAccount();
  const { potBalance, players, isOwner, enter, pickWinner, isEntering, isPicking } = useLottery();

  // Use the 'mounted' state from our hook to gate the UI
  const { currentTime, isOpen, isClosingSoon, timeRemaining, mounted } = useOpenHours();

  const [entryAmount, setEntryAmount] = useState("0.02");
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);

  useEffect(() => {
    setComponentMounted(true);
  }, []);

  const isInvalid = Number(entryAmount) < 0.01 || isNaN(Number(entryAmount));

  const handleEnter = async () => {
    try {
      await enter({ functionName: "enter", value: parseEther(entryAmount) });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePickWinner = async () => {
    try {
      await pickWinner({ functionName: "chooseWinner" });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-yellow-500/30">
      <LotteryHeader address={componentMounted ? connectedAddress : undefined} />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* STATUS SECTION with Skeleton Guard */}
        <div className="min-h-[80px]">
          {!mounted ? (
            // This is the Skeleton Loader: It matches the size of your PotCard/StatusBar
            <div className="w-full h-20 bg-slate-900/40 rounded-xl border border-slate-800 animate-pulse flex items-center px-6">
              <div className="w-3 h-3 rounded-full bg-slate-700 mr-4" />
              <div className="space-y-2">
                <div className="h-2 w-24 bg-slate-700 rounded" />
                <div className="h-3 w-32 bg-slate-800 rounded" />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <PotCard
                potBalance={potBalance}
                currentTime={currentTime}
                isOpen={isOpen}
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
          // Button remains disabled until the clock logic is ready
          disabled={!mounted || isEntering || isInvalid || !isOpen}
          isEntering={isEntering}
          isInvalid={isInvalid}
          isOpen={isOpen}
        />

        <PlayersList players={players} connectedAddress={connectedAddress} />

        {isOwner && (
          <OwnerPanel
            show={showOwnerPanel}
            toggle={() => setShowOwnerPanel(b => !b)}
            onPick={handlePickWinner}
            isPicking={isPicking}
            hasPlayers={!!players && players.length > 0}
          />
        )}
      </main>
    </div>
  );
}
