"use client";

import Link from "next/link";
import "./SadratDisclosure.css";

const SADRAT_ENTRIES = [
  {
    letter: "S",
    word: "Spot",
    note: "Identify potential recruits. CIA ops: foreign nationals with access to state secrets. Here: anyone with a wallet and a suspicious amount of free time on a Tuesday.",
  },
  {
    letter: "A",
    word: "Assess",
    note: "Profile the target's motivations, vulnerabilities, and pressure points. We assessed: you are here, reading this. That was enough.",
  },
  {
    letter: "D",
    word: "Develop",
    note: "Build a relationship. Establish trust. We built a design system and wrote copy in the voice of a burned field officer with nothing left to lose. Same energy.",
  },
  {
    letter: "R",
    word: "Recruit",
    note: "Make the ask. Enter the lottery. Claim the clearance. The smart contract will not blackmail you afterward. This is verifiable.",
  },
  {
    letter: "A",
    word: "Agent",
    note: "You are now an operative with on-chain proof of participation. Unlike most CIA assets, you are actually on the payroll.",
  },
  {
    letter: "T",
    word: "Terminate",
    note: "CIA definition: burn the asset when convenient; deny all involvement; shred the files. Our definition: the lottery window closes. No one disappears.",
  },
];

export default function SadratDisclosure() {
  return (
    <div className="og-sadrat-page">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="og-sadrat-header">
        <div className="og-sadrat-stamp">VOLUNTARILY DECLASSIFIED</div>
        <p className="og-sadrat-eyebrow">{"// operational transparency memo"}</p>

        <div className="og-sadrat-badge-row">
          {["SADRAT", "MICE", "NOT MKULTRA", "WE PROMISE"].map(b => (
            <span
              key={b}
              className={`og-sadrat-badge${b === "SADRAT" || b === "MICE" ? " og-sadrat-badge--active" : ""}`}
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* ── Intro body ───────────────────────────────────── */}
      <div className="og-sadrat-body">
        <p>
          The Chronicle recruitment copy you just read was written using <span className="og-sadrat-hl">SADRAT</span> —
          a behavioral influence framework developed and deployed by the Central Intelligence Agency to identify and
          manipulate foreign assets into betraying their countries, their colleagues, and occasionally their own
          families.
        </p>
        <p>
          We are telling you this because, unlike the CIA,{" "}
          <span className="og-sadrat-hl">we disclose our methods.</span> This is not a low bar. It is, apparently, a bar
          the CIA has never once cleared in seventy-six years of operation.
        </p>
      </div>

      {/* ── SADRAT grid ──────────────────────────────────── */}
      <p className="og-sadrat-section-label">{"// the framework — decoded"}</p>

      <div className="og-sadrat-grid">
        {SADRAT_ENTRIES.map(({ letter, word, note }) => (
          <div key={letter + word} className="og-sadrat-row">
            <div className="og-sadrat-letter">{letter}</div>
            <div className="og-sadrat-def">
              <span className="og-sadrat-word">{word}</span>
              <span className="og-sadrat-note">{note}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── CIA callout ──────────────────────────────────── */}
      <div className="og-sadrat-callout">
        <p className="og-sadrat-callout-label">{"// for the record"}</p>
        <p>
          The CIA ran MKUltra — a program dosing unwitting civilians with LSD, electroshock, and sensory deprivation
          under the banner of &quot;mind control research&quot; — for <span className="og-sadrat-danger">21 years</span>{" "}
          before a filing error saved a box of documents from the 1973 purge. Director Richard Helms ordered the files
          destroyed. Most were. John Kiriakou, the officer who confirmed on record that the agency was waterboarding
          detainees, was the only person prosecuted. Not for the waterboarding. For telling a journalist it was
          happening.
        </p>
      </div>

      {/* ── Closer ───────────────────────────────────────── */}
      <div className="og-sadrat-body">
        <p>
          We used their framework because it is{" "}
          <span className="og-sadrat-hl">genuinely effective behavioral psychology</span>, which is exactly how they got
          away with everything else. The difference is that Omega Gaming is a smart contract. The rules are on-chain.
          There is no file to destroy. There is no asset to burn. There is no Langley.
        </p>
        <p>
          The ledger doesn&apos;t lie. <span className="og-sadrat-hl">It never has.</span>
        </p>
      </div>

      {/* ── CTA ──────────────────────────────────────────── */}
      <Link href="/" className="og-sadrat-cta">
        ← Return to Operations
      </Link>

      {/* ── MICE footnote ────────────────────────────────── */}
      <div className="og-sadrat-footnote">
        * MICE (Money, Ideology, Coercion, Ego) is the companion CIA recruitment framework also referenced in the
        Chronicle copy. It describes why people cooperate with intelligence agencies. Applied here — Money: ETH prize
        pool. Ideology: decentralization. Coercion: none, the contract enforces itself. Ego: Operative #506 has
        clearance and you are still reading the footnotes. {"\u00A0// transparency ends here."}
      </div>
    </div>
  );
}
