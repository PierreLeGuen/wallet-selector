import type { ModuleState } from "@near-finance-near-wallet-selector/core";
import { translate } from "@near-finance-near-wallet-selector/core";
import React, { Fragment } from "react";
import { CloseButton } from "./CloseButton";
import type { ModalRoute } from "./Modal.types";
import { ConnectionSuccessIcon } from "./icons/ConnectionSuccessIcon";

interface WalletConnectedProps {
  module: ModuleState;
  onCloseModal: () => void;
  setRoute: (route: ModalRoute) => void;
}

export const WalletConnected: React.FC<WalletConnectedProps> = ({
  module,
  onCloseModal,
  setRoute,
}) => {
  return (
    <Fragment>
      <div className="nws-modal-header">
        <h3 className="middleTitle">{``}</h3>
        <CloseButton onClick={onCloseModal} />
      </div>
      <div className="connecting-wrapper">
        <div className="content">
          <div className="icon">
            <div className={"green-dot"}></div>
            <img src={module?.metadata.iconUrl} alt={module?.metadata.name} />
          </div>
          <h3 className="connecting-name">{module?.metadata.name}</h3>
          <div className="wallet-connected-success">
            <ConnectionSuccessIcon />
            <span>{translate("modal.wallet.connectionSuccessful")}</span>
          </div>
          {module.id === "ledger" ? (
            <div className="action-buttons">
              <button
                className="middleButton"
                onClick={() => {
                  setRoute({
                    name: "DerivationPath",
                    params: { walletId: module.id },
                  });
                }}
              >
                Reload wallets
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </Fragment>
  );
};
