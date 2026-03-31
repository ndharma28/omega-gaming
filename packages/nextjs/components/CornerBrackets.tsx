"use client";

import React from "react";

interface CornerBracketsProps {
  color?: string;
  size?: number;
  offset?: number;
}

export default function CornerBrackets({ color = "rgba(239,159,39,0.7)", size = 12, offset = 8 }: CornerBracketsProps) {
  const b = `1px solid ${color}`;
  const brackets: React.CSSProperties[] = [
    { top: offset, left: offset, borderTop: b, borderLeft: b },
    { top: offset, right: offset, borderTop: b, borderRight: b },
    { bottom: offset, left: offset, borderBottom: b, borderLeft: b },
    { bottom: offset, right: offset, borderBottom: b, borderRight: b },
  ];

  return (
    <>
      {brackets.map((s, i) => (
        <div key={i} style={{ position: "absolute", width: size, height: size, ...s }} />
      ))}
    </>
  );
}
