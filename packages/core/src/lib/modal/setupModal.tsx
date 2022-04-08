import React from "react";
import ReactDOM from "react-dom";

import { WalletSelector } from "../wallet-selector.types";
import { ModalOptions } from "./setupModal.types";
import { Modal } from "./Modal";
import { Store } from "../store.types";

const MODAL_ELEMENT_ID = "near-wallet-selector-modal";

export const setupModal = (
  selector: WalletSelector,
  store: Store,
  options?: ModalOptions
) => {
  const el = document.createElement("div");

  el.id = MODAL_ELEMENT_ID;
  document.body.appendChild(el);

  ReactDOM.render(
    <Modal selector={selector} store={store} options={options} />,
    document.getElementById(MODAL_ELEMENT_ID)
  );
};
