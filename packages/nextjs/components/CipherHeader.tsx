"use client";

interface CipherHeaderProps {
  ethPrice: number;
}

export default function CipherHeader({ ethPrice }: CipherHeaderProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        <span className="og-cipher-classified">████ CLASSIFIED ████</span>
        <span className="og-cipher-title">VALUE CIPHER</span>
      </div>

      {ethPrice > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="og-cipher-price-dot" />
          <span className="og-cipher-price-label">
            1 ETH = <span className="og-cipher-price-value">${ethPrice.toLocaleString()}</span>
          </span>
        </div>
      )}
    </div>
  );
}
