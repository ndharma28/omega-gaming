"use client";

import { useEffect, useMemo, useState } from "react";
import EnterForm from "./EnterForm";
import LotteryHeader from "./LotteryHeader";
import OwnerPanel from "./OwnerPanel";
import PlayersList from "./PlayersList";
import PotCard from "./PotCard";
import StatusBar, { LotteryStatus } from "./StatusBar";
import { useAccount, useReadContract } from "wagmi";
import { OMEGA_LOTTERY_ABI } from "~~/constants/abi";
import { useLottery } from "~~/hooks/useLottery";

const CONTRACT_ADDRESS = "0xf073F96E5Dd3813d16bff9E167600Bc93de20FCc";

export default function LotteryDapp() {
  const [mounted, setMounted] = useState(false);
  const { address: connectedAddress } = useAccount();

  // 1. Get the current Lottery ID from the contract counter
  // The counter starts at 1 and increments AFTER a lottery is created.
  const { data: idCounter } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "lotteryIdCounter",
    query: {
      refetchInterval: 10000, // Check for new rounds every 10s
    },
  });

  // Calculate the active ID (Counter - 1). If no lottery created yet, default to 1n.
  const activeLotteryId = useMemo(() => {
    if (!idCounter || idCounter === 0n) return 1n;
    return (idCounter as bigint) - 1n;
  }, [idCounter]);

  // 2. Hook into the Active Lottery
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
  } = useLottery(activeLotteryId);

  const [entryAmount, setEntryAmount] = useState("0.02");
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 3. Derived States
  const status = (lotteryData?.status as LotteryStatus) ?? LotteryStatus.NOT_STARTED;
  const isOpen = status === LotteryStatus.OPEN;

  // Logic to handle "Market Closed" vs "Open" display
  const minEntry = lotteryData ? Number(lotteryData.entryFee) / 1e18 : 0.01;
  const isInvalidAmount = Number(entryAmount) < minEntry || isNaN(Number(entryAmount));

  // 4. Handlers
  const handleEnter = async () => {
    try {
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
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-red-500/30">
      <LotteryHeader address={connectedAddress} />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* STATUS BAR: Global state of the current round */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <StatusBar
            status={status}
            timeRemaining={""} // You can implement a countdown timer here if desired
            startTime={lotteryData?.startTime}
            endTime={lotteryData?.endTime}
          />
        </div>

        {/* POT CARD: The main jackpot display */}
        <div className="min-h-[120px]">
          {!lotteryData ? (
            <div className="w-full h-32 bg-slate-900/40 rounded-2xl border border-slate-800 animate-pulse flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-4 w-32 bg-slate-800 rounded" />
                <div className="h-8 w-48 bg-slate-700 rounded" />
              </div>
            </div>
          ) : (
            <div className="animate-in zoom-in duration-500">
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

        {/* INTERACTION: The Entry Form */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <EnterForm
            entryAmount={entryAmount}
            setEntryAmount={setEntryAmount}
            onEnter={handleEnter}
            disabled={isJoining || isInvalidAmount || !isOpen}
            isEntering={isJoining}
            isInvalid={isInvalidAmount}
            isOpen={isOpen}
          />
        </div>

        {/* SOCIAL: List of current participants */}
        <div className="animate-in fade-in duration-1000">
          <PlayersList players={players} connectedAddress={connectedAddress} />
        </div>

        {/* ADMIN: Only visible to the contract owner */}
        {isOwner && (
          <div className="mt-12 pt-8 border-t border-slate-900">
            <OwnerPanel
              show={showOwnerPanel}
              toggle={() => setShowOwnerPanel(b => !b)}
              onPick={handlePickWinner}
              isPicking={isRequesting}
              hasPlayers={hasPlayers}
              status={status}
              treasuryBalance={treasuryBalance}
              winnerHistory={winnerHistory}
            />
          </div>
        )}

        {/* FOOTER INFO */}
        <footer className="text-center py-10">
          <p className="text-slate-600 text-[10px] uppercase tracking-[0.3em] font-bold">
            Powered by Chainlink VRF & Automation
          </p>
          <p className="text-slate-800 text-[9px] mt-2 font-mono">Contract: {CONTRACT_ADDRESS}</p>
        </footer>
      </main>
    </div>
  );
}
