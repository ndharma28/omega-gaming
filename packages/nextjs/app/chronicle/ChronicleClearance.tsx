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

const LEVEL_COLORS: Record<string, string> = {
  UNVERIFIED: "text-red-500",
  SPARK: "text-slate-600",
  INITIATE: "text-slate-400",
  ASCENDANT: "text-orange-500",
  CLASSIFIED: "text-yellow-400",
};

interface ChronicleClearanceProps {
  onComplete: () => void;
}

function ClearanceProgressBar({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [levelIndex, setLevelIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phraseRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const levelRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const DURATION = 6000;
  const TICK = 50;

  useEffect(() => {
    const steps = DURATION / TICK;
    let current = 0;

    intervalRef.current = setInterval(() => {
      current += 1;
      const t = current / steps;

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
        clearInterval(phraseRef.current!);
        clearInterval(levelRef.current!);
        // Lock level to CLASSIFIED and show the button
        setLevelIndex(CLEARANCE_LEVELS.length - 1);
        setTimeout(() => setFinished(true), 400);
      }
    }, TICK);

    phraseRef.current = setInterval(() => {
      setPhraseIndex(i => (i + 1) % CLEARANCE_PHRASES.length);
    }, DURATION / CLEARANCE_PHRASES.length);

    levelRef.current = setInterval(() => {
      setLevelIndex(i => Math.min(i + 1, CLEARANCE_LEVELS.length - 1));
    }, DURATION / CLEARANCE_LEVELS.length);

    return () => {
      clearInterval(intervalRef.current!);
      clearInterval(phraseRef.current!);
      clearInterval(levelRef.current!);
    };
  }, []);

  const currentLevel = CLEARANCE_LEVELS[levelIndex];
  const levelColor = LEVEL_COLORS[currentLevel] ?? "text-yellow-500";
  const isRunning = !finished;

  return (
    <div className="space-y-5 w-full">
      {/* Status row */}
      <div className="flex justify-between items-center border border-slate-200 bg-slate-50 px-3 py-2">
        <span className="text-[9px] text-amber-950/60 uppercase tracking-widest font-black">Current Status</span>
        <span
          className={`text-[10px] uppercase tracking-widest font-black transition-colors duration-500 ${levelColor} ${isRunning && currentLevel !== "CLASSIFIED" ? "animate-pulse" : ""}`}
        >
          {currentLevel}
        </span>
      </div>

      {/* Phrase row */}
      <div className="flex justify-between items-center min-h-4">
        {isRunning ? (
          <span className="text-[9px] text-amber-700/80 uppercase tracking-widest font-black animate-pulse">
            {CLEARANCE_PHRASES[phraseIndex]}
          </span>
        ) : (
          <span className="text-[9px] text-amber-600/90 uppercase tracking-widest font-black">
            Adjudication complete.
          </span>
        )}
        <span className="text-[9px] text-amber-950/60 font-mono ml-4 shrink-0">{progress}%</span>
      </div>

      {/* Progress track */}
      <div className="relative h-1 bg-amber-100 overflow-hidden rounded-full">
        <div
          className="absolute inset-y-0 left-0 transition-all duration-75"
          style={{
            width: `${progress}%`,
            background: finished ? "rgba(245,158,11,0.9)" : "rgba(245,158,11,0.6)",
            boxShadow: finished ? "0 0 16px rgba(245,158,11,0.7)" : "none",
          }}
        />
        {isRunning && (
          <div
            className="absolute inset-y-0 w-20"
            style={{
              left: `calc(${progress}% - 5rem)`,
              transition: "left 75ms linear",
              background: "linear-gradient(to right, transparent, rgba(251,191,36,0.35), transparent)",
            }}
          />
        )}
      </div>

      {/* Tick marks */}
      <div className="flex justify-between px-0.5">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className={`w-px rounded-full transition-colors duration-300 ${i % 4 === 0 ? "h-2" : "h-1"} ${
              (i / 15) * 100 <= progress ? (finished ? "bg-amber-600" : "bg-amber-700/80") : "bg-amber-300/40"
            }`}
          />
        ))}
      </div>

      {/* Clearance granted button — only appears after progress completes */}
      <div
        className={`transition-all duration-500 ${
          finished ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="h-px bg-slate-200 mb-5" />
        <button
          onClick={onDone}
          className="w-full py-4 px-6
                     border border-amber-600/70 bg-amber-600
                     hover:bg-amber-700 hover:border-amber-700
                     text-white
                     text-[11px] uppercase tracking-[0.4em] font-black
                     transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
                     shadow-[0_0_24px_rgba(251,191,36,0.2)]
                     hover:shadow-[0_0_36px_rgba(251,191,36,0.3)]
                     rounded-md"
        >
          Access Archive →
        </button>
      </div>
    </div>
  );
}

export default function ChronicleClearance({ onComplete }: ChronicleClearanceProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 relative overflow-hidden flex items-center justify-center px-4">
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.02]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)",
          backgroundSize: "100% 3px",
        }}
      />

      {/* Ambient grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(202,138,4,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(202,138,4,0.15) 1px, transparent 1px)",
          backgroundSize: "100px 100px",
        }}
      />

      {/* Radial glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(251,191,36,0.1)_0%,transparent_70%)]" />

      <div className="relative z-10 max-w-md w-full space-y-6">
        {/* Agency stamp */}
        <div className="text-center space-y-2">
          <p className="text-[9px] text-amber-950/60 uppercase tracking-[0.5em] font-black">
            Omega Gaming · Office of the Ledger
          </p>
          <div className="flex items-center gap-3 justify-center">
            <div className="h-px flex-1 bg-amber-950/20" />
            <span className="text-amber-950/20 text-[11px] font-mono tracking-widest select-none">██████████████</span>
            <div className="h-px flex-1 bg-amber-950/20" />
          </div>
        </div>

        {/* Main document card */}
        <div className="border border-slate-300 bg-white/90 relative backdrop-blur-sm overflow-hidden rounded-xl shadow-2xl">
          {/* Top accent bar */}
          <div className="h-0.5 bg-linear-to-r from-transparent via-amber-500/50 to-transparent" />

          {/* Corner stamps */}
          <span className="absolute top-4 right-4 text-[9px] text-red-500 font-black uppercase tracking-widest">
            In Progress
          </span>
          <span className="absolute bottom-4 left-4 text-[9px] text-amber-900/60 font-mono">OL-CHRONICLE-7</span>

          <div className="p-9 space-y-8">
            {/* Classification header */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                {/* Pulsing indicator dot */}
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-[10px] text-amber-600 uppercase tracking-[0.3em] font-black">
                  Adjudication In Progress
                </p>
              </div>
              <h1 className="text-5xl font-black uppercase tracking-widest leading-none">
                <span className="text-amber-500/95">Clearance</span>
                <br />
                <span className="text-amber-900/60">Processing</span>
              </h1>
            </div>

            {/* Horizontal rule with classification marker */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-300" />
              <span className="text-[9px] text-amber-950/40 font-mono uppercase tracking-wider">sf-86 · automated</span>
              <div className="h-px flex-1 bg-slate-300" />
            </div>

            {/* Body copy */}
            <div className="space-y-3">
              <p className="text-[12px] text-slate-700 leading-relaxed font-mono">
                Identity confirmed. Running adjudication.
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                The ledger is being consulted. This process cannot be expedited. It was not designed to be.
              </p>
            </div>

            <div className="h-px bg-slate-200" />

            {/* Progress component */}
            <ClearanceProgressBar onDone={onComplete} />
          </div>

          {/* Bottom accent bar */}
          <div className="h-0.5 bg-linear-to-r from-transparent via-amber-500/30 to-transparent" />
        </div>

        {/* Footer note */}
        <div className="text-center space-y-1">
          <p className="text-[9px] text-amber-950/50 uppercase tracking-widest font-black">Do not close this window.</p>
          <p className="text-[9px] text-amber-950/40 uppercase tracking-widest font-black">
            The ledger does not save progress.
          </p>
        </div>
      </div>
    </main>
  );
}
