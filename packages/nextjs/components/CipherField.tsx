"use client";

type Unit = "ether" | "gwei" | "wei" | "usd";

const UNITS: { label: string; value: Unit }[] = [
  { label: "ETH", value: "ether" },
  { label: "Gwei", value: "gwei" },
  { label: "Wei", value: "wei" },
  { label: "USD", value: "usd" },
];

interface CipherFieldProps {
  label: "FROM" | "TO";
  unit: Unit;
  onUnitChange: (u: Unit) => void;
  // FROM-only
  value?: string;
  onValueChange?: (v: string) => void;
  // TO-only
  result?: string;
}

export default function CipherField({ label, unit, onUnitChange, value, onValueChange, result }: CipherFieldProps) {
  const isFrom = label === "FROM";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <span className="og-cipher-field-label">{label}</span>

      {isFrom ? (
        <input
          className="og-cipher-input"
          type="number"
          value={value}
          onChange={e => onValueChange?.(e.target.value)}
        />
      ) : (
        <div className="og-cipher-result" style={{ color: result ? "var(--og-green)" : "var(--og-text-muted)" }}>
          {result || "—"}
        </div>
      )}

      <select className="og-cipher-select" value={unit} onChange={e => onUnitChange(e.target.value as Unit)}>
        {UNITS.map(u => (
          <option key={u.value} value={u.value}>
            {u.label}
          </option>
        ))}
      </select>
    </div>
  );
}
