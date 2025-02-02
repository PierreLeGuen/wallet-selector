# @near-finance-near-wallet-selector/xdefi

This is the [XDEFI](https://www.xdefi.io/) package for NEAR Wallet Selector.

## Installation and Usage

The easiest way to use this package is to install it from the NPM registry, this package requires `near-api-js` v1.0.0 or above:

```bash
# Using Yarn
yarn add near-api-js@^1.0.0

# Using NPM.
npm install near-api-js@^1.0.0
```
```bash
# Using Yarn
yarn add @near-finance-near-wallet-selector/xdefi

# Using NPM.
npm install @near-finance-near-wallet-selector/xdefi
```

Then use it in your dApp:

```ts
import { setupWalletSelector } from "@near-finance-near-wallet-selector/core";
import { setupXDEFI } from "@near-finance-near-wallet-selector/xdefi";

// XDEFI for Wallet Selector can be setup without any params or it can take one optional param.
const xdefi = setupXDEFI({
  iconUrl: "https://yourdomain.com/yourwallet-icon.png" //optional
});

const selector = await setupWalletSelector({
  network: "testnet",
  modules: [xdefi],
});
```

## Options

- `iconUrl`: (`string?`): Image URL for the icon shown in the modal. This can also be a relative path or base64 encoded image. Defaults to `./assets/xdefi-icon.png`.
- `deprecated`: (`boolean?`): Deprecated is optional. Default is `false`.

## Assets

Assets such as icons can be found in the `/assets` directory of the package. Below is an example using Webpack:

```ts
import { setupXDEFI } from "@near-finance-near-wallet-selector/xdefi";
import xdefiIconUrl from "@near-finance-near-wallet-selector/xdefi/assets/xdefi-icon.png";

const xdefi = setupXDEFI({
  iconUrl: xdefiIconUrl
});
```

## License

This repository is distributed under the terms of both the MIT license and the Apache License (Version 2.0).
