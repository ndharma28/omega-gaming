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

const LEVEL_COLORS: Record<string, React.CSSProperties> = {
  UNVERIFIED: { color: "#ef4444" },
  SPARK: { color: "#94a3b8" },
  INITIATE: { color: "#cbd5e1" },
  ASCENDANT: { color: "#fed7aa" },
  CLASSIFIED: { color: "#fde68a" },
};

interface ChronicleClearanceProps {
  onComplete: () => void;
  userLevel?: string;
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
      if (t < 0.6) eased = Math.round((1 - Math.pow(1 - t / 0.6, 3)) * 70);
      else if (t < 0.85) eased = Math.round(70 + ((t - 0.6) / 0.25) * 18);
      else eased = Math.round(88 + ((t - 0.85) / 0.15) * 12);

      eased = Math.min(100, eased);
      setProgress(eased);

      if (current >= steps) {
        clearInterval(intervalRef.current!);
        clearInterval(phraseRef.current!);
        clearInterval(levelRef.current!);
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
  const isRunning = !finished;

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-700">
      <div className="flex justify-between items-center border border-yellow-900/40 bg-yellow-950/30 px-4 py-3 rounded-lg">
        <span className="text-[10px] text-yellow-800 uppercase tracking-widest font-black">Adjudicating Level</span>
        <span
          className={`text-xs uppercase tracking-widest font-black transition-colors duration-500 ${isRunning ? "animate-pulse" : ""}`}
          style={LEVEL_COLORS[currentLevel]}
        >
          {currentLevel}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-[10px] text-yellow-800 font-bold uppercase tracking-tight">
            {isRunning ? CLEARANCE_PHRASES[phraseIndex] : "Process Finalized"}
          </span>
          <span className="text-[11px] text-yellow-500 font-mono font-bold">{progress}%</span>
        </div>
        <div className="relative h-2 bg-yellow-950/60 overflow-hidden rounded-full border border-yellow-900/40">
          <div
            className="absolute inset-y-0 left-0 transition-all duration-100"
            style={{ width: `${progress}%`, background: "linear-gradient(to right, #92400e, #fbbf24)" }}
          />
        </div>
      </div>

      <div
        className={`transition-all duration-700 delay-300 ${finished ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
      >
        <button
          onClick={onDone}
          className="w-full py-4 px-6 rounded-xl border border-yellow-700/60 bg-yellow-950/40 text-yellow-300 text-[11px] uppercase tracking-[0.4em] font-black transition-all hover:bg-yellow-900/50 hover:border-yellow-600/80 hover:text-yellow-200 active:scale-[0.98]"
        >
          Infiltrate the Chronicle →
        </button>
      </div>
    </div>
  );
}

export default function ChronicleClearance({ onComplete, userLevel }: ChronicleClearanceProps) {
  const isLoggedIn = !!userLevel;

  return (
    <main className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center px-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(120,80,0,0.15)_0%,transparent_70%)]" />
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(202,138,4,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(202,138,4,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-md w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-block px-3 py-1 border border-yellow-900/40 bg-yellow-950/30 rounded-full">
            <p className="text-[9px] text-yellow-700 uppercase tracking-[0.4em] font-black">Office of the Ledger</p>
          </div>
          <div
            className="h-px w-24 mx-auto"
            style={{ background: "linear-gradient(to right, transparent, rgba(161,98,7,0.4), transparent)" }}
          />
        </div>

        <div className="border border-yellow-900/30 bg-black/80 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden relative backdrop-blur-sm">
          <div
            className="absolute top-0 left-0 w-full h-px"
            style={{ background: "linear-gradient(to right, transparent, rgba(202,138,4,0.6), transparent)" }}
          />

          <div className="p-10 space-y-8">
            {isLoggedIn ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                    <span className="text-[10px] text-yellow-600 font-black uppercase tracking-widest">
                      Active Session Detected
                    </span>
                  </div>
                  <h1 className="text-5xl font-black uppercase tracking-tighter text-yellow-200/90 leading-[0.9]">
                    Identity
                    <br />
                    <span className="text-yellow-500 text-4xl">Verified</span>
                  </h1>
                </div>

                <div className="p-6 border-l-2 border-yellow-800/60 bg-yellow-950/20 rounded-r-xl space-y-4">
                  <div className="space-y-1">
                    <p className="text-[9px] text-yellow-900 uppercase font-bold tracking-widest">
                      Current Authorization
                    </p>
                    <p
                      className="text-2xl font-black tracking-widest"
                      style={LEVEL_COLORS[userLevel] ?? { color: "#fde68a" }}
                    >
                      {userLevel}
                    </p>
                  </div>
                  <p className="text-[11px] text-yellow-900/80 font-mono leading-relaxed">
                    Credentials retrieved from the Ledger. Archive access is permitted at your current classification
                    level.
                  </p>
                </div>

                <button
                  onClick={onComplete}
                  className="w-full py-5 px-6 rounded-xl border border-yellow-700/60 bg-yellow-950/40 text-yellow-300 text-[11px] uppercase tracking-[0.5em] font-black transition-all hover:bg-yellow-900/50 hover:border-yellow-600/80 hover:text-yellow-200 active:scale-[0.98]"
                >
                  Continue to Archive
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-700 animate-pulse" />
                    <span className="text-[10px] text-yellow-700 font-black uppercase tracking-widest">
                      System Adjudication
                    </span>
                  </div>
                  <h1 className="text-5xl font-black uppercase tracking-tighter text-yellow-200/90 leading-[0.9]">
                    Clearance
                    <br />
                    <span className="text-yellow-900">Required</span>
                  </h1>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-yellow-900/70 font-medium leading-relaxed">
                    Analyzing wallet signature against the immutable ledger history.
                  </p>
                  <p className="text-[10px] text-yellow-900/50 font-mono italic">
                    Note: Unverified accounts will be assigned &apos;SPARK&apos; status by default.
                  </p>
                </div>

                <div className="h-px bg-yellow-900/20" />

                <ClearanceProgressBar onDone={onComplete} />
              </div>
            )}
          </div>

          <div className="bg-yellow-950/20 px-10 py-4 border-t border-yellow-900/20 flex justify-between items-center">
            <span className="text-[8px] text-yellow-900/50 font-mono uppercase">Reference: OL-CHRONICLE-07</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-yellow-900/50 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[9px] text-yellow-900/50 uppercase tracking-[0.2em] font-bold">
          {isLoggedIn ? "Session managed by Omega Security" : "Do not refresh while adjudication is active"}
        </p>
      </div>
    </main>
  );
}
