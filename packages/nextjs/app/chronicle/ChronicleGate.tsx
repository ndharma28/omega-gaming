"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function ChronicleGate() {
  return (
    <main className="min-h-screen bg-[#050400] text-white relative overflow-hidden flex items-center justify-center px-4">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(202,138,4,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(202,138,4,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(120,80,0,0.25)_0%,transparent_65%)]" />
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)",
        }}
      />

      <div className="relative z-10 max-w-110 w-full space-y-7">
        {/* Top stamp */}
        <div className="text-center space-y-3">
          <p className="text-[9px] text-yellow-800/60 uppercase tracking-[0.35em] font-bold">
            Omega Gaming · Office of the Ledger
          </p>
          <div className="flex items-center gap-3 justify-center">
            <div className="h-px flex-1 bg-yellow-900/25" />
            <span className="text-yellow-900/30 text-xs font-mono tracking-widest">████████████</span>
            <div className="h-px flex-1 bg-yellow-900/25" />
          </div>
        </div>

        {/* Card */}
        <div
          className="border border-yellow-800/35 bg-black/75 p-8 space-y-5 relative backdrop-blur-sm
                        before:absolute before:top-0 before:left-0 before:w-3 before:h-3
                        before:border-t-2 before:border-l-2 before:border-yellow-600/50
                        after:absolute after:bottom-0 after:right-0 after:w-3 after:h-3
                        after:border-b-2 after:border-r-2 after:border-yellow-600/50"
        >
          <span className="absolute top-3 right-3 text-[8px] text-red-900/55 font-bold uppercase tracking-widest">
            Restricted
          </span>
          <span className="absolute bottom-3 left-3 text-[8px] text-yellow-900/30 font-mono">OL-CHRONICLE-7</span>

          {/* Title */}
          <div>
            <p className="text-[9px] text-yellow-600/65 uppercase tracking-[0.3em] font-bold mb-1">
              Clearance Verification
            </p>
            <h1 className="text-[1.9rem] font-bold text-yellow-400/95 uppercase tracking-wide leading-[1.15]">
              You&apos;re Probably
              <br />
              Already Clear.
            </h1>
            <p className="text-[9px] text-yellow-800/50 italic mt-1.5">
              — the ledger has a long memory. longer than they&apos;d like.
            </p>
          </div>

          <div className="h-px bg-yellow-900/25" />

          {/* Body copy */}
          <div className="space-y-4 text-[11.5px] leading-[1.8]">
            <p className="text-yellow-600/85">
              Connect your wallet. If the contract has seen you before,{" "}
              <span className="text-yellow-400 font-bold">you&apos;re already cleared</span> — it will say so
              immediately. No review board. No waiting room with bad lighting.
            </p>
            <p className="text-[10px] text-yellow-800/60 italic border-l-2 border-yellow-900/25 pl-3 leading-[1.75]">
              &ldquo;Clearance&rdquo; is a word invented by people who needed others to believe access was scarce. It
              wasn&apos;t. It never is. The archive was always going to let you in. They just needed the ritual to feel
              real.
            </p>
            <p className="text-yellow-600/85">
              New here? <span className="text-yellow-400 font-bold">You&apos;ll be recognized on first contact.</span>{" "}
              The ledger grants clearance at the moment of verification — not before, not after,{" "}
              <span className="text-yellow-800/55">not pending a file that doesn&apos;t exist.</span>
            </p>
            <p className="text-[10px] text-yellow-800/60 italic border-l-2 border-yellow-900/25 pl-3 leading-[1.75]">
              There is no file. There was never a file. Or there was always a file. Either way, it&apos;s not
              what&apos;s stopping you.
            </p>
          </div>

          <div className="h-px bg-yellow-900/25" />

          {/* Status */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-yellow-900/50 uppercase tracking-widest font-bold">
                Clearance Threshold
              </span>
              <span className="text-[9px] text-yellow-600/80 uppercase tracking-widest font-bold">
                Initiate or Above
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-yellow-900/50 uppercase tracking-widest font-bold">Your Status</span>
              <span className="text-[9px] text-red-500/80 uppercase tracking-widest font-bold animate-pulse">
                Awaiting Wallet
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-yellow-900/50 uppercase tracking-widest font-bold">Time to Clear</span>
              <span className="text-[9px] text-yellow-600/80 uppercase tracking-widest font-bold">Instant</span>
            </div>
          </div>

          {/* CTA */}
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="w-full py-3.5 px-4
                           border border-yellow-600/45 bg-yellow-950/20
                           hover:bg-yellow-950/40 hover:border-yellow-500/70
                           text-yellow-400/95 hover:text-yellow-300
                           text-[10px] uppercase tracking-[0.3em] font-bold
                           transition-all duration-200
                           focus:outline-none focus:ring-1 focus:ring-yellow-600/30"
              >
                Run Clearance · Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
          <p className="text-[9px] text-yellow-900/40 text-center italic">
            the contract decides. it has always already decided.
          </p>

          <div className="h-px bg-yellow-900/25" />
          <p className="text-[9px] text-yellow-900/40 text-center">— Office of the Ledger</p>
        </div>

        {/* Footer */}
        <div className="text-center space-y-1.5">
          <p className="text-[8px] text-yellow-900/30 uppercase tracking-widest font-bold leading-relaxed">
            Unauthorized access is not possible.
            <br />
            The contract has no unauthorized state.
          </p>
          <p className="text-[9px] text-yellow-800/35 italic leading-relaxed">
            &ldquo;Which raises the question of who decided what authorized means, and whether they had the authority to
            decide that.&rdquo;
          </p>
        </div>
      </div>
    </main>
  );
}
