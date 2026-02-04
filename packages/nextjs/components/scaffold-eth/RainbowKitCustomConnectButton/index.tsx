"use client";

import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { RevealBurnerPKModal } from "./RevealBurnerPKModal";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Balance } from "@scaffold-ui/components";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

export const RainbowKitCustomConnectButton = () => {
  const networkColor = useNetworkColor();
  const { targetNetwork } = useTargetNetwork();
  const { isConnecting, isReconnecting } = useAccount();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        const blockExplorerAddressLink = account
          ? getBlockExplorerAddressLink(targetNetwork, account.address)
          : undefined;

        // 1. Show loading state during initial connection or wallet wake-up
        if (isConnecting || isReconnecting) {
          return <button className="btn btn-primary btn-sm loading">Connecting...</button>;
        }

        // 2. Show connect button if not connected
        if (!connected) {
          return (
            <button className="btn btn-primary btn-sm" onClick={openConnectModal} type="button">
              Connect Wallet
            </button>
          );
        }

        // 3. Show wrong network warning
        if (chain.unsupported || chain.id !== targetNetwork.id) {
          return <WrongNetworkDropdown />;
        }

        // 4. Show the full account info when connected correctly
        return (
          <>
            <div className="flex flex-col items-center mr-2">
              <Balance
                address={account.address as Address}
                style={{
                  minHeight: "0",
                  height: "auto",
                  fontSize: "0.8em",
                }}
              />
              <span className="text-xs" style={{ color: networkColor }}>
                {chain.name}
              </span>
            </div>
            <AddressInfoDropdown
              address={account.address as Address}
              displayName={account.displayName}
              ensAvatar={account.ensAvatar}
              blockExplorerAddressLink={blockExplorerAddressLink}
            />
            <AddressQRCodeModal address={account.address as Address} modalId="qrcode-modal" />
            <RevealBurnerPKModal />
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
