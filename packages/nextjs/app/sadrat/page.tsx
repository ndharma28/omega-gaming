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

export default function SadratDisclosure() {
  return (
    <div className="og-wrap">
      <div className="og-stamp">VOLUNTARILY DECLASSIFIED</div>

      {/* Wrapping the // text in braces and quotes tells the linter it's a string, not a code comment */}
      <div className="og-eyebrow">{"// operational transparency memo"}</div>
      <div className="og-title">Yes, We Used the CIA&apos;s Playbook.</div>
      <div className="og-subtitle">OPERATION: CHRONICLE RECRUITMENT — METHODS DISCLOSED</div>

      <div className="og-badge-row">
        <span className="og-badge active">SADRAT</span>
        <span className="og-badge active">MICE</span>
        <span className="og-badge">NOT MKULTRA</span>
        <span className="og-badge">WE PROMISE</span>
      </div>

      <div className="og-body">
        <p>
          The Chronicle recruitment copy you just read was written using <span className="og-highlight">SADRAT</span> —
          a behavioral influence framework developed and deployed by the Central Intelligence Agency to identify and
          manipulate foreign assets into betraying their countries, their colleagues, and occasionally their own
          families.
        </p>

        <p>
          We are telling you this because, unlike the CIA,{" "}
          <span className="og-highlight">we disclose our methods.</span> This is not a low bar. It is, apparently, a bar
          the CIA has never once cleared.
        </p>
      </div>

      <div className="og-framework-label">{"// the framework — decoded"}</div>

      <div className="og-acronym-grid">
        {SADRAT_ENTRIES.map((entry, index) => (
          <Fragment key={entry.letter + index}>
            <div className={`og-acro-letter ${index === SADRAT_ENTRIES.length - 1 ? "border-b-0" : ""}`}>
              {entry.letter}
            </div>
            <div className={`og-acro-def ${index === SADRAT_ENTRIES.length - 1 ? "border-b-0" : ""}`}>
              <span className="og-acro-word">{entry.word}</span>
              <span className="og-acro-note">{entry.note}</span>
            </div>
          </Fragment>
        ))}
      </div>

      <div className="og-callout">
        <div className="og-callout-label">{"// historical precedent: the track record"}</div>

        {/* Incident 1: MKUltra */}
        <p className="mb-4">
          <span className="og-redline">ITEM 01: PROJECT MKULTRA (1953-1973).</span> A two-decade program dosing
          unwitting civilians with LSD and sensory deprivation under the banner of &quot;mind control.&quot; Director
          Richard Helms ordered the files shredded in 1973 to evade oversight. A single filing error saved a box of
          documents—the only reason we know it happened.
        </p>

        {/* Incident 2: Post-9/11 Interrogation */}
        <p>
          <span className="og-redline">ITEM 02: THE WHISTLEBLOWER (2007).</span> Thirty years later, John Kiriakou
          confirmed the agency was waterboarding detainees at black sites. He was the only person prosecuted in
          connection with the torture program. Not for the waterboarding itself, but for confirming to the public that
          it was agency policy.
        </p>
      </div>

      <div className="og-body">
        <p>
          We used their framework because it is{" "}
          <span className="og-highlight">genuinely effective behavioral psychology</span>, which is how they got away
          with everything else. The difference is that Omega Gaming is a smart contract. The rules are on-chain. There
          is no file to destroy. There is no asset to burn. There is no Langley.
        </p>
        <p>
          The ledger doesn&apos;t lie. <span className="og-highlight">It never has.</span>
        </p>
      </div>

      <Link href="/" className="og-cta">
        ← Return to Operations
      </Link>
      <div className="og-footnote">
        <p className="og-footnote-header">[SUPPLEMENTAL INTEL: THE M.I.C.E. MATRIX]</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-90">
          <div>
            <span className="og-highlight">MONEY:</span> The ETH prize pool. In Langley, it&apos;s a suitcase of
            non-sequential bills. Here, it&apos;s an on-chain bounty for your participation.
          </div>
          <div>
            <span className="og-highlight">IDEOLOGY:</span> Decentralization isn&apos;t just a tech stack; it&apos;s the
            belief that the ledger shouldn&apos;t have an editor-in-chief.
          </div>
          <div>
            <span className="og-highlight">COERCION:</span> Zero leverage required. We don&apos;t need your secrets when
            the smart contract enforces the rules with cold, mathematical indifference.
          </div>
          <div>
            <span className="og-highlight">EGO:</span> You&apos;re Operative #506. You have the clearance and the spot,
            yet you&apos;re still down here in the footnotes looking for the &quot;why.&quot;
          </div>
        </div>
        <div className="mt-4 text-[9px] uppercase tracking-[0.3em] text-red-900/50">
          {"// encryption active. transparency ends here."}
        </div>
      </div>
    </div>
  );
}
