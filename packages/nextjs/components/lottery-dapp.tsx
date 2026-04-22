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
import { formatEther, parseEther } from "viem";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, OMEGA_LOTTERY_ABI } from "~~/constants/abi";
import { useLottery } from "~~/hooks/useLottery";
import { useWinnerHistory } from "~~/hooks/useWinnerHistory";

export default function LotteryDapp() {
  const [mounted, setMounted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [ticketCount, setTicketCount] = useState("1");
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingTickets, setPendingTickets] = useState(1);

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

  // ── Entry Logic ───────────────────────────────────────────────────────────────
  const isEntryAllowed = status === LotteryStatus.OPEN && endTime > 0 && Math.floor(Date.now() / 1000) < endTime;
  const minEntryEth = lotteryData ? Number(lotteryData.entryFee) / 1e18 : 0.01;

  const handleOpenPreview = (count: number) => {
    if (count <= 0 || isNaN(count)) return;
    setPendingTickets(count);
    setShowPreview(true);
  };

  const handleConfirmEntry = () => {
    const totalAmount = (pendingTickets * minEntryEth).toFixed(18);
    joinLottery(totalAmount);
    setShowPreview(false);
  };

  const currentTotal = (Number(ticketCount) * minEntryEth).toFixed(4);
  const isInvalidCount = Number(ticketCount) <= 0 || isNaN(Number(ticketCount));

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
            across {winnerHistory.length > 0 ? winnerHistory.length : "—"} operations. {uniquePct}% unique.
          </div>
        </div>
        <div className="og-stat-cell">
          <div className="og-stat-label">Largest Extraction</div>
          <div className="og-stat-value og-stat-value--amber">{topPrize > 0 ? topPrize.toFixed(4) : "—"}</div>
          <div className="og-stat-meta">
            {topPrize > 0 ? `${classifyPrize(topPrize)}. In Archive.` : "no rounds yet"}
          </div>
        </div>
      </div>

      <div className="og-main-layout">
        <div className="og-main-left">
          <div className="og-entry-container">
            <div className="og-section-label">Deploy Entry Protocol</div>

            {/* Main Action */}
            <button
              className={`og-btn-enter og-btn-main${isJoining ? " og-btn-enter--loading" : ""}`}
              disabled={isJoining || !isEntryAllowed}
              onClick={() => handleOpenPreview(1)}
            >
              {isJoining ? "Confirming..." : "Join Lottery (1 Ticket)"}
            </button>

            {/* Quick-Grid */}
            <div className="og-entry-grid">
              <button
                className="og-btn-secondary"
                disabled={isJoining || !isEntryAllowed}
                onClick={() => handleOpenPreview(5)}
              >
                Join x5
              </button>

              <button
                className="og-btn-secondary"
                disabled={isJoining || !isEntryAllowed}
                onClick={() => handleOpenPreview(10)}
              >
                Join x10
              </button>

              <div className={`og-input-group-n${isInvalidCount ? " og-input-error" : ""}`}>
                <input
                  type="number"
                  className="og-input-n"
                  value={ticketCount}
                  onChange={e => setTicketCount(e.target.value)}
                  placeholder="N"
                />
                <button
                  className="og-btn-n"
                  disabled={isJoining || isInvalidCount || !isEntryAllowed}
                  onClick={() => handleOpenPreview(Number(ticketCount))}
                >
                  xN
                </button>
              </div>
            </div>

            <div className="og-summary-box">
              <div className="og-min-note">
                Selected: <span className="og-eth-value">{currentTotal} ETH</span>
              </div>
              <EtherConverter initialEth={currentTotal} />
            </div>
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

      {/* Transaction Preview Modal */}
      {showPreview && (
        <div className="og-modal-overlay">
          <div className="og-modal-content">
            <h3 className="og-modal-title">Confirm Extraction</h3>
            <div className="og-modal-body">
              <div className="og-modal-row">
                <span>Tickets:</span>
                <span className="white">{pendingTickets}</span>
              </div>
              <div className="og-modal-row">
                <span>Cost per Ticket:</span>
                <span className="white">{minEntryEth} ETH</span>
              </div>
              <div className="og-modal-divider"></div>
              <div className="og-modal-row og-modal-total">
                <span>Total Amount:</span>
                <span className="og-stat-value--green">{(pendingTickets * minEntryEth).toFixed(4)} ETH</span>
              </div>
            </div>
            <div className="og-modal-actions">
              <button className="og-btn-cancel" onClick={() => setShowPreview(false)}>
                Abort
              </button>
              <button className="og-btn-confirm" onClick={handleConfirmEntry}>
                Execute Transaction
              </button>
            </div>
          </div>
        </div>
      )}

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
