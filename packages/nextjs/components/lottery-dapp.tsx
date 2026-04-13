"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ChronicleMysteryTeaser from "../app/chronicle/ChronicleMysteryTeaser";
import { classifyPrize } from "../app/chronicle/lib";
import { EtherConverter } from "./EtherConverter";
import OwnerPanel from "./OwnerPanel";
import PlayersList from "./PlayersList";
import PotCard from "./PotCard";
import StatusBar, { LotteryStatus } from "./StatusBar";
import { formatEther } from "viem";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, OMEGA_LOTTERY_ABI } from "~~/constants/abi";
import { useLottery } from "~~/hooks/useLottery";
import { useWinnerHistory } from "~~/hooks/useWinnerHistory";

export default function LotteryDapp() {
  const [mounted, setMounted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [entryAmount, setEntryAmount] = useState("0.02");
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);

  const { address: connectedAddress } = useAccount();
  useBalance({ address: connectedAddress });

  // ── Contract reads ────────────────────────────────────────────────────────────
  const { data: idCounter, refetch: refetchCounter } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "lotteryIdCounter",
  });

  const activeLotteryId = idCounter && (idCounter as bigint) > 0n ? (idCounter as bigint) - 1n : 1n;

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
  const { winnerHistory, isLoading } = useWinnerHistory();

  // ── Derived stats ─────────────────────────────────────────────────────────────
  const uniqueWinners = new Set(winnerHistory.map(e => e.winner)).size;
  const topPrize =
    winnerHistory.length > 0 ? Math.max(...winnerHistory.map(e => parseFloat(formatEther(e.prizeAmount)))) : 0;
  const totalDistributed = winnerHistory.reduce((acc, e) => acc + e.prizeAmount, 0n);
  const uniquePct = winnerHistory.length > 0 ? ((uniqueWinners / winnerHistory.length) * 100).toFixed(0) : "0";
  const totalsByAddress = winnerHistory.reduce(
    (acc, entry) => {
      const addr = entry.winner.toLowerCase();
      acc[addr] = (acc[addr] || 0) + parseFloat(formatEther(entry.prizeAmount));
      return acc;
    },
    {} as Record<string, number>,
  );

  // ── Polling ───────────────────────────────────────────────────────────────────
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

  // ── Countdown ─────────────────────────────────────────────────────────────────
  const status = (lotteryData?.status as LotteryStatus) ?? LotteryStatus.OPEN;
  const endTime = Number(lotteryData?.endTime ?? 0n);

  useEffect(() => {
    const calculate = () => {
      const secondsLeft = Math.max(0, endTime - Math.floor(Date.now() / 1000));
      if (secondsLeft <= 0) return setTimeRemaining("0s");
      if (secondsLeft < 60) return setTimeRemaining(`${secondsLeft}s`);
      if (secondsLeft < 3600) return setTimeRemaining(`${Math.floor(secondsLeft / 60)}m ${secondsLeft % 60}s`);
      setTimeRemaining(
        `${Math.floor(secondsLeft / 3600)}h ${Math.floor((secondsLeft % 3600) / 60)}m ${secondsLeft % 60}s`,
      );
    };
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  // ── Entry validation ──────────────────────────────────────────────────────────
  const isEntryAllowed = status === LotteryStatus.OPEN && endTime > 0 && Math.floor(Date.now() / 1000) < endTime;
  const minEntry = lotteryData ? Number(lotteryData.entryFee) / 1e18 : 0.01;
  const isInvalidAmount = Number(entryAmount) < minEntry || isNaN(Number(entryAmount));

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="og-root">
      <div className="pt-6">
        <div className="og-status-banner">
          <StatusBar status={status} timeRemaining={timeRemaining} endTime={lotteryData?.endTime} />
        </div>
      </div>

      <div className="og-hero">
        <PotCard
          lotteryId={activeLotteryId}
          potBalance={lotteryData?.totalPot ?? 0n}
          status={status}
          startTime={lotteryData?.startTime ?? 0n}
          endTime={lotteryData?.endTime ?? 0n}
          winner={lotteryData?.winner}
        />
      </div>

      <div className="og-stat-row">
        <div className="og-stat-cell">
          <div className="og-stat-label">Closed Files</div>
          <div className="og-stat-value">{winnerHistory.length > 0 ? winnerHistory.length : "—"}</div>
          <div className="og-stat-meta">the blockchain keeps copies. we don&apos;t need to.</div>
        </div>
        <div className="og-stat-cell">
          <div className="og-stat-label">Value Extracted</div>
          <div className="og-stat-value og-stat-value--green">
            {winnerHistory.length > 0 ? parseFloat(formatEther(totalDistributed)).toFixed(4) : "—"}
          </div>
          <div className="og-stat-meta">ETH moved. confirmed. gone.</div>
        </div>
        <div className="og-stat-cell">
          <div className="og-stat-label">Known Operatives</div>
          <div className="og-stat-value">{winnerHistory.length > 0 ? uniqueWinners : "—"}</div>
          <div className="og-stat-meta">
            across {winnerHistory.length > 0 ? winnerHistory.length : "—"} operations. {uniquePct}% unique winners.
          </div>
        </div>
        <div className="og-stat-cell">
          <div className="og-stat-label">Largest Extraction</div>
          <div className="og-stat-value og-stat-value--amber">{topPrize > 0 ? topPrize.toFixed(4) : "—"}</div>
          <div className="og-stat-meta">
            {topPrize > 0 ? `${classifyPrize(topPrize)}. The file is in the Archive.` : "no rounds yet"}
          </div>
        </div>
      </div>

      <div className="og-main-layout">
        <div className="og-main-left">
          <div>
            <div className="og-section-label">Let the Contract Know You Were Here</div>
            <div className="og-field-label">Amount (ETH)</div>
            <div className={`og-input-wrap${isInvalidAmount && entryAmount !== "" ? " og-input-wrap--error" : ""}`}>
              <input
                className="og-eth-input"
                type="number"
                value={entryAmount}
                min={minEntry}
                step="0.01"
                placeholder="0.02"
                onChange={e => setEntryAmount(e.target.value)}
              />
              <span className="og-input-unit">ETH</span>
            </div>
            <div className={`og-min-note${isInvalidAmount && entryAmount !== "" ? " og-min-note--error" : ""}`}>
              {`Minimum entry: ${minEntry} ETH`}
            </div>
            <EtherConverter initialEth={entryAmount} />
            <button
              className={`og-btn-enter${isJoining ? " og-btn-enter--loading" : ""}`}
              disabled={isJoining || isInvalidAmount || !isEntryAllowed}
              style={{ marginTop: "16px" }}
              onClick={() => joinLottery(entryAmount)}
            >
              {isJoining ? "Confirming..." : "Enter Lottery"}
            </button>
          </div>

          <div style={{ marginTop: "32px" }}>
            <PlayersList players={players} connectedAddress={connectedAddress} />
          </div>
        </div>

        <div className="og-main-right">
          <div className="og-chronicle-badge">Redacted Archive</div>
          <ChronicleMysteryTeaser
            winnerHistory={winnerHistory}
            isLoading={isLoading}
            totalsByAddress={totalsByAddress}
          />
          <Link href="/chronicle" className="og-chronicle-cta">
            <div>
              <div className="og-cta-sub">Claim Your Clearance</div>
              <div className="og-cta-title">The Chronicle</div>
            </div>
            <div className="og-cta-arrow">→</div>
          </Link>
        </div>
      </div>

      {isOwnerDirect && (
        <div className="og-owner-zone">
          <OwnerPanel
            show={showOwnerPanel}
            toggle={() => setShowOwnerPanel(prev => !prev)}
            treasuryBalance={treasuryBalance}
          />
        </div>
      )}
    </div>
  );
}
