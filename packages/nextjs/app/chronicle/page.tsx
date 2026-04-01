"use client";

import { useEffect, useRef, useState } from "react";
import ChronicleClearance from "./ChronicleClearance";
import ChronicleGate from "./ChronicleGate";
import ChronicleHeader from "./ChronicleHeader";
import ChronicleStats from "./ChronicleStats";
import ChronicleTable from "./ChronicleTable";
import { CONTRACT_SOURCES } from "./lib";
import { useAccount } from "wagmi";
import { useWinnerHistory } from "~~/hooks/useWinnerHistory";

function AdjudicationNotice({ onDismiss }: { onDismiss: () => void }) {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full border border-yellow-900/30 bg-black/60 p-8 space-y-6 backdrop-blur-sm relative">
        <span className="absolute top-3 right-3 text-[8px] text-yellow-900/25 font-mono">OL-CHRONICLE-7</span>

        <p className="text-[9px] text-yellow-600/60 uppercase tracking-[0.3em] font-black">Adjudication Notice</p>

        <div className="h-px bg-yellow-900/20" />

        <div className="space-y-3 text-[11px] text-yellow-900/60 leading-relaxed font-mono">
          <p>A determination has been made.</p>
          <p>You are cleared for access.</p>
          <p>
            The contract adjudicated your file automatically. Eighteen months of background investigation, condensed
            into one block confirmation.
          </p>
          <p>The ledger is more thorough anyway.</p>
        </div>

        <div className="h-px bg-yellow-900/20" />

        <p className="text-[9px] text-yellow-900/30 font-mono">— Office of the Ledger</p>

        <button
          onClick={onDismiss}
          className="w-full py-2 border border-yellow-900/30
                     text-[9px] text-yellow-900/50 hover:text-yellow-600/60
                     uppercase tracking-[0.3em] font-black
                     transition-colors duration-200
                     focus:outline-none"
        >
          Access Archive
        </button>
      </div>
    </main>
  );
}

type PageState = "unconnected" | "clearance" | "notice" | "chronicle";

export default function ChroniclePage() {
  const { isConnected } = useAccount();

  // wasConnectedOnMount: did wagmi rehydrate an existing session on first render?
  // We only want the clearance ceremony when the user connects *during* this visit.
  const wasConnectedOnMount = useRef<boolean | null>(null);
  const prevConnected = useRef<boolean>(false);

  const [pageState, setPageState] = useState<PageState>("unconnected");
  const [activeSource, setActiveSource] = useState(0);
  const { winnerHistory, isLoading } = useWinnerHistory(CONTRACT_SOURCES[activeSource].address);

  useEffect(() => {
    // First render — snapshot the initial connection state
    if (wasConnectedOnMount.current === null) {
      wasConnectedOnMount.current = isConnected;

      if (isConnected) {
        // Wallet was already connected when page loaded (wagmi rehydration).
        // Skip the ceremony entirely — they've already been adjudicated.
        setPageState("chronicle");
      }

      prevConnected.current = isConnected;
      return;
    }

    // Subsequent renders — look for state transitions
    const justConnected = !prevConnected.current && isConnected;
    const justDisconnected = prevConnected.current && !isConnected;

    if (justConnected) {
      const seen = sessionStorage.getItem("chronicle-clearance-seen");
      if (seen) {
        // Already ran ceremony this session (e.g. disconnected and reconnected)
        setPageState("chronicle");
      } else {
        // Fresh connection this session — run the full clearance sequence
        setPageState("clearance");
      }
    }

    if (justDisconnected) {
      setPageState("unconnected");
    }

    prevConnected.current = isConnected;
  }, [isConnected]);

  if (pageState === "unconnected") return <ChronicleGate />;

  if (pageState === "clearance") {
    return (
      <ChronicleClearance
        onComplete={() => {
          sessionStorage.setItem("chronicle-clearance-seen", "true");
          setPageState("notice");
        }}
      />
    );
  }

  if (pageState === "notice") {
    return <AdjudicationNotice onDismiss={() => setPageState("chronicle")} />;
  }

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(202,138,4,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(202,138,4,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(120,80,0,0.2)_0%,transparent_70%)]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 space-y-16">
        <ChronicleHeader />
        <ChronicleStats winnerHistory={winnerHistory} />

        {CONTRACT_SOURCES.length > 1 && (
          <div className="space-y-3">
            <p className="chronicle-label">Contract Era</p>
            <div className="flex gap-2">
              {CONTRACT_SOURCES.map((src, i) => (
                <button
                  key={src.address}
                  onClick={() => setActiveSource(i)}
                  className={`chronicle-btn-secondary ${
                    activeSource === i ? "chronicle-btn-secondary-active" : "chronicle-btn-secondary-inactive"
                  }`}
                >
                  {src.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <ChronicleTable winnerHistory={winnerHistory} isLoading={isLoading} activeSource={activeSource} />

        <div className="text-center space-y-4 pb-8">
          <div className="flex items-center justify-center gap-3 text-yellow-700/80 text-xs tracking-[0.4em] select-none">
            <span>◆</span>
            <span className="opacity-50">· · · · · · · · · · · · · · ·</span>
            <span>◆</span>
          </div>
          <p className="text-[10px] text-yellow-600/90 tracking-widest uppercase">
            Chainlink VRF reached into the void and pulled out a number that was already there. Pre-ordained by math,
            not by men. Which, in my experience, is the only kind of fair that actually holds up. Immutable. Verifiable.
            Unimpeachable. File your complaints with the blockchain. It doesn&apos;t read them.
          </p>
        </div>
      </div>
    </main>
  );
}
