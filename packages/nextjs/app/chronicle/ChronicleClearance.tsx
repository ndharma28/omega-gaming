"use client";

import { useEffect, useRef, useState } from "react";

const CLEARANCE_PHRASES = [
  "Establishing secure channel...",
  "Cross-referencing wallet against the ledger...",
  "Consulting the blockchain. It remembers everything...",
  "Verifying transaction history. This always takes longer than it should...",
  "Corroborating on-chain record. Math doesn't lie...",
  "Adjudicating clearance level. Almost there...",
];

const CLEARANCE_LEVELS = ["UNVERIFIED", "SPARK", "INITIATE", "ASCENDANT", "CLASSIFIED"];

interface ChronicleClearanceProps {
  onComplete: () => void;
}

function ClearanceProgressBar({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [levelIndex, setLevelIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phraseRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const levelRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const DURATION = 5000;
  const TICK = 50;

  useEffect(() => {
    const steps = DURATION / TICK;
    let current = 0;

    intervalRef.current = setInterval(() => {
      current += 1;
      const t = current / steps;

      // Same heavy ease-out pattern from AddressChronicle — fast start, crawls, final push
      let eased: number;
      if (t < 0.6) {
        eased = Math.round((1 - Math.pow(1 - t / 0.6, 3)) * 70);
      } else if (t < 0.85) {
        eased = Math.round(70 + ((t - 0.6) / 0.25) * 18);
      } else {
        eased = Math.round(88 + ((t - 0.85) / 0.15) * 12);
      }
      eased = Math.min(100, eased);
      setProgress(eased);

      if (current >= steps) {
        clearInterval(intervalRef.current!);
        setTimeout(onComplete, 400);
      }
    }, TICK);

    // Cycle through scan phrases
    phraseRef.current = setInterval(() => {
      setPhraseIndex(i => (i + 1) % CLEARANCE_PHRASES.length);
    }, DURATION / CLEARANCE_PHRASES.length);

    // Cycle through clearance levels — creates the feeling of escalating access
    levelRef.current = setInterval(() => {
      setLevelIndex(i => Math.min(i + 1, CLEARANCE_LEVELS.length - 1));
    }, DURATION / CLEARANCE_LEVELS.length);

    return () => {
      clearInterval(intervalRef.current!);
      clearInterval(phraseRef.current!);
      clearInterval(levelRef.current!);
    };
  }, [onComplete]);

  const currentLevel = CLEARANCE_LEVELS[levelIndex];
  const isClassified = currentLevel === "CLASSIFIED";

  return (
    <div className="space-y-6 w-full">
      {/* Status readout — updates as progress advances */}
      <div className="flex justify-between items-center">
        <span className="text-[9px] text-yellow-900/50 uppercase tracking-widest font-black">Current Status</span>
        <span
          className={`text-[9px] uppercase tracking-widest font-black transition-colors duration-500 ${
            isClassified ? "text-yellow-500/80" : "text-red-500/60 animate-pulse"
          }`}
        >
          {currentLevel}
        </span>
      </div>

      {/* Phrase */}
      <div className="flex justify-between items-center">
        <span className="text-[9px] text-yellow-700/50 uppercase tracking-widest font-black animate-pulse">
          {CLEARANCE_PHRASES[phraseIndex]}
        </span>
        <span className="text-[9px] text-yellow-900/40 font-mono">{progress}%</span>
      </div>

      {/* Progress track */}
      <div className="relative h-1 bg-yellow-900/15 rounded-full overflow-hidden">
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 bg-yellow-600/60 rounded-full transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
        {/* Shimmer */}
        <div
          className="absolute inset-y-0 w-16 bg-linear-to-r from-transparent via-yellow-400/30 to-transparent rounded-full"
          style={{
            left: `calc(${progress}% - 4rem)`,
            transition: "left 75ms linear",
          }}
        />
      </div>

      {/* Tick marks */}
      <div className="flex justify-between px-0.5">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`w-px h-1 rounded-full transition-colors duration-300 ${
              (i / 11) * 100 <= progress ? "bg-yellow-700/60" : "bg-yellow-900/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChronicleClearance({ onComplete }: ChronicleClearanceProps) {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center px-4">
      {/* Ambient grid — matches Chronicle page */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(202,138,4,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(202,138,4,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(120,80,0,0.2)_0%,transparent_70%)]" />

      <div className="relative z-10 max-w-md w-full space-y-8">
        {/* Top stamp */}
        <div className="text-center space-y-3">
          <p className="text-[9px] text-yellow-900/50 uppercase tracking-[0.35em] font-black">
            Omega Gaming · Office of the Ledger
          </p>
          <div className="flex items-center gap-3 justify-center">
            <div className="h-px flex-1 bg-yellow-900/20" />
            <span className="text-yellow-900/25 text-xs font-mono tracking-widest">████████████</span>
            <div className="h-px flex-1 bg-yellow-900/20" />
          </div>
        </div>

        {/* Main card */}
        <div className="border border-yellow-900/30 bg-black/60 p-8 space-y-8 relative backdrop-blur-sm">
          {/* Corner stamps */}
          <span className="absolute top-3 right-3 text-[8px] text-red-900/50 font-black uppercase tracking-widest">
            In Progress
          </span>
          <span className="absolute bottom-3 left-3 text-[8px] text-yellow-900/25 font-mono">OL-CHRONICLE-7</span>

          {/* Title */}
          <div className="space-y-2">
            <p className="text-[9px] text-yellow-600/60 uppercase tracking-[0.3em] font-black">
              Adjudication In Progress
            </p>
            <h1 className="text-3xl font-black text-yellow-500/90 uppercase tracking-widest leading-tight">
              Clearance
              <br />
              Processing
            </h1>
          </div>

          <div className="h-px bg-yellow-900/20" />

          {/* Body copy */}
          <div className="space-y-2 text-[11px] text-yellow-900/55 leading-relaxed font-mono">
            <p>Identity confirmed. Running adjudication.</p>
            <p>The ledger is being consulted. This process cannot be expedited. It was not designed to be.</p>
          </div>

          <div className="h-px bg-yellow-900/20" />

          {/* Progress bar */}
          <ClearanceProgressBar onComplete={onComplete} />

          <p className="text-[9px] text-yellow-900/30 text-center font-mono pt-2">— Office of the Ledger</p>
        </div>

        {/* Bottom note */}
        <p className="text-center text-[8px] text-yellow-900/20 uppercase tracking-widest font-black leading-relaxed">
          Do not close this window.
          <br />
          The ledger does not save progress.
        </p>
      </div>
    </main>
  );
}
