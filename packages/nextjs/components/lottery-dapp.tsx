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

  // 1. Fetch the global lottery counter to identify the latest round
  const { data: idCounter, refetch: refetchCounter } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "lotteryIdCounter",
  });

  // Calculate the most recent ID. If counter is 5, the active/last lottery is 4.
  const activeLotteryId = useMemo(() => {
    if (!idCounter || idCounter === 0n) return 1n;
    const current = idCounter as bigint;
    return current > 0n ? current - 1n : 1n;
  }, [idCounter]);

  // 2. Initialize our custom hook with the current lottery ID
  const {
    lotteryData,
    players,
    winnerHistory,
    treasuryBalance,
    isOwner,
    joinLottery,
    requestWinner,
    createNewLottery,
    isJoining,
    isRequesting,
    isCreating,
  } = useLottery(activeLotteryId);

  const [entryAmount, setEntryAmount] = useState("0.02");
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 3. Derived UI States
  const status = (lotteryData?.status as LotteryStatus) ?? LotteryStatus.NOT_STARTED;
  const isOpen = status === LotteryStatus.OPEN;

  const minEntry = lotteryData ? Number(lotteryData.entryFee) / 1e18 : 0.01;
  const isInvalidAmount = Number(entryAmount) < minEntry || isNaN(Number(entryAmount));

  // 4. Action Handlers
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

  const handleCreateNewRound = async (fee: string, start: number, end: number) => {
    try {
      await createNewLottery(fee, start, end);
      // Refresh the counter to switch the UI to the new lottery ID
      await refetchCounter();
    } catch (e) {
      console.error("Create Round Error:", e);
    }
  };

  // Prevent Hydration Mismatch for Wagmi/ConnectKit
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-red-500/30">
      <LotteryHeader address={connectedAddress} />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Status indicator for the current round */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <StatusBar
            status={status}
            timeRemaining={""} // Optional: Add countdown logic here
            startTime={lotteryData?.startTime}
            endTime={lotteryData?.endTime}
          />
        </div>

        {/* Main Jackpot Card */}
        <div className="min-h-[120px]">
          {!lotteryData ? (
            <div className="w-full h-32 bg-slate-900/40 rounded-2xl border border-slate-800 animate-pulse flex items-center justify-center">
              <div className="text-slate-600 font-medium italic">Fetching Lottery Data...</div>
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

        {/* Participation Form */}
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

        {/* Participants Table */}
        <div className="animate-in fade-in duration-1000">
          <PlayersList players={players} connectedAddress={connectedAddress} />
        </div>

        {/* Owner-Only Administrative Dashboard */}
        {/* Change the logic in lottery-dapp.tsx to this: */}
        {mounted && isOwner && (
          <div className="mt-12 pt-8 border-t border-slate-900">
            <OwnerPanel
              show={showOwnerPanel}
              toggle={() => setShowOwnerPanel(prev => !prev)}
              onPick={handlePickWinner}
              onCreate={handleCreateNewRound}
              isPicking={isRequesting}
              isCreating={isCreating}
              hasPlayers={players.length > 0}
              status={status}
              treasuryBalance={treasuryBalance}
              winnerHistory={winnerHistory}
            />
          </div>
        )}

        {/* Footer info */}
        <footer className="text-center py-10 opacity-30">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold">Verifiable Randomness via Chainlink VRF</p>
          <p className="text-[9px] mt-2 font-mono">{CONTRACT_ADDRESS}</p>
        </footer>
      </main>
    </div>
  );
}
