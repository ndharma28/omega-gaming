"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon, BugAntIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-yellow-950/40 text-yellow-500" : "text-slate-400"
              } hover:bg-yellow-950/30 hover:text-yellow-400 transition-all duration-200 py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col items-center`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

// ... (imports remain the same as previous)

export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const pathname = usePathname();
  const isChronicleActive = pathname === "/chronicle";
  const isSadratActive = pathname === "/sadrat-disclosure";

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky top-0 z-20 w-full border-b border-slate-800/60 bg-black/95 backdrop-blur-md shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-2">
          {/* Mobile Dropdown (same as before) */}
          <details className="dropdown lg:hidden" ref={burgerMenuRef}>
            <summary className="btn btn-ghost btn-sm hover:bg-slate-800/60 border-none">
              <Bars3Icon className="h-5 w-5 text-slate-300" />
            </summary>
            <ul
              className="menu menu-compact dropdown-content mt-3 p-2 shadow-xl bg-black border border-slate-800/60 rounded-xl w-52 gap-1"
              onClick={() => burgerMenuRef?.current?.removeAttribute("open")}
            >
              <HeaderMenuLinks />
              <div className="border-t border-slate-800/60 my-1"></div>
              <li>
                <Link
                  href="/sadrat-disclosure"
                  className="text-slate-400 hover:text-yellow-500 py-1.5 px-3 text-sm flex items-center gap-2"
                >
                  Sadrat Disclosure
                </Link>
              </li>
              <li>
                <Link
                  href="/chronicle"
                  className="text-yellow-600 hover:text-yellow-500 py-1.5 px-3 text-sm flex items-center gap-2"
                >
                  The Chronicle
                </Link>
              </li>
            </ul>
          </details>

          <Link href="/" passHref className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <span className="text-lg">🎱</span>
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-bold text-white tracking-tight">Omega Gaming</span>
              <span className="text-xs text-slate-500 tracking-wide">Decentralized Lottery</span>
            </div>
          </Link>

          <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-1 ml-4">
            <HeaderMenuLinks />
          </ul>
        </div>

        {/* Right: Sadrat + Chronicle + wallet */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            {/* Sadrat Disclosure Button - Now on the Left */}
            <Link
              href="/sadrat"
              className={`px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-widest uppercase transition-all duration-300
                ${
                  isSadratActive
                    ? "border-slate-600 bg-slate-800 text-white"
                    : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                }`}
            >
              Sadrat Disclosure
            </Link>

            {/* The Chronicle Button */}
            <Link
              href="/chronicle"
              className={`group relative px-3 py-1.5 rounded-full border transition-all duration-300 flex items-center gap-2
                ${
                  isChronicleActive
                    ? "border-yellow-600/60 bg-yellow-950/40 text-yellow-400"
                    : "border-yellow-800/40 bg-yellow-950/20 hover:bg-yellow-950/40 hover:border-yellow-700/50 text-yellow-600 hover:text-yellow-500"
                }`}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-30" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-600" />
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase">The Chronicle</span>
            </Link>
          </div>

          <RainbowKitCustomConnectButton />
          {isLocalNetwork && <FaucetButton />}
        </div>
      </div>
    </div>
  );
};
