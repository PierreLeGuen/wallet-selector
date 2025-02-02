import type { Wallet } from "@near-finance-near-wallet-selector/core";
import type { ModuleState } from "@near-finance-near-wallet-selector/core";

type AlertMessageModalRouteParams = {
  module: ModuleState;
};

type WalletOptionsModalRouteParams = {
  wallet: Wallet;
};

export type DerivationPathModalRouteParams = {
  walletId: string;
};

type WalletNotInstalledModalRouteParams = {
  module: ModuleState;
};

type WalletNetworkChangedModalRouteParams = {
  wallet: Wallet;
};

type WalletConnectingModalRouteParams = {
  wallet: Wallet;
};

type WalletConnectedParams = {
  module: ModuleState | undefined;
};

type ScanQRCodeParams = {
  wallet: Wallet;
  uri: string | undefined;
};

type AlertMessageModalRoute = {
  name: "AlertMessage";
  params?: AlertMessageModalRouteParams;
};

type WalletOptionsModalRoute = {
  name: "WalletOptions";
  params?: WalletOptionsModalRouteParams;
};

type DerivationPathModalRoute = {
  name: "DerivationPath";
  params: DerivationPathModalRouteParams;
};

type WalletNotInstalledModalRoute = {
  name: "WalletNotInstalled";
  params?: WalletNotInstalledModalRouteParams;
};

type WalletNetworkChangedModalRoute = {
  name: "WalletNetworkChanged";
  params?: WalletNetworkChangedModalRouteParams;
};

type WalletConnectingModalRoute = {
  name: "WalletConnecting";
  params?: WalletConnectingModalRouteParams;
};

type WalletHome = {
  name: "WalletHome";
};

type WalletConnected = {
  name: "WalletConnected";
  params?: WalletConnectedParams;
};

type ScanQRCode = {
  name: "ScanQRCode";
  params?: ScanQRCodeParams;
};

export type ModalRoute =
  | AlertMessageModalRoute
  | WalletOptionsModalRoute
  | DerivationPathModalRoute
  | WalletNotInstalledModalRoute
  | WalletNetworkChangedModalRoute
  | WalletConnectingModalRoute
  | WalletHome
  | WalletConnected
  | ScanQRCode;
