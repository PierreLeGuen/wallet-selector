import { resolveOptions } from "./options";
import { createStore } from "./store";
import type {
  WalletSelector,
  WalletSelectorEvents,
  WalletSelectorParams,
} from "./wallet-selector.types";
import { EventEmitter, Logger, Provider, WalletModules } from "./services";
import type { Wallet } from "./wallet";

export type WalletSelectorNetworks = {
  [networkId: string]: WalletSelector;
};

const walletSelectorInstances: WalletSelectorNetworks = {};

async function createWalletSelectorInstance(params: WalletSelectorParams) {
  const { options, storage } = resolveOptions(params);
  Logger.debug = options.debug;

  const emitter = new EventEmitter<WalletSelectorEvents>();
  const store = await createStore(storage, options.network);
  const walletModules = new WalletModules({
    factories: params.modules,
    storage,
    options,
    store,
    emitter,
    provider: new Provider(options.network.nodeUrl),
  });

  await walletModules.setup();

  walletSelectorInstances[options.network.networkId] = {
    options,
    store: store.toReadOnly(),
    wallet: async <Variation extends Wallet = Wallet>(id?: string) => {
      const { selectedWalletId } = store.getState();
      const wallet = await walletModules.getWallet<Variation>(
        id || selectedWalletId
      );

      if (!wallet) {
        if (id) {
          throw new Error("Invalid wallet id");
        }

        throw new Error("No wallet selected");
      }

      return wallet;
    },
    setActiveAccount: (accountId: string) => {
      const { accounts } = store.getState();

      if (!accounts.some((account) => account.accountId === accountId)) {
        throw new Error("Invalid account id");
      }

      store.dispatch({
        type: "SET_ACTIVE_ACCOUNT",
        payload: { accountId },
      });
    },
    isSignedIn() {
      const { accounts } = store.getState();

      return Boolean(accounts.length);
    },
    on: (eventName, callback) => {
      return emitter.on(eventName, callback);
    },
    off: (eventName, callback) => {
      emitter.off(eventName, callback);
    },
  };
}

export const setupWalletSelector = async (
  params: Array<WalletSelectorParams> | WalletSelectorParams
): Promise<WalletSelectorNetworks> => {
  if (params instanceof Array) {
    for (let i = 0; i < params.length; i++) {
      await createWalletSelectorInstance(params[i]);
    }
  } else {
    await createWalletSelectorInstance(params);
  }

  return walletSelectorInstances;
};
