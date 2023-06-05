import type { OnInit } from "@angular/core";
import type { AccountState, WalletSelector } from "@near-finance-near-wallet-selector/core";
import { setupWalletSelector } from "@near-finance-near-wallet-selector/core";
import type { WalletSelectorModal } from "@near-finance-near-wallet-selector/modal-ui-js";
import { setupModal } from "@near-finance-near-wallet-selector/modal-ui-js";
import { setupNearWallet } from "@near-finance-near-wallet-selector/near-wallet";
import { setupSender } from "@near-finance-near-wallet-selector/sender";
import { setupXDEFI } from "@near-finance-near-wallet-selector/xdefi";
import { setupMathWallet } from "@near-finance-near-wallet-selector/math-wallet";
import { setupNightly } from "@near-finance-near-wallet-selector/nightly";
import { setupMeteorWallet } from "@near-finance-near-wallet-selector/meteor-wallet";
import { setupNarwallets } from "@near-finance-near-wallet-selector/narwallets";
import { setupWelldoneWallet } from "@near-finance-near-wallet-selector/welldone-wallet";
import { setupHereWallet } from "@near-finance-near-wallet-selector/here-wallet";
import { setupCoin98Wallet } from "@near-finance-near-wallet-selector/coin98-wallet";
import { setupNearFi } from "@near-finance-near-wallet-selector/nearfi";
import { setupNearSnap } from "@near-finance-near-wallet-selector/near-snap";
import { setupNeth } from "@near-finance-near-wallet-selector/neth";
import { setupOptoWallet } from "@near-finance-near-wallet-selector/opto-wallet";
import { setupFinerWallet } from "@near-finance-near-wallet-selector/finer-wallet";
import { setupWalletConnect } from "@near-finance-near-wallet-selector/wallet-connect";
import { setupNightlyConnect } from "@near-finance-near-wallet-selector/nightly-connect";
import { Component } from "@angular/core";
import { setupMyNearWallet } from "@near-finance-near-wallet-selector/my-near-wallet";
import { setupLedger } from "@near-finance-near-wallet-selector/ledger";
import { CONTRACT_ID } from "../../../constants";

declare global {
  interface Window {
    selector: WalletSelector;
    modal: WalletSelectorModal;
  }
}

@Component({
  selector: "near-wallet-selector-wallet-selector",
  templateUrl: "./wallet-selector.component.html",
  styleUrls: ["./wallet-selector.component.scss"],
})
export class WalletSelectorComponent implements OnInit {
  selector: WalletSelector;
  modal: WalletSelectorModal;
  accountId: string | null;
  accounts: Array<AccountState> = [];

  async ngOnInit() {
    await this.initialize().catch((err) => {
      console.error(err);
      alert("Failed to initialise wallet selector");
    });
  }

  async initialize() {
    const _selector = await setupWalletSelector({
      network: "testnet",
      debug: true,
      modules: [
        setupMyNearWallet(),
        setupLedger(),
        setupNearWallet(),
        setupSender(),
        setupXDEFI(),
        setupMathWallet(),
        setupNightly(),
        setupMeteorWallet(),
        setupNarwallets(),
        setupWelldoneWallet(),
        setupHereWallet(),
        setupCoin98Wallet(),
        setupNearFi(),
        setupNearSnap(),
        setupNeth({
          bundle: false,
        }),
        setupOptoWallet(),
        setupFinerWallet(),
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

    this.accounts = state.accounts;
    this.accountId =
      state.accounts.find((account) => account.active)?.accountId || null;

    window.selector = _selector;
    window.modal = _modal;

    this.selector = _selector;
    this.modal = _modal;
  }
}
