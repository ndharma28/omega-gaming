"use client";

function Sigil() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="chronicle-sigil">
      <polygon points="24,4 44,36 4,36" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="0.75" fill="none" />
      <line x1="24" y1="4" x2="24" y2="44" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
      <line x1="4" y1="36" x2="44" y2="36" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
      <line x1="4" y1="36" x2="44" y2="12" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
    </svg>
  );
}

function GlyphRow() {
  return (
    <div className="chronicle-glyph-row">
      <span>◆</span>
      <span className="opacity-50">· · · · · · · · · · · · · · ·</span>
      <span>◆</span>
    </div>
  );
}

export default function ChronicleHeader() {
  return (
    <div className="space-y-6">
      {/* Back nav */}
      <div className="flex items-center">
        <button
          onClick={() => {
            window.location.href = "/";
          }}
          className="group flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-yellow-500 transition-colors duration-200"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
          Omega Gaming
        </button>
      </div>

      {/* Title block */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Sigil />
        </div>

        <div className="space-y-1">
          <p className="text-[10px] tracking-[0.5em] text-yellow-600 uppercase font-bold">
            Omega Gaming · Restricted Archive
          </p>
          <h1 className="text-5xl font-black tracking-tight text-white">The Chronicle</h1>
          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            A determination has been made. You are cleared for access. The contract adjudicated your file automatically.
            Eighteen months of background investigation, condensed into one block confirmation. The ledger is more
            thorough anyway. — Office of the Ledger
          </p>
        </div>

        <GlyphRow />
      </div>
    </div>
  );
}
