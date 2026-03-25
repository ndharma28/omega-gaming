"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
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

export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const pathname = usePathname();
  const isChronicleActive = pathname === "/chronicle";

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky top-0 z-20 w-full border-b border-slate-800/60 bg-black/95 backdrop-blur-md shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-2">
          <details className="dropdown lg:hidden" ref={burgerMenuRef}>
            <summary className="btn btn-ghost btn-sm hover:bg-slate-800/60 border-none">
              <Bars3Icon className="h-5 w-5 text-slate-300" />
            </summary>
            <ul
              className="menu menu-compact dropdown-content mt-3 p-2 shadow-xl bg-black border border-slate-800/60 rounded-xl w-52"
              onClick={() => burgerMenuRef?.current?.removeAttribute("open")}
            >
              <HeaderMenuLinks />
              <li>
                <Link
                  href="/chronicle"
                  className="text-yellow-600 hover:text-yellow-500 hover:bg-yellow-950/30 transition-all duration-200 py-1.5 px-3 text-sm rounded-full flex items-center gap-2"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-40" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-600" />
                  </span>
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

        {/* Right: Chronicle + wallet */}
        <div className="flex items-center gap-3">
          <Link
            href="/chronicle"
            className={`group hidden sm:flex relative px-4 py-1.5 rounded-full border transition-all duration-300 items-center gap-2
              ${
                isChronicleActive
                  ? "border-yellow-600/60 bg-yellow-950/40 text-yellow-400"
                  : "border-yellow-800/40 bg-yellow-950/20 hover:bg-yellow-950/40 hover:border-yellow-700/50 text-yellow-600 hover:text-yellow-500"
              }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-30" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-600" />
            </span>
            <span className="text-xs font-bold tracking-widest uppercase transition-colors">The Chronicle</span>
          </Link>

          <RainbowKitCustomConnectButton />
          {isLocalNetwork && <FaucetButton />}
        </div>
      </div>
    </div>
  );
};
