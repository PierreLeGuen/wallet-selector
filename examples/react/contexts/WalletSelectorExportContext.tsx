import type { WalletSelectorModal } from "@near-finance-near-wallet-selector/account-export";
import { setupExportSelectorModal } from "@near-finance-near-wallet-selector/account-export";
import { setupCoin98Wallet } from "@near-finance-near-wallet-selector/coin98-wallet";
import type {
  AccountState,
  WalletSelector,
} from "@near-finance-near-wallet-selector/core";
import { setupWalletSelector } from "@near-finance-near-wallet-selector/core";
import { setupHereWallet } from "@near-finance-near-wallet-selector/here-wallet";
import { setupLedger } from "@near-finance-near-wallet-selector/ledger";
import { setupMathWallet } from "@near-finance-near-wallet-selector/math-wallet";
import { setupMeteorWallet } from "@near-finance-near-wallet-selector/meteor-wallet";
import { setupMyNearWallet } from "@near-finance-near-wallet-selector/my-near-wallet";
import { setupNearWallet } from "@near-finance-near-wallet-selector/near-wallet";
import { setupNearFi } from "@near-finance-near-wallet-selector/nearfi";
import { setupNightly } from "@near-finance-near-wallet-selector/nightly";
import { setupNightlyConnect } from "@near-finance-near-wallet-selector/nightly-connect";
import { setupOptoWallet } from "@near-finance-near-wallet-selector/opto-wallet";
import { setupSender } from "@near-finance-near-wallet-selector/sender";
import { setupWalletConnect } from "@near-finance-near-wallet-selector/wallet-connect";
import { setupWelldoneWallet } from "@near-finance-near-wallet-selector/welldone-wallet";
import type { ReactNode } from "react";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { distinctUntilChanged, map } from "rxjs";
import { Loading } from "../components/Loading";

declare global {
  interface Window {
    importSelector: WalletSelector;
    exportModal: WalletSelectorModal;
  }
}

interface ExportAccountSelectorContextValue {
  importSelector: WalletSelector;
  exportModal: WalletSelectorModal;
  accounts: Array<AccountState>;
  accountId: string | null;
}

const ExportAccountSelectorContext =
  React.createContext<ExportAccountSelectorContextValue | null>(null);

export const ExportAccountSelectorContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [importSelector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const init = useCallback(async () => {
    const _selector = await setupWalletSelector({
      network: "mainnet",
      debug: true,
      modules: [
        setupMyNearWallet(),
        setupLedger(),
        setupNearWallet(),
        setupSender(),
        setupMathWallet(),
        setupNightly(),
        setupMeteorWallet(),
        setupWelldoneWallet(),
        setupHereWallet(),
        setupCoin98Wallet(),
        setupNearFi(),
        setupOptoWallet(),
        setupWalletConnect({
          projectId: "c4f79cc...",
          metadata: {
            name: "NEAR Wallet Selector",
            description: "Example dApp used by NEAR Wallet Selector",
            url: "https://github.com/near/wallet-selector",
            icons: ["https://avatars.githubusercontent.com/u/37784886"],
          },
        }),
        setupNightlyConnect({
          url: "wss://relay.nightly.app/app",
          appMetadata: {
            additionalInfo: "",
            application: "NEAR Wallet Selector",
            description: "Example dApp used by NEAR Wallet Selector",
            icon: "https://near.org/wp-content/uploads/2020/09/cropped-favicon-192x192.png",
          },
        }),
      ],
    });
    /**
     * Insert list of accounts to be imported here
     * accounts: [{ accountId: "test.testnet", privateKey: "ed25519:..."}, ...]
     */
    const _modal = setupExportSelectorModal(_selector, {
      accounts: [],
      onComplete: (completeProps) => {
        console.log(
          `${completeProps.accounts} exported to ${completeProps.walletName}`
        );
      },
    });
    const state = _selector.store.getState();
    setAccounts(state.accounts);

    // this is added for debugging purpose only
    // for more information (https://github.com/near/wallet-selector/pull/764#issuecomment-1498073367)
    window.importSelector = _selector;
    window.exportModal = _modal;

    setSelector(_selector);
    setModal(_modal);
    setLoading(false);
  }, []);

  useEffect(() => {
    init().catch((err) => {
      console.error(err);
      alert("Failed to initialise wallet selector");
    });
  }, [init]);

  useEffect(() => {
    if (!importSelector) {
      return;
    }

    const subscription = importSelector.store.observable
      .pipe(
        map((state) => state.accounts),
        distinctUntilChanged()
      )
      .subscribe((nextAccounts) => {
        setAccounts(nextAccounts);
      });

    return () => subscription.unsubscribe();
  }, [importSelector]);

  const exportWalletSelectorContextValue =
    useMemo<ExportAccountSelectorContextValue>(
      () => ({
        importSelector: importSelector!,
        exportModal: modal!,
        accounts,
        accountId:
          accounts.find((account) => account.active)?.accountId || null,
      }),
      [importSelector, modal, accounts]
    );

  if (loading) {
    return <Loading />;
  }

  return (
    <ExportAccountSelectorContext.Provider
      value={exportWalletSelectorContextValue}
    >
      {children}
    </ExportAccountSelectorContext.Provider>
  );
};

export function useExportAccountSelector() {
  const context = useContext(ExportAccountSelectorContext);

  if (!context) {
    throw new Error(
      "useExportAccountSelector must be used within a ExportAccountSelectorContextProvider"
    );
  }

  return context;
}
