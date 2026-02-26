"use client";

import { useEffect, useState } from "react";
import EnterForm from "./EnterForm";
import LotteryHeader from "./LotteryHeader";
import OwnerPanel from "./OwnerPanel";
import PlayersList from "./PlayersList";
import PotCard from "./PotCard";
import { LotteryStatus } from "./StatusBar";
import { useAccount } from "wagmi";
// Ensure this matches 0-4 enums
import { useLottery } from "~~/hooks/useLottery";

export default function LotteryDapp() {
  const [mounted, setMounted] = useState(false);
  const { address: connectedAddress } = useAccount();

  // Passing 1n as the default lottery ID
  const {
    lotteryData,
    players,
    winnerHistory,
    treasuryBalance,
    isOwner,
    joinLottery,
    requestWinner,
    isJoining,
    isRequesting,
  } = useLottery(1n);

  const [entryAmount, setEntryAmount] = useState("0.02");
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Derived States from Contract
  const status = lotteryData?.status ?? LotteryStatus.NOT_STARTED;
  const isOpen = status === LotteryStatus.OPEN;

  // Calculate if the entry fee is valid based on contract requirement
  const minEntry = lotteryData ? Number(lotteryData.entryFee) / 1e18 : 0.01;
  const isInvalidAmount = Number(entryAmount) < minEntry || isNaN(Number(entryAmount));

  const handleEnter = async () => {
    try {
      // Now passing the entryAmount state to the hook
      await joinLottery(entryAmount);
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

  const hasPlayers = players.length > 0;

  // Prevent Hydration Mismatch
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-yellow-500/30">
      <LotteryHeader address={connectedAddress} />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="min-h-[82px]">
          {!lotteryData ? (
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
                status={status}
                startTime={lotteryData.startTime}
                endTime={lotteryData.endTime}
                winner={lotteryData.winner}
              />
            </div>
          )}
        </div>

        <EnterForm
          entryAmount={entryAmount}
          setEntryAmount={setEntryAmount}
          onEnter={handleEnter}
          disabled={isJoining || isInvalidAmount || !isOpen}
          isEntering={isJoining}
          isInvalid={isInvalidAmount}
          isOpen={isOpen}
        />

        <PlayersList players={players} connectedAddress={connectedAddress} />

        {isOwner && (
          <OwnerPanel
            show={showOwnerPanel}
            toggle={() => setShowOwnerPanel(b => !b)}
            onPick={handlePickWinner}
            isPicking={isRequesting}
            hasPlayers={players.length > 0}
            status={status}
            treasuryBalance={treasuryBalance}
            winnerHistory={winnerHistory}
          />
        )}
      </main>
    </div>
  );
}
