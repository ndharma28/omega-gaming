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
        <div className="og-callout-label">{"// for the record"}</div>
        <p>
          The CIA ran MKUltra — a program dosing unwitting civilians with LSD, electroshock, and sensory deprivation in
          the name of &quot;mind control research&quot; — for <span style={{ color: "#c8706a" }}>21 years</span> before
          it was exposed. They destroyed most of the files in 1973. John Kiriakou, the officer who confirmed the agency
          was waterboarding detainees, was the only person prosecuted. Not for the torture. For telling someone about
          it.
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
        * MICE (Money, Ideology, Coercion, Ego) is the companion CIA framework also referenced in the Chronicle copy. It
        describes why people cooperate with intelligence agencies. In our case — Money: ETH prize pool. Ideology:
        decentralization. Coercion: none, the contract enforces itself. Ego: Operative #506 has clearance and you are
        still reading the footnotes. &nbsp;&nbsp;{"// transparency ends here."}
      </div>
    </div>
  );
}
