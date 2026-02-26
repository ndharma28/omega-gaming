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

// Ensure this matches your most recent deployment
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

  // Calculate the active ID (Counter - 1).
  // If counter is 1, it means No lotteries have been created yet.
  const activeLotteryId = useMemo(() => {
    if (!idCounter || idCounter === 0n) return 1n;
    const current = idCounter as bigint;
    return current > 0n ? current - 1n : 1n;
  }, [idCounter]);

  // 2. Initialize the hook with the dynamic ID
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
      await refetchCounter(); // Refresh to switch to the new ID
    } catch (e) {
      console.error("Create Round Error:", e);
    }
  };

  // Prevent Hydration Mismatch
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-red-500/30">
      <LotteryHeader address={connectedAddress} />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* DEBUG PANEL (Uncomment to troubleshoot visibility) */}
        {/* <div className="bg-white/5 border border-white/10 p-2 text-[10px] font-mono rounded">
           ID: {activeLotteryId.toString()} | Owner: {String(isOwner)} | Status: {status}
        </div> 
        */}

        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <StatusBar
            status={status}
            timeRemaining={""}
            startTime={lotteryData?.startTime}
            endTime={lotteryData?.endTime}
          />
        </div>

        <div className="min-h-[120px]">
          {!lotteryData ? (
            <div className="w-full h-32 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                {activeLotteryId === 1n && idCounter === 1n ? "No Rounds Created Yet" : "Syncing Blockchain..."}
              </p>
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

        {/* OWNER DASHBOARD SECTION */}
        {/* We use 'mounted && isOwner' to ensure the client-side wallet check is final */}
        {mounted && isOwner && (
          <div className="mt-12 pt-8 border-t border-slate-900/50">
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

        <footer className="text-center py-12 opacity-20">
          <p className="text-[10px] uppercase tracking-[0.4em] font-black">Secured by Chainlink VRF</p>
          <p className="text-[9px] mt-2 font-mono">{CONTRACT_ADDRESS}</p>
        </footer>
      </main>
    </div>
  );
}
