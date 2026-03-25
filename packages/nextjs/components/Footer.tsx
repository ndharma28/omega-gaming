"use client";

import Link from "next/link";
import { hardhat } from "viem/chains";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { EtherConverter } from "~~/components/EtherConverter";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

/**
 * Site footer
 */
export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <>
      {/* Dev tools bar — only visible on local network */}
      {isLocalNetwork && (
        <div className="fixed bottom-0 left-0 w-full z-10 pointer-events-none">
          <div className="flex justify-start items-center gap-2 p-3 pointer-events-auto">
            <EtherConverter />
            <Faucet />
            <Link
              href="/blockexplorer"
              passHref
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-700 bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all duration-200 backdrop-blur-sm"
            >
              <MagnifyingGlassIcon className="h-3.5 w-3.5" />
              Block Explorer
            </Link>
          </div>
        </div>
      )}

      {/* Footer bar */}
      <footer className="w-full border-t border-slate-800 bg-slate-900/60 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Left: branding */}
          <div className="flex items-center gap-2">
            <span className="text-base">🎱</span>
            <span className="text-sm font-semibold text-slate-400 tracking-tight">Omega Gaming</span>
            <span className="hidden sm:inline text-slate-700 text-xs">·</span>
            <span className="hidden sm:inline text-xs text-slate-600">Decentralized Lottery on Ethereum</span>
          </div>

          {/* Right: links */}
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <a
              href="https://github.com/scaffold-eth/se-2"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-400 transition-colors duration-200"
            >
              GitHub
            </a>
            <span className="text-slate-800">·</span>
            <a
              href="https://buidlguidl.com/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-400 transition-colors duration-200"
            >
              BuidlGuidl
            </a>
            <span className="text-slate-800">·</span>
            <a
              href="https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-400 transition-colors duration-200"
            >
              Support
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};
