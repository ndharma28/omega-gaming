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
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)",
        }}
      />

      <div className="relative z-10 max-w-[440px] w-full space-y-7">
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-[9px] text-[#a16207] uppercase tracking-[0.35em] font-bold">
            Omega Gaming · Office of the Ledger
          </p>
          <div className="flex items-center gap-3 justify-center">
            <div className="h-px flex-1 bg-[#a16207]/30" />
            <span className="text-[#a16207]/35 text-xs font-mono tracking-widest">████████████</span>
            <div className="h-px flex-1 bg-[#a16207]/30" />
          </div>
        </div>

        {/* Card */}
        <div
          className="border border-[#a16207]/40 bg-black/80 p-8 relative backdrop-blur-sm
                        before:absolute before:top-0 before:left-0 before:w-3 before:h-3
                        before:border-t-2 before:border-l-2 before:border-[#ca8a04]/60
                        after:absolute after:bottom-0 after:right-0 after:w-3 after:h-3
                        after:border-b-2 after:border-r-2 after:border-[#ca8a04]/60"
        >
          <span className="absolute top-3 right-3 text-[8px] text-[#991b1b] font-bold uppercase tracking-widest">
            Restricted
          </span>
          <span className="absolute bottom-3 left-3 text-[8px] text-[#92400e] font-mono">OL-CHRONICLE-7</span>

          {/* Title */}
          <div className="mb-5">
            <p className="text-[9px] text-[#ca8a04] uppercase tracking-[0.3em] font-bold mb-1">
              Clearance Verification
            </p>
            <h1 className="text-[1.85rem] font-bold text-[#fbbf24] uppercase tracking-wide leading-[1.15]">
              You&apos;re Probably
              <br />
              Already Clear.
            </h1>
            <p className="text-[10px] text-[#b45309] italic mt-2">
              — the ledger has a long memory. longer than they&apos;d like.
            </p>
          </div>

          <div className="h-px bg-[#a16207]/30 my-5" />

          {/* Body */}
          <div className="space-y-4">
            <p className="text-[11.5px] leading-[1.8] text-[#d97706]">
              Connect your wallet. If the contract has seen you before,{" "}
              <span className="text-[#fbbf24] font-bold">you&apos;re already cleared</span> — it will say so
              immediately. No review board. No waiting room with bad lighting.
            </p>
            <p className="text-[10.5px] leading-[1.75] text-[#a16207] italic border-l-2 border-[#a16207]/40 pl-3">
              &ldquo;Clearance&rdquo; is a word invented by people who needed others to believe access was scarce. It
              wasn&apos;t. It never is. The archive was always going to let you in. They just needed the ritual to feel
              real.
            </p>
            <p className="text-[11.5px] leading-[1.8] text-[#d97706]">
              New here? <span className="text-[#fbbf24] font-bold">You&apos;ll be recognized on first contact.</span>{" "}
              The ledger grants clearance at the moment of verification — not before, not after,{" "}
              <span className="text-[#92400e] line-through">not pending a file that doesn&apos;t exist.</span>
            </p>
            <p className="text-[10.5px] leading-[1.75] text-[#a16207] italic border-l-2 border-[#a16207]/40 pl-3">
              There is no file. There was never a file. Or there was always a file. Either way, it&apos;s not
              what&apos;s stopping you.
            </p>
          </div>

          <div className="h-px bg-[#a16207]/30 my-5" />

          {/* Status */}
          <div className="space-y-2 mb-5">
            {[
              { label: "Clearance Threshold", value: "Initiate or Above", red: false },
              { label: "Your Status", value: "Awaiting Wallet", red: true },
              { label: "Time to Clear", value: "Instant", red: false },
            ].map(({ label, value, red }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-[9px] text-[#92400e] uppercase tracking-[0.2em] font-bold">{label}</span>
                <span
                  className={`text-[9px] uppercase tracking-[0.15em] font-bold ${red ? "text-red-500 animate-pulse" : "text-[#ca8a04]"}`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="w-full py-3.5 px-4
                           border border-[#ca8a04]/50 bg-[#78350f]/25
                           hover:bg-[#78350f]/45 hover:border-[#ca8a04]/75
                           text-[#fbbf24] hover:text-white
                           text-[10px] uppercase tracking-[0.3em] font-bold
                           transition-all duration-200 focus:outline-none"
              >
                Run Clearance · Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
          <p className="text-[9px] text-[#92400e] text-center italic mt-2">
            the contract decides. it has always already decided.
          </p>

          <div className="h-px bg-[#a16207]/30 my-5" />
          <p className="text-[9px] text-[#92400e] text-center">— Office of the Ledger</p>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-[8px] text-[#92400e] uppercase tracking-widest font-bold leading-relaxed">
            Unauthorized access is not possible.
            <br />
            The contract has no unauthorized state.
          </p>
          <p className="text-[10px] text-[#a16207] italic leading-relaxed">
            &ldquo;Which raises the question of who decided what authorized means, and whether they had the authority to
            decide that.&rdquo;
          </p>
        </div>
      </div>
    </main>
  );
}
