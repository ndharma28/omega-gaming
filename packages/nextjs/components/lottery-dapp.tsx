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

  const { data: idCounter, refetch: refetchCounter } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "lotteryIdCounter",
  });

  const activeLotteryId = useMemo(() => {
    if (!idCounter || idCounter === 0n) return 1n;
    return (idCounter as bigint) > 0n ? (idCounter as bigint) - 1n : 1n;
  }, [idCounter]);

  // --- INDEPENDENT OWNER CHECK (bypasses useLottery hook entirely) ---
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
    isOwner,
    isOwnerLoading,
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

  const status = (lotteryData?.status as LotteryStatus) ?? LotteryStatus.NOT_STARTED;
  const isOpen = status === LotteryStatus.OPEN;
  const minEntry = lotteryData ? Number(lotteryData.entryFee) / 1e18 : 0.01;
  const isInvalidAmount = Number(entryAmount) < minEntry || isNaN(Number(entryAmount));

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
      <LotteryHeader address={connectedAddress} />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* --- DEBUG BAR --- */}
        <div className="text-[10px] font-mono bg-red-500/10 border border-red-500/20 p-2 rounded mb-4 space-y-1">
          <div>
            hook → isOwner={String(isOwner)} | isOwnerLoading={String(isOwnerLoading)}
          </div>
          <div>
            direct → isOwnerDirect={String(isOwnerDirect)} | rawOwnerLoading={String(rawOwnerLoading)}
          </div>
          <div>rawOwnerAddress={String(rawOwnerAddress)}</div>
          <div>connectedAddress={String(connectedAddress)}</div>
        </div>

        <StatusBar
          status={status}
          timeRemaining={""}
          startTime={lotteryData?.startTime}
          endTime={lotteryData?.endTime}
        />

        <PotCard
          potBalance={lotteryData?.totalPot ?? 0n}
          status={status}
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
          disabled={isJoining || isInvalidAmount || !isOpen}
          isEntering={isJoining}
          isInvalid={isInvalidAmount}
          isOpen={isOpen}
        />

        <PlayersList players={players} connectedAddress={connectedAddress} />

        {/* Using isOwnerDirect as source of truth while debugging */}
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
              }}
              isPicking={isRequesting}
              isCreating={isCreating}
              hasPlayers={players.length > 0}
              status={status}
              treasuryBalance={treasuryBalance}
              winnerHistory={winnerHistory}
            />
          </div>
        )}
      </main>
    </div>
  );
}
