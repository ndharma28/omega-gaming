"use client";

import { useState } from "react";
import ChronicleHeader from "./ChronicleHeader";
import ChronicleStats from "./ChronicleStats";
import ChronicleTable from "./ChronicleTable";
import { CONTRACT_SOURCES } from "./lib";
import { useWinnerHistory } from "~~/hooks/useWinnerHistory";

export default function ChroniclePage() {
  const [activeSource, setActiveSource] = useState(0);

  const { winnerHistory, totalFeesCollected, isLoading } = useWinnerHistory(CONTRACT_SOURCES[activeSource].address);

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

        <ChronicleStats winnerHistory={winnerHistory} totalFeesCollected={totalFeesCollected} />

        {/* Era tabs — only rendered when multiple contract sources exist */}
        {CONTRACT_SOURCES.length > 1 && (
          <div className="space-y-3">
            <p className="text-[10px] text-yellow-700 uppercase tracking-widest font-bold">Contract Era</p>
            <div className="flex gap-2">
              {CONTRACT_SOURCES.map((src, i) => (
                <button
                  key={src.address}
                  onClick={() => setActiveSource(i)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    activeSource === i
                      ? "bg-yellow-900/40 border-yellow-700/50 text-yellow-300"
                      : "bg-black/40 border-yellow-900/20 text-slate-500 hover:text-slate-300 hover:border-yellow-900/40"
                  }`}
                >
                  {src.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <ChronicleTable
          winnerHistory={winnerHistory}
          totalFeesCollected={totalFeesCollected}
          isLoading={isLoading}
          activeSource={activeSource}
        />

        {/* Footer */}
        <div className="text-center space-y-4 pb-8">
          <div className="flex items-center justify-center gap-3 text-yellow-700/80 text-xs tracking-[0.4em] select-none">
            <span>◆</span>
            <span className="opacity-50">· · · · · · · · · · · · · · ·</span>
            <span>◆</span>
          </div>
          <p className="text-[10px] text-slate-500 tracking-widest uppercase">
            All outcomes determined by Chainlink VRF · Immutable · Verifiable
          </p>
        </div>
      </div>
    </main>
  );
}
