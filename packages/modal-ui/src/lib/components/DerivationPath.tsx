import type {
  HardwareWallet,
  HardwareWalletAccount,
  Wallet,
  WalletSelector,
} from "@near-finance-near-wallet-selector/core";
import { translate } from "@near-finance-near-wallet-selector/core";
import React, { Fragment, useState } from "react";
import type { ModalOptions } from "../modal.types";
import { BackArrow } from "./BackArrow";
import HardwareWalletAccountsForm from "./HardwareWalletAccountsForm";
import type { DerivationPathModalRouteParams } from "./Modal.types";
import { ModalHeader } from "./ModalHeader";
import { WalletConnecting } from "./WalletConnecting";
import { DownArrowIcon } from "./icons/DownArrowIcon";
import { LedgerDeviceIcon } from "./icons/LedgerDeviceIcon";
import { UpArrowIcon } from "./icons/UpArrowIcon";

interface DerivationPathProps {
  selector: WalletSelector;
  options: ModalOptions;
  onBack: () => void;
  onConnected: () => void;
  params: DerivationPathModalRouteParams;
  onError: (message: string, wallet: Wallet) => void;
  onCloseModal: () => void;
}

type Key = {
  public_key: string;
  account_id: string;
  permission_kind: "FULL_ACCESS" | "FUNCTION_CALL";
  created: {
    transaction_hash: string;
    block_timestamp: number;
  };
  deleted: {
    transaction_hash: string | null;
    block_timestamp: number | null;
  };
};

type KeysResponse = {
  keys: Array<Key>;
};

export type HardwareWalletAccountState = HardwareWalletAccount & {
  selected: boolean;
};

export type HardwareRoutes =
  | "EnterDerivationPath"
  | "SpecifyHDPath"
  | "NoAccountsFound"
  | "ChooseAccount"
  | "AddCustomAccountId"
  | "OverviewAccounts";

const DEFAULT_DERIVATION_PATH = "44'/397'/0'/0'/1'";

export const DerivationPath: React.FC<DerivationPathProps> = ({
  selector,
  options,
  onBack,
  onConnected,
  params,
  onError,
  onCloseModal,
}) => {
  const [route, setRoute] = useState<HardwareRoutes>("EnterDerivationPath");
  const [derivationPath, setDerivationPath] = useState<string>(
    DEFAULT_DERIVATION_PATH
  );
  const [customDerivationPath, setCustomDerivationPath] = useState(1);
  const [accounts, setAccounts] = useState<Array<HardwareWalletAccountState>>(
    []
  );
  const [selectedAccounts, setSelectedAccounts] = useState<
    Array<HardwareWalletAccountState>
  >([]);

  const [hardwareWallet, setHardwareWallet] = useState<Wallet>();
  const [customAccountId, setCustomAccountId] = useState("");
  const [connecting, setConnecting] = useState(false);

  const initalHeaderTitle = translate("modal.ledger.connectWithLedger");
  const [headerTitle, setHeaderTitle] = useState(initalHeaderTitle);

  const getAccountIds = async (publicKey: string): Promise<Array<string>> => {
    const response: Response = await fetch(
      `${
        selector?.options.network.indexerUrl || ""
      }/publicKey/ed25519:${publicKey}/accounts`
    );

    if (!response.ok) {
      throw new Error("Failed to get account id from public key");
    }

    let accountIds = (await response.json()) as Array<string>;

    const responseNearblocks: Response = await fetch(
      `https://api.nearblocks.io/v1/keys/ed25519:${publicKey}`
    );
    const keysResp = (await responseNearblocks.json()) as KeysResponse;

    accountIds = accountIds.concat(keysResp.keys.map((key) => key.account_id));

    // console.log("accountIds", accountIds);

    if (!Array.isArray(accountIds) || !accountIds.length) {
      return [];
    }

    return accountIds;
  };

  const resolveAccounts = async (
    wallet: Wallet
  ): Promise<Array<HardwareWalletAccountState> | null> => {
    const publicKey = await (wallet as HardwareWallet).getPublicKey(
      derivationPath
    );
    try {
      const accountIds = await getAccountIds(publicKey);

      return accountIds.map((accountId, index) => {
        return {
          derivationPath,
          publicKey,
          accountId,
          selected: index === 0,
        };
      });
    } catch (e) {
      return null;
    }
  };

  const handleValidateAccount = async () => {
    const wallet = await selector.wallet(params.walletId);

    if (wallet.type !== "hardware") {
      return;
    }

    setConnecting(true);
    setHardwareWallet(wallet);

    try {
      const resolvedAccounts = await resolveAccounts(wallet);
      if (!resolvedAccounts) {
        setRoute("AddCustomAccountId");
        return;
      }

      // const noAccounts = resolvedAccounts.length === 0;

      // if (noAccounts) {
      //   setHeaderTitle(translate("modal.ledger.noAccountsFound"));
      //   setRoute("NoAccountsFound");
      //   return;
      // }
      setAccounts(resolvedAccounts);

      setSelectedAccounts(resolvedAccounts);
      setRoute("OverviewAccounts");
    } catch (err) {
      setConnecting(false);
      const message =
        err instanceof Error ? err.message : "Something went wrong";

      onError(message, wallet);
    } finally {
      setConnecting(false);
    }
  };

  const handleAddCustomAccountId = async () => {
    try {
      setConnecting(true);

      const publicKey = await (hardwareWallet as HardwareWallet).getPublicKey(
        derivationPath
      );
      const accountList = [
        {
          derivationPath: derivationPath,
          publicKey,
          accountId: customAccountId,
          selected: true,
        },
      ];
      setAccounts(accountList);
      setSelectedAccounts(accountList);
      setHeaderTitle(translate("modal.ledger.connecting1Account"));
      setRoute("OverviewAccounts");
    } catch (err) {
      setConnecting(false);
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      onError(message, hardwareWallet!);
    } finally {
      setConnecting(false);
    }
  };

  const handleSignIn = () => {
    const mapAccounts = selectedAccounts.map(
      (account: HardwareWalletAccount) => {
        return {
          derivationPath: account.derivationPath,
          publicKey: account.publicKey,
          accountId: account.accountId,
        };
      }
    );

    return hardwareWallet!
      .signIn({
        contractId: options.contractId,
        methodNames: options.methodNames,
        accounts: mapAccounts,
      })
      .then(() => onConnected())
      .catch((err) => {
        onError(`Error: ${err.message}`, hardwareWallet!);
      });
  };

  const handleOnBackButtonClick = () => {
    if (
      route === "SpecifyHDPath" ||
      route === "NoAccountsFound" ||
      route === "ChooseAccount"
    ) {
      setHeaderTitle(translate("modal.ledger.connectWithLedger"));
      setRoute("EnterDerivationPath");
    }

    if (route === "OverviewAccounts") {
      setHeaderTitle(translate("modal.ledger.selectYourAccounts"));
      setRoute("ChooseAccount");
    }
  };

  if (connecting) {
    return (
      <div className="derivation-path-wrapper">
        <WalletConnecting
          wallet={hardwareWallet}
          onBack={() => {
            setConnecting(false);
          }}
          onCloseModal={onCloseModal}
        />
      </div>
    );
  }

  return (
    <Fragment>
      <div className="nws-modal-header-wrapper">
        {(route === "SpecifyHDPath" ||
          route === "NoAccountsFound" ||
          route === "ChooseAccount" ||
          route === "OverviewAccounts") && (
          <BackArrow onClick={handleOnBackButtonClick} />
        )}
        <ModalHeader title={headerTitle} onCloseModal={onCloseModal} />
      </div>
      <div className="derivation-path-wrapper">
        {route === "EnterDerivationPath" && (
          <div className="enter-derivation-path">
            <div className="ledger-image">
              <LedgerDeviceIcon />
            </div>
            <div className="ledger-description">
              <p>{translate("modal.ledger.makeSureYourLedger")}</p>
              <p
                className="specify-path"
                onClick={() => {
                  setHeaderTitle(translate("modal.ledger.specifyHDPath"));
                  setRoute("SpecifyHDPath");
                }}
              >
                {translate("modal.ledger.specifyHDPath")}
              </p>
            </div>
            <div className="action-buttons">
              <button className="middleButton" onClick={handleValidateAccount}>
                {translate("modal.ledger.continue")}
              </button>
            </div>
          </div>
        )}

        {route === "SpecifyHDPath" && (
          <div className="specify-path-wrapper">
            <div className="change-path-wrapper">
              <div className="display-path">
                <span>{derivationPath.slice(0, -2)}</span>
              </div>
              <div className="change-path">
                <div className="path-value">
                  <span>{customDerivationPath}</span>
                </div>
                <div className="buttons-wrapper">
                  <button
                    onClick={() => {
                      const newValue = customDerivationPath + 1;
                      const path = derivationPath.slice(0, -2);
                      setDerivationPath(`${path}${newValue}'`);
                      setCustomDerivationPath(newValue);
                    }}
                  >
                    <UpArrowIcon />
                  </button>

                  <button
                    onClick={() => {
                      const newValue = customDerivationPath - 1;

                      if (newValue < 0) {
                        return;
                      }

                      const path = derivationPath.slice(0, -2);
                      setDerivationPath(`${path}${newValue}'`);
                      setCustomDerivationPath(newValue);
                    }}
                  >
                    <DownArrowIcon />
                  </button>
                </div>
              </div>
            </div>
            <p className="path-description">
              {translate("modal.ledger.enterYourPreferredHDPath")}
            </p>
            <p className="what-link">
              <a
                href="https://www.ledger.com/academy/crypto/what-are-hierarchical-deterministic-hd-wallets"
                target="_blank"
              >
                What's this?
              </a>
            </p>
            <div className="action-buttons">
              <button className="middleButton" onClick={handleValidateAccount}>
                {translate("modal.ledger.scan")}
              </button>
            </div>
          </div>
        )}

        {route === "NoAccountsFound" && (
          <div className="no-accounts-found-wrapper">
            <p>
              {translate("modal.ledger.cantFindAnyAccount")}{" "}
              <a
                href={`https://${
                  selector.options.network.networkId === "testnet"
                    ? "testnet"
                    : "app"
                }.mynearwallet.com/create`}
                target="_blank"
              >
                MyNearWallet
              </a>{" "}
              {translate("modal.ledger.orConnectAnAnotherLedger")}
            </p>
          </div>
        )}

        {route === "ChooseAccount" && (
          <HardwareWalletAccountsForm
            accounts={accounts}
            onSelectedChanged={(index, selected) => {
              setAccounts((prevAccounts) => {
                const updateAccounts = prevAccounts.map((account, idx) => {
                  const selectedValue =
                    index === idx ? selected : account.selected;
                  return {
                    ...account,
                    selected: selectedValue,
                  };
                });
                return [...updateAccounts];
              });
            }}
            onSubmit={(acc, e) => {
              e.preventDefault();
              const selectedAcc = acc.filter((account) => account.selected);
              setSelectedAccounts(selectedAcc);

              const numberOfAccounts = selectedAcc.length;
              setHeaderTitle(
                `${translate(
                  "modal.ledger.connecting"
                )} ${numberOfAccounts} ${translate("modal.ledger.ofAccounts")}`
              );
              setRoute("OverviewAccounts");
            }}
            onChangeRoute={(newRoute) => {
              if (newRoute === "SpecifyHDPath") {
                setHeaderTitle(translate("modal.ledger.specifyHDPath"));
              }
              setRoute(newRoute);
            }}
          />
        )}
        {route === "AddCustomAccountId" && (
          <div className="enter-custom-account">
            <p>{translate("modal.ledger.failedToAutomatically")}</p>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Account ID"
                value={customAccountId}
                onChange={(e) => {
                  setCustomAccountId(e.target.value);
                }}
              />
            </div>
            <div className="action-buttons">
              <button
                className="middleButton"
                onClick={handleAddCustomAccountId}
              >
                {translate("ledger.Continue")}
              </button>
            </div>
          </div>
        )}
        {route === "OverviewAccounts" && (
          <div className="overview-wrapper">
            <p>{translate("modal.ledger.overviewTheListOfAuthorized")}</p>
            <div>
              {accounts.length === 0 ? (
                <p>
                  Ledger public key is imported but no accounts were detected.
                  Wait for this Ledger public key to be linked to an account. Or
                  import a different wallet.
                </p>
              ) : (
                accounts.map((account) => {
                  return (
                    <div key={account.accountId}>
                      <span>{account.accountId}</span>
                    </div>
                  );
                })
              )}
            </div>
            <div className="action-buttons">
              <button className="middleButton" onClick={handleSignIn}>
                {translate("modal.ledger.finish")}
              </button>
            </div>
          </div>
        )}
      </div>
    </Fragment>
  );
};
