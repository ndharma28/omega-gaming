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
  UNVERIFIED: "text-red-600",
  SPARK: "text-blue-600",
  INITIATE: "text-emerald-600",
  ASCENDANT: "text-orange-600",
  CLASSIFIED: "text-amber-600",
};

interface ChronicleClearanceProps {
  onComplete: () => void;
  /** Pass the user's level if they are already logged in */
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
      <div className="flex justify-between items-center border-2 border-amber-100 bg-amber-50/50 px-4 py-3 rounded-lg">
        <span className="text-[10px] text-amber-900/60 uppercase tracking-widest font-black">Adjudicating Level</span>
        <span
          className={`text-xs uppercase tracking-widest font-black transition-colors duration-500 ${LEVEL_COLORS[currentLevel]} ${isRunning ? "animate-pulse" : ""}`}
        >
          {currentLevel}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-[10px] text-amber-700 font-bold uppercase tracking-tight">
            {isRunning ? CLEARANCE_PHRASES[phraseIndex] : "Process Finalized"}
          </span>
          <span className="text-[11px] text-amber-900 font-mono font-bold">{progress}%</span>
        </div>
        <div className="relative h-2 bg-amber-100 overflow-hidden rounded-full border border-amber-200">
          <div
            className="absolute inset-y-0 left-0 transition-all duration-100 bg-linear-to-r from-amber-400 to-amber-600"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div
        className={`transition-all duration-700 delay-300 ${finished ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
      >
        <button
          onClick={onDone}
          className="w-full py-4 px-6 rounded-xl border-2 border-amber-600 bg-amber-600 text-white text-[11px] uppercase tracking-[0.4em] font-black transition-all hover:bg-amber-700 hover:shadow-xl hover:shadow-amber-200 active:scale-[0.98]"
        >
          Access Archive →
        </button>
      </div>
    </div>
  );
}

export default function ChronicleClearance({ onComplete, userLevel }: ChronicleClearanceProps) {
  const isLoggedIn = !!userLevel;

  return (
    <main className="min-h-screen bg-white text-slate-900 relative overflow-hidden flex items-center justify-center px-4">
      {/* Background Polish */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.08)_0%,transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }}
        />
      </div>

      <div className="relative z-10 max-w-md w-full space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-block px-3 py-1 border border-amber-200 bg-amber-50 rounded-full">
            <p className="text-[9px] text-amber-800 uppercase tracking-[0.4em] font-black">Office of the Ledger</p>
          </div>
          <div className="h-px w-24 mx-auto bg-linear-to-r from-transparent via-amber-200 to-transparent" />
        </div>

        {/* Main Document Card */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden relative">
          {/* Security Strip */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-amber-400 via-yellow-300 to-amber-600" />

          <div className="p-10 space-y-8">
            {isLoggedIn ? (
              /* LOGGED IN STATE */
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">
                      Active Session Detected
                    </span>
                  </div>
                  <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 leading-[0.9]">
                    Identity
                    <br />
                    <span className="text-amber-500 text-4xl">Verified</span>
                  </h1>
                </div>

                <div className="p-6 bg-slate-50 border-l-4 border-amber-500 rounded-r-xl space-y-4">
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">
                      Current Authorization
                    </p>
                    <p className={`text-2xl font-black tracking-widest ${LEVEL_COLORS[userLevel] || "text-slate-900"}`}>
                      {userLevel}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
                    Credentials retrieved from the Ledger. Archive access is permitted at your current classification
                    level.
                  </p>
                </div>

                <button
                  onClick={onComplete}
                  className="group relative w-full py-5 px-6 rounded-xl bg-slate-900 text-white overflow-hidden transition-all hover:bg-black hover:shadow-2xl active:scale-[0.98]"
                >
                  <span className="relative z-10 text-[11px] uppercase tracking-[0.5em] font-black">
                    Continue to Archive
                  </span>
                  <div className="absolute inset-0 bg-linear-to-r from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            ) : (
              /* PROCESSING STATE (NOT LOGGED IN) */
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] text-amber-600 font-black uppercase tracking-widest">
                      System Adjudication
                    </span>
                  </div>
                  <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 leading-[0.9]">
                    Clearance
                    <br />
                    <span className="text-slate-300">Required</span>
                  </h1>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Analyzing wallet signature against the immutable ledger history.
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono italic">
                    Note: Unverified accounts will be assigned &apos;SPARK&apos; status by default.
                  </p>
                </div>

                <div className="h-px bg-slate-100" />

                <ClearanceProgressBar onDone={onComplete} />
              </div>
            )}
          </div>

          {/* Bottom Footer Info */}
          <div className="bg-slate-50 px-10 py-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[8px] text-slate-400 font-mono uppercase">Reference: OL-CHRONICLE-07</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-amber-200 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Support Text */}
        <p className="text-center text-[9px] text-slate-400 uppercase tracking-[0.2em] font-bold">
          {isLoggedIn ? "Session managed by Omega Security" : "Do not refresh while adjudication is active"}
        </p>
      </div>
    </main>
  );
}
