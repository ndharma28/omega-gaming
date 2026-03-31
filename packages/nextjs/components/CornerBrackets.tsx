"use client";

import React from "react";

const BRACKETS: React.CSSProperties[] = [
  { top: 8, left: 8, borderTop: "1px solid rgba(239,159,39,0.7)", borderLeft: "1px solid rgba(239,159,39,0.7)" },
  { top: 8, right: 8, borderTop: "1px solid rgba(239,159,39,0.7)", borderRight: "1px solid rgba(239,159,39,0.7)" },
  { bottom: 8, left: 8, borderBottom: "1px solid rgba(239,159,39,0.7)", borderLeft: "1px solid rgba(239,159,39,0.7)" },
  {
    bottom: 8,
    right: 8,
    borderBottom: "1px solid rgba(239,159,39,0.7)",
    borderRight: "1px solid rgba(239,159,39,0.7)",
  },
];

export default function CornerBrackets() {
  return (
    <>
      {BRACKETS.map((s, i) => (
        <div key={i} style={{ position: "absolute", width: 12, height: 12, ...s }} />
      ))}
    </>
  );
}
