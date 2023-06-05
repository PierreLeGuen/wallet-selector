import type { WalletModuleFactory } from "@near-finance-near-wallet-selector/core";

export const setupDefaultWallets = async (): Promise<
  Array<WalletModuleFactory>
> => {
  return [];
};
