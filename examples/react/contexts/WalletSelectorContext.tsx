import { setupCoin98Wallet } from "@near-finance-near-wallet-selector/coin98-wallet";
import type { AccountState, WalletSelector } from "@near-finance-near-wallet-selector/core";
import { setupWalletSelector } from "@near-finance-near-wallet-selector/core";
import { setupHereWallet } from "@near-finance-near-wallet-selector/here-wallet";
import { setupMathWallet } from "@near-finance-near-wallet-selector/math-wallet";
import { setupMeteorWallet } from "@near-finance-near-wallet-selector/meteor-wallet";
import type { WalletSelectorModal } from "@near-finance-near-wallet-selector/modal-ui";
import { setupModal } from "@near-finance-near-wallet-selector/modal-ui";
import { setupNarwallets } from "@near-finance-near-wallet-selector/narwallets";
import { setupNearSnap } from "@near-finance-near-wallet-selector/near-snap";
import { setupNearWallet } from "@near-finance-near-wallet-selector/near-wallet";
import { setupNearFi } from "@near-finance-near-wallet-selector/nearfi";
import { setupNightly } from "@near-finance-near-wallet-selector/nightly";
import { setupNightlyConnect } from "@near-finance-near-wallet-selector/nightly-connect";
import { setupSender } from "@near-finance-near-wallet-selector/sender";
import { setupWalletConnect } from "@near-finance-near-wallet-selector/wallet-connect";
import { setupWelldoneWallet } from "@near-finance-near-wallet-selector/welldone-wallet";
import { setupXDEFI } from "@near-finance-near-wallet-selector/xdefi";
import type { ReactNode } from "react";
import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { distinctUntilChanged, map } from "rxjs";

import { setupFinerWallet } from "@near-finance-near-wallet-selector/finer-wallet";
import { setupLedger } from "@near-finance-near-wallet-selector/ledger";
import { setupMyNearWallet } from "@near-finance-near-wallet-selector/my-near-wallet";
import { setupNeth } from "@near-finance-near-wallet-selector/neth";
import { setupOptoWallet } from "@near-finance-near-wallet-selector/opto-wallet";
import { Loading } from "../components/Loading";
import { CONTRACT_ID } from "../constants";

declare global {
  interface Window {
    selector: WalletSelector;
    modal: WalletSelectorModal;
  }
}

interface WalletSelectorContextValue {
  selector: WalletSelector;
  modal: WalletSelectorModal;
  accounts: Array<AccountState>;
  accountId: string | null;
}

const WalletSelectorContext =
  React.createContext<WalletSelectorContextValue | null>(null);

export const WalletSelectorContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const init = useCallback(async () => {
    const _selector = await setupWalletSelector({
      network: "testnet",
      debug: true,
      modules: [
        setupMyNearWallet(),
        setupLedger(),
        setupNearWallet(),
        setupSender(),
        setupMathWallet(),
        setupNightly(),
        setupMeteorWallet(),
        setupNearSnap(),
        setupNarwallets(),
        setupWelldoneWallet(),
        setupHereWallet(),
        setupCoin98Wallet(),
        setupNearFi(),
        setupNeth({
          gas: "300000000000000",
          bundle: false,
        }),
        setupOptoWallet(),
        setupFinerWallet(),
        setupXDEFI(),
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
    const _modal = setupModal(_selector, {
      contractId: CONTRACT_ID,
    });
    const state = _selector.store.getState();
    setAccounts(state.accounts);

    // this is added for debugging purpose only
    // for more information (https://github.com/near/wallet-selector/pull/764#issuecomment-1498073367)
    window.selector = _selector;
    window.modal = _modal;

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
    if (!selector) {
      return;
    }

    const subscription = selector.store.observable
      .pipe(
        map((state) => state.accounts),
        distinctUntilChanged()
      )
      .subscribe((nextAccounts) => {
        console.log("Accounts Update", nextAccounts);

        setAccounts(nextAccounts);
      });

    const onHideSubscription = modal!.on("onHide", ({ hideReason }) => {
      console.log(`The reason for hiding the modal ${hideReason}`);
    });

    return () => {
      subscription.unsubscribe();
      onHideSubscription.remove();
    };
  }, [selector, modal]);

  const walletSelectorContextValue = useMemo<WalletSelectorContextValue>(
    () => ({
      selector: selector!,
      modal: modal!,
      accounts,
      accountId: accounts.find((account) => account.active)?.accountId || null,
    }),
    [selector, modal, accounts]
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <WalletSelectorContext.Provider value={walletSelectorContextValue}>
      {children}
    </WalletSelectorContext.Provider>
  );
};

export function useWalletSelector() {
  const context = useContext(WalletSelectorContext);

  if (!context) {
    throw new Error(
      "useWalletSelector must be used within a WalletSelectorContextProvider"
    );
  }

  return context;
}
