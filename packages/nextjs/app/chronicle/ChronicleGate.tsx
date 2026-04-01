"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function ChronicleGate() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center px-4">
      {/* Same ambient grid as the Chronicle page */}
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

        {/* Main notice card */}
        <div className="border border-yellow-900/30 bg-black/60 p-8 space-y-6 relative backdrop-blur-sm">
          {/* Corner stamps */}
          <span className="absolute top-3 right-3 text-[8px] text-red-900/50 font-black uppercase tracking-widest">
            Restricted
          </span>
          <span className="absolute bottom-3 left-3 text-[8px] text-yellow-900/25 font-mono">OL-CHRONICLE-7</span>

          {/* Title */}
          <div className="space-y-2">
            <p className="text-[9px] text-yellow-600/60 uppercase tracking-[0.3em] font-black">
              Clearance Verification Required
            </p>
            <h1 className="text-3xl font-black text-yellow-500/90 uppercase tracking-widest leading-tight">
              Restricted
              <br />
              Archive
            </h1>
          </div>

          <div className="h-px bg-yellow-900/20" />

          {/* Body copy */}
          <div className="space-y-3 text-[11px] text-yellow-900/60 leading-relaxed font-mono">
            <p>This archive is not publicly accessible.</p>
            <p>Connect your wallet to establish identity. The ledger will confirm your eligibility.</p>
            <p>No account. No password. No one to ask. The contract either recognizes you or it doesn&apos;t.</p>
          </div>

          <div className="h-px bg-yellow-900/20" />

          {/* Status readout */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-yellow-900/40 uppercase tracking-widest font-black">
                Clearance Required
              </span>
              <span className="text-[9px] text-yellow-600/60 uppercase tracking-widest font-black">
                Initiate or above
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-yellow-900/40 uppercase tracking-widest font-black">Current Status</span>
              <span className="text-[9px] text-red-500/70 uppercase tracking-widest font-black animate-pulse">
                Unverified
              </span>
            </div>
          </div>

          {/* Connect button */}
          <div className="pt-1">
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="w-full py-3 px-4
                             border border-yellow-600/30 bg-yellow-950/20
                             hover:bg-yellow-950/40 hover:border-yellow-600/50
                             text-yellow-500/80 hover:text-yellow-400
                             text-[10px] uppercase tracking-[0.3em] font-black
                             transition-all duration-300
                             focus:outline-none focus:ring-1 focus:ring-yellow-600/30"
                >
                  Connect Wallet to Proceed
                </button>
              )}
            </ConnectButton.Custom>
          </div>

          <p className="text-[9px] text-yellow-900/30 text-center font-mono">— Office of the Ledger</p>
        </div>

        {/* Bottom note */}
        <p className="text-center text-[8px] text-yellow-900/20 uppercase tracking-widest font-black leading-relaxed">
          Unauthorized access is not possible.
          <br />
          The contract doesn&apos;t have an unauthorized access state.
        </p>
      </div>
    </main>
  );
}
