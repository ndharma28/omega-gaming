import { Address } from "@scaffold-ui/components";
import { QRCodeSVG } from "qrcode.react";
import { Address as AddressType } from "viem";
import { hardhat } from "viem/chains";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

type AddressQRCodeModalProps = {
  address: AddressType;
  modalId: string;
};

export const AddressQRCodeModal = ({ address, modalId }: AddressQRCodeModalProps) => {
  const { targetNetwork } = useTargetNetwork();

  return (
    <>
      <div>
        <input type="checkbox" id={`${modalId}`} className="modal-toggle" />
        <label htmlFor={`${modalId}`} className="modal cursor-pointer backdrop-blur-sm bg-black/60">
          {/* Changed: Added bg-black, border-slate, and rounded corners to match your header */}
          <label className="modal-box relative bg-black border border-slate-800 shadow-2xl shadow-yellow-900/20 rounded-2xl">
            <input className="h-0 w-0 absolute top-0 left-0" />
            <label
              htmlFor={`${modalId}`}
              className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3 text-slate-400 hover:text-yellow-500"
            >
              ✕
            </label>
            <div className="space-y-3 py-6">
              <div className="flex flex-col items-center gap-6">
                {/* QR Code Background */}
                <div className="p-4 bg-white rounded-xl shadow-inner">
                  <QRCodeSVG value={address} size={220} />
                </div>

                {/* Wrapper to kill the pink: We force the text color here */}
                <div className="address-wrapper text-yellow-500 font-medium tracking-wide">
                  <Address
                    address={address}
                    format="long"
                    disableAddressLink
                    onlyEnsOrAddress
                    blockExplorerAddressLink={
                      targetNetwork.id === hardhat.id ? `/blockexplorer/address/${address}` : undefined
                    }
                  />
                </div>
              </div>
            </div>
          </label>
        </label>
      </div>
    </>
  );
};
