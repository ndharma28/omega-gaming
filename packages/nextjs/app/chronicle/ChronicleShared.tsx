"use client";

export function SkeletonRow() {
  return (
    <div className="chronicle-table-row chronicle-border">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-3 rounded bg-yellow-900/10 animate-pulse" />
      ))}
    </div>
  );
}

export function EmptySigil() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="chronicle-sigil mx-auto">
      <polygon points="24,4 44,36 4,36" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="0.75" fill="none" />
      <line x1="24" y1="4" x2="24" y2="44" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
      <line x1="4" y1="36" x2="44" y2="36" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
      <line x1="4" y1="36" x2="44" y2="12" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
    </svg>
  );
}
