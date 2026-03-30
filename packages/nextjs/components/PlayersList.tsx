"use client";

interface PlayersListProps {
  players?: readonly string[];
  connectedAddress?: string | null;
}

export default function PlayersList({ players, connectedAddress }: PlayersListProps) {
  const count = players?.length || 0;

  return (
    <div
      style={{
        background: "rgba(10,10,8,0.85)",
        border: "0.5px solid rgba(239,159,39,0.2)",
        borderRadius: "8px",
        padding: "24px 28px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Corner brackets */}
      {(
        [
          {
            top: 8,
            left: 8,
            borderTop: "1px solid rgba(239,159,39,0.4)",
            borderLeft: "1px solid rgba(239,159,39,0.4)",
          },
          {
            top: 8,
            right: 8,
            borderTop: "1px solid rgba(239,159,39,0.4)",
            borderRight: "1px solid rgba(239,159,39,0.4)",
          },
          {
            bottom: 8,
            left: 8,
            borderBottom: "1px solid rgba(239,159,39,0.4)",
            borderLeft: "1px solid rgba(239,159,39,0.4)",
          },
          {
            bottom: 8,
            right: 8,
            borderBottom: "1px solid rgba(239,159,39,0.4)",
            borderRight: "1px solid rgba(239,159,39,0.4)",
          },
        ] as React.CSSProperties[]
      ).map((s, i) => (
        <div key={i} style={{ position: "absolute", width: 12, height: 12, ...s }} />
      ))}

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          <span
            style={{
              fontSize: "8px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(239,159,39,0.3)",
              fontFamily: "var(--og-mono)",
            }}
          >
            ████ ACTIVE ████
          </span>
          <span
            style={{
              fontSize: "11px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--og-amber)",
              fontFamily: "var(--og-mono)",
              fontWeight: 600,
            }}
          >
            CURRENT PLAYERS
          </span>
        </div>

        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.15em",
            fontFamily: "var(--og-mono)",
            color: "rgba(239,159,39,0.5)",
            border: "0.5px solid rgba(239,159,39,0.18)",
            borderRadius: "3px",
            padding: "3px 10px",
          }}
        >
          {count} PARTICIPANT{count !== 1 ? "S" : ""}
        </span>
      </div>

      {/* List */}
      <div
        style={{
          maxHeight: "220px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(239,159,39,0.15) transparent",
        }}
      >
        {count === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px 0",
              gap: "10px",
            }}
          >
            {/* Empty state icon */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(239,159,39,0.15)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span
              style={{
                fontSize: "11px",
                color: "var(--og-text-muted)",
                fontFamily: "var(--og-mono)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              NO ENTRANTS DETECTED
            </span>
            <span
              style={{
                fontSize: "10px",
                color: "rgba(239,159,39,0.25)",
                fontFamily: "var(--og-mono)",
                letterSpacing: "0.1em",
              }}
            >
              TRANSMIT ENTRY TO APPEAR
            </span>
          </div>
        ) : (
          players!.map((player, index) => {
            const isYou = !!connectedAddress && player.toLowerCase() === connectedAddress.toLowerCase();
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
                  background: isYou ? "rgba(239,159,39,0.05)" : "rgba(16,16,12,0.6)",
                  border: `0.5px solid ${isYou ? "rgba(239,159,39,0.22)" : "rgba(239,159,39,0.08)"}`,
                  borderRadius: "4px",
                  transition: "border-color 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "rgba(239,159,39,0.3)",
                      fontFamily: "var(--og-mono)",
                      letterSpacing: "0.05em",
                      minWidth: "20px",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontFamily: "var(--og-mono)",
                      color: isYou ? "var(--og-amber)" : "var(--og-text-bright)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {player.slice(0, 6)}…{player.slice(-4)}
                  </span>
                </div>

                {isYou && (
                  <span
                    style={{
                      fontSize: "9px",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      fontFamily: "var(--og-mono)",
                      fontWeight: 600,
                      color: "var(--og-green)",
                      border: "0.5px solid rgba(var(--og-green-rgb, 74,222,128),0.3)",
                      borderRadius: "3px",
                      padding: "2px 7px",
                    }}
                  >
                    YOU
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
