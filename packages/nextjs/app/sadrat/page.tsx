"use client";

import React, { Fragment } from "react";
import Link from "next/link";
import "./SadratDisclosure.css";

const SADRAT_ENTRIES = [
  {
    letter: "S",
    word: "Spot",
    note: "Identify potential recruits. In CIA ops: foreign nationals with access. Here: anyone with a wallet and a suspicious amount of free time.",
  },
  {
    letter: "A",
    word: "Assess",
    note: "Profile the target's motivations, vulnerabilities, and pressure points. We assessed: you are here. That was enough.",
  },
  {
    letter: "D",
    word: "Develop",
    note: "Build a relationship. Establish trust. We built a design system and wrote copy in the voice of a burned field officer. Same energy.",
  },
  {
    letter: "R",
    word: "Recruit",
    note: "Make the ask. Enter the lottery. Claim the clearance. The blockchain will not blackmail you afterward.",
  },
  {
    letter: "A",
    word: "Agent",
    note: "You are now an operative. Except you are on the payroll. Which the CIA cannot say about most of its assets.",
  },
  {
    letter: "T",
    word: "Terminate",
    note: "CIA meaning: burn the asset when convenient; deny involvement. Our meaning: the lottery window closes. That's it. No one disappears.",
  },
];

// ... imports and SADRAT_ENTRIES stay the same

export default function SadratDisclosure() {
  return (
    <div className="og-wrap">
      <div className="og-stamp">VOLUNTARILY DECLASSIFIED</div>
      <div className="og-eyebrow">{"// operational transparency memo"}</div>
      <h1 className="og-title">Yes, We Used the CIA&apos;s Playbook.</h1>
      <div className="og-subtitle">OPERATION: CHRONICLE RECRUITMENT — METHODS DISCLOSED</div>

      <div className="og-body my-8">
        <p className="mb-4">
          The Chronicle recruitment copy was written using <span className="og-highlight">SADRAT</span> — a behavioral
          framework designed to identify and manipulate assets into cooperation.
        </p>
        <p>
          Unlike the Agency, <span className="og-highlight">we disclose our methods.</span>
        </p>
      </div>

      <div className="og-framework-label">{"// the framework — decoded"}</div>

      <div className="og-acronym-grid">
        {SADRAT_ENTRIES.map(entry => (
          <React.Fragment key={entry.letter}>
            <div className="og-acro-letter">{entry.letter}</div>
            <div className="og-acro-def">
              <span className="og-acro-word">{entry.word}</span>
              <span className="og-acro-note text-slate-400 leading-relaxed">{entry.note}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* ... (MKUltra/Whistleblower section remains) ... */}

      <div className="og-footnote">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-4 font-bold">
          [SUPPLEMENTAL INTEL: THE M.I.C.E. MATRIX]
        </p>
        <div className="og-mice-grid">
          <div className="og-mice-item">
            <span className="og-mice-label">Money:</span> The ETH prize pool. We apply a 2% Extraction Buffer to every
            recruitment cycle. It&apos;s the cost of mathematical indifference. It ensures that when you claim your
            clearance, the ledger is there to verify it—permanently.
          </div>
          <div className="og-mice-item">
            <span className="og-mice-label">Ideology:</span> The belief that the ledger shouldn&apos;t have an
            editor-in-chief.
          </div>
          <div className="og-mice-item">
            <span className="og-mice-label">Coercion:</span> None. The smart contract enforces rules with mathematical
            indifference.
          </div>
          <div className="og-mice-item">
            <span className="og-mice-label">Ego:</span> You&apos;re Operative #506. You have the clearance, yet
            you&apos;re still reading.
          </div>
        </div>

        {/* Fixed Red Text */}
        <div className="og-encryption-footer">{"// encryption active. transparency ends here."}</div>
      </div>
    </div>
  );
}
