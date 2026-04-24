"use client";

import React from "react";
import "./SadratDisclosure.css";

const SADRAT_ENTRIES = [
  {
    letter: "S",
    word: "Spot",
    note: "Find the mark. CIA version: foreign nationals with clearance and a mortgage. Our version: anyone who looked at ETH gas fees and thought 'yeah, fine.' You were never not a target.",
  },
  {
    letter: "A",
    word: "Assess",
    note: "Profile the vulnerabilities. Motivations. Pressure points. You opened this page. The assessment concluded.",
  },
  {
    letter: "D",
    word: "Develop",
    note: "Build rapport. Make them feel seen. We wrote copy in the voice of a burned field officer and called it a design system. The Agency calls this 'relationship cultivation.' We call it Tuesday.",
  },
  {
    letter: "R",
    word: "Recruit",
    note: "Make the ask. Enter the lottery. Claim the clearance. The difference between us and Langley: we tell you it's happening.",
  },
  {
    letter: "A",
    word: "Agent",
    note: "Congratulations. You're an operative now. You're also on the payroll, which historically the CIA cannot say about most of the people doing its work.",
  },
  {
    letter: "T",
    word: "Terminate",
    note: "Their version: burn the asset, shred the file, deny the program existed. Our version: the lottery window closes. Nobody gets renditioned. That's the whole difference.",
  },
];

export default function SadratDisclosure() {
  return (
    <div className="og-wrap">
      <div className="og-stamp">VOLUNTARILY DECLASSIFIED</div>
      <div className="og-eyebrow">{"// operational transparency memo"}</div>
      <h1 className="og-title">Yes, We Used the CIA&apos;s Playbook.</h1>
      <div className="og-subtitle">OPERATION: CHRONICLE RECRUITMENT — METHODS DISCLOSED</div>

      <div className="og-body my-8">
        <p className="mb-4">
          The Chronicle recruitment copy was written using <span className="og-highlight">SADRAT</span> — a six-step
          behavioral framework the CIA developed to turn ordinary people into assets without them fully understanding
          what was happening until it was already done.
        </p>
        <p>
          We used it intentionally. We&apos;re telling you now.{" "}
          <span className="og-highlight">That&apos;s more than they ever did.</span>
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

      {/* MKUltra Section */}
      <div className="og-body my-10">
        <p className="og-framework-label mb-4">{"// historical precedent"}</p>

        <p className="mb-4">
          MKUltra ran for twenty years. They dosed unwitting subjects with LSD, applied electroshock to people who
          thought they were receiving psychiatric care, and when Congress started asking questions, they destroyed the
          files. The program only surfaced because someone forgot a box of documents in a federal records room in 1977.{" "}
          <span className="og-highlight">
            A filing error did more for accountability than two decades of oversight.
          </span>
        </p>
        <p>
          We put the rules in the contract. You can read them before you enter. That is the entire distinction between
          us and a black site program. We are aware that is a low bar. We are clearing it anyway.
        </p>
      </div>

      {/* Kiriakou Section */}
      <div className="og-body my-10">
        <p className="og-framework-label mb-4">{"// on the subject of disclosure"}</p>

        <p>
          John Kiriakou confirmed that waterboarding was official CIA policy. The Senate Intelligence Committee later
          documented this across 6,700 pages. Kiriakou got thirty months in federal prison. The lawyers who wrote the
          legal justifications for it got book deals and faculty positions at institutions that have never once been
          inconvenienced by anything they have done.{" "}
          <span className="og-highlight">
            This is what institutional transparency looks like when the institution controls the definition of
            transparency.
          </span>{" "}
          We don&apos;t control the contract. The contract controls the contract. That&apos;s intentional.
        </p>
      </div>

      {/* MICE Matrix */}
      <div className="og-footnote">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-4 font-bold">
          [SUPPLEMENTAL INTEL: THE M.I.C.E. MATRIX]
        </p>
        <div className="og-mice-grid">
          <div className="og-mice-item">
            <span className="og-mice-label">Money:</span> The ETH prize pool. We take 2%. We call it an Extraction
            Buffer because that is what it is. Every intelligence apparatus has a budget line nobody talks about. We put
            ours in the contract. You can verify it. They could not say the same about the MKUltra budget, which ran
            through front foundations for two decades without a single public line item.
          </div>
          <div className="og-mice-item">
            <span className="og-mice-label">Ideology:</span> The ledger shouldn&apos;t have an editor. Someone decided
            that once, wrote it into code, and now neither of us can change it. That is either terrifying or the only
            honest institution left. Possibly both.
          </div>
          <div className="og-mice-item">
            <span className="og-mice-label">Coercion:</span> None on our end. The smart contract enforces rules without
            discretion, without favoritism, and without the ability to make exceptions for people who know the right
            people. Kiriakou knew the right people. It did not help him.
          </div>
          <div className="og-mice-item">
            <span className="og-mice-label">Ego:</span> You read this far. You know the framework. You know about the
            filing error and the endowed chairs. You are going to enter anyway. So did we, frankly.
          </div>
        </div>

        <div className="og-encryption-footer">{"// encryption active. transparency ends here."}</div>
      </div>
    </div>
  );
}
