"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import OwnerPanel from "./OwnerPanel";
import PlayersList from "./PlayersList";
import PotCard from "./PotCard";
import StatusBar, { LotteryStatus } from "./StatusBar";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, OMEGA_LOTTERY_ABI } from "~~/constants/abi";
import { useLottery } from "~~/hooks/useLottery";

// ── Chronicle teaser rows ─────────────────────────────────
// Static snapshot of recent winners — foreshadows the full Chronicle.
// The last row is deliberately redacted to create intrigue.
const TEASER_ROWS = [
  { num: "#185", addr: "0x3513...571f", prize: "0.0196 ETH", rank: "INITIATE", redact: false },
  { num: "#177", addr: "0xAE54...730D", prize: "0.0588 ETH", rank: "INITIATE", redact: false },
  { num: "#60", addr: "0xAE54...730D", prize: "0.0196 ETH", rank: "INITIATE", redact: false },
  { num: "#46", addr: "0x3513...571f", prize: "0.0294 ETH", rank: "INITIATE", redact: false },
  { num: "#40", addr: "——— ——— ———", prize: "0.0392 ETH", rank: "INITIATE", redact: true },
] as const;

// ── Component ─────────────────────────────────────────────
export default function LotteryDapp() {
  const [mounted, setMounted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [entryAmount, setEntryAmount] = useState("0.02");
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);

  const { address: connectedAddress } = useAccount();
  const { data: balanceData } = useBalance({ address: connectedAddress });
  const walletBalance = balanceData ? Number(balanceData.value) / 1e18 : 0;

  // ── Contract reads ──────────────────────────────────────
  const { data: idCounter, refetch: refetchCounter } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OMEGA_LOTTERY_ABI,
    functionName: "lotteryIdCounter",
  });

  const activeLotteryId =
    !idCounter || idCounter === 0n ? 1n : (idCounter as bigint) > 0n ? (idCounter as bigint) - 1n : 1n;

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

  // ── Polling ─────────────────────────────────────────────
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

  // ── Countdown ───────────────────────────────────────────
  const status = (lotteryData?.status as LotteryStatus) ?? LotteryStatus.OPEN;
  const endTime = Number(lotteryData?.endTime ?? 0n);

  useEffect(() => {
    const calculate = () => {
      const secondsLeft = Math.max(0, endTime - Math.floor(Date.now() / 1000));
      if (secondsLeft <= 0) {
        setTimeRemaining("0s");
        return;
      }
      if (secondsLeft < 60) setTimeRemaining(`${secondsLeft}s`);
      else if (secondsLeft < 3600) setTimeRemaining(`${Math.floor(secondsLeft / 60)}m ${secondsLeft % 60}s`);
      else
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

  // ── Derived ─────────────────────────────────────────────
  // Only allow entry when OPEN and the timer is still running
  const isEntryAllowed = status === LotteryStatus.OPEN && timeRemaining !== "0s" && endTime > 0;
  const minEntry = lotteryData ? Number(lotteryData.entryFee) / 1e18 : 0.01;
  const isInvalidAmount = Number(entryAmount) < minEntry || isNaN(Number(entryAmount));

  // ── Render ──────────────────────────────────────────────
  return (
    <div className="og-root">
      {/* ── Status banner — wraps the existing StatusBar component ── */}
      <div className="og-status-banner">
        <StatusBar status={status} timeRemaining={timeRemaining} endTime={lotteryData?.endTime} />
      </div>

      {/* ── Hero — PotCard owns jackpot display + epoch + winner ── */}
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

      {/* ── Stat row — Chronicle summary numbers ── */}
      <div className="og-stat-row">
        <div className="og-stat-cell">
          <div className="og-stat-label">Rounds Completed</div>
          <div className="og-stat-value">11</div>
          <div className="og-stat-meta">verified on-chain</div>
        </div>
        <div className="og-stat-cell">
          <div className="og-stat-label">Total Distributed</div>
          <div className="og-stat-value og-stat-value--green">0.3822</div>
          <div className="og-stat-meta">ETH to winners</div>
        </div>
        <div className="og-stat-cell">
          <div className="og-stat-label">Unique Winners</div>
          <div className="og-stat-value">3</div>
          <div className="og-stat-meta">27% unique</div>
        </div>
        <div className="og-stat-cell">
          <div className="og-stat-label">Record Prize</div>
          <div className="og-stat-value og-stat-value--amber">0.0588</div>
          <div className="og-stat-meta">ETH — Initiate tier</div>
        </div>
      </div>

      {/* ── Two-column main ── */}
      <div className="og-main-layout">
        {/* LEFT: entry form + players list */}
        <div className="og-main-left">
          {/* Entry form */}
          <div>
            <div className="og-section-label">Enter the Lottery</div>

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
              {isInvalidAmount && entryAmount !== ""
                ? `Minimum entry: ${minEntry} ETH`
                : `Minimum entry: ${minEntry} ETH`}
            </div>

            <button
              className={`og-btn-enter${isJoining ? " og-btn-enter--loading" : ""}`}
              disabled={isJoining || isInvalidAmount || !isEntryAllowed}
              onClick={async () => {
                await joinLottery(entryAmount);
              }}
            >
              {isJoining ? "Confirming..." : "Enter Lottery"}
            </button>
          </div>

          {/* Players list — component renders its own header + count badge */}
          <div>
            <PlayersList players={players} connectedAddress={connectedAddress} />
          </div>
        </div>

        {/* RIGHT: Chronicle teaser */}
        <div className="og-main-right">
          <div className="og-chronicle-badge">Restricted Archive</div>

          <p className="og-teaser-quote">
            A ledger of those who have walked away with the pot. Every address. Every outcome. Immutable and verifiable
            on-chain.
          </p>

          <div className="og-section-label">Recent Entries</div>

          <div className="og-mini-ledger">
            {TEASER_ROWS.map(row => (
              <div key={row.num} className="og-ledger-row">
                <div className="og-ledger-num">{row.num}</div>
                <div className={`og-ledger-addr${row.redact ? " og-ledger-addr--redacted" : ""}`}>{row.addr}</div>
                <div className="og-ledger-prize">{row.prize}</div>
                <div className="og-ledger-rank">{row.rank}</div>
              </div>
            ))}
          </div>

          <div className="og-ledger-footer">
            <span>11 entries total</span>
            <span className="og-ledger-total">0.3822 ETH paid out →</span>
          </div>

          <Link href="/chronicle" className="og-chronicle-cta">
            <div>
              <div className="og-cta-sub">Full Archive</div>
              <div className="og-cta-title">The Chronicle</div>
            </div>
            <div className="og-cta-arrow">→</div>
          </Link>
        </div>
      </div>
      {/* end og-main-layout */}

      {/* ── Owner panel — only visible to contract owner ── */}
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
