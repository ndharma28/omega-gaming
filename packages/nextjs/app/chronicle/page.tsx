"use client";

import { useState } from "react";
import ChronicleHeader from "./ChronicleHeader";
import ChronicleStats from "./ChronicleStats";
import ChronicleTable from "./ChronicleTable";
import { CONTRACT_SOURCES } from "./lib";
import { useWinnerHistory } from "~~/hooks/useWinnerHistory";

export default function ChroniclePage() {
  const [activeSource, setActiveSource] = useState(0);

  const { winnerHistory, isLoading } = useWinnerHistory(CONTRACT_SOURCES[activeSource].address);

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Ambient background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(202,138,4,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(202,138,4,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(120,80,0,0.2)_0%,transparent_70%)]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 space-y-16">
        <ChronicleHeader />

        <ChronicleStats winnerHistory={winnerHistory} />

        {/* Era tabs — only rendered when multiple contract sources exist */}
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

        {/* Footer */}
        <div className="text-center space-y-4 pb-8">
          <div className="flex items-center justify-center gap-3 text-yellow-700/80 text-xs tracking-[0.4em] select-none">
            <span>◆</span>
            <span className="opacity-50">· · · · · · · · · · · · · · ·</span>
            <span>◆</span>
          </div>
          <p className="text-[10px] text-yellow-600/90 tracking-widest uppercase">
            Chainlink VRF reached into the void and pulled out a number that was already there. Pre-ordained by math,
            not by men. Which, in my experience, is the only kind of fair that actually holds up. Immutable. Verifiable.
            Unimpeachable. File your complaints with the blockchain. {"It doesn't read them"}.
          </p>
        </div>
      </div>
    </main>
  );
}
