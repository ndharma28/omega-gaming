"use client";

interface PingDotProps {
  color: string;
  size?: number;
  duration?: string;
}

export default function PingDot({ color, size = 8, duration = "1.2s" }: PingDotProps) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: color,
          animation: `og-ping ${duration} cubic-bezier(0,0,0.2,1) infinite`,
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: color,
        }}
      />
    </div>
  );
}
