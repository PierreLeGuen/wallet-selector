import { sha256 } from "js-sha256";
import { utils } from "near-api-js";
import * as borsh from "borsh";
import type { VerifySignatureParams } from "./verify-signature.types";
import { Payload, payloadSchema } from "./payload";

// Reference: https://github.com/near/NEPs/blob/master/neps/nep-0413.md#references
export const verifySignature = ({
  publicKey,
  signature,
  message,
  nonce,
  recipient,
  callbackUrl,
}: VerifySignatureParams): boolean => {
  // Reconstruct the payload that was **actually signed**
  const payload = new Payload({ message, nonce, recipient, callbackUrl });

  const broshPayload = borsh.serialize(payloadSchema, payload);
  const toSign = Uint8Array.from(sha256.array(broshPayload));

  // Reconstruct the signature from the parameter given in the URL
  const realSignature = Buffer.from(signature, "base64");

  // Use the public Key to verify that the private-counterpart signed the message
  const myPK = utils.PublicKey.from(publicKey);
  return myPK.verify(toSign, realSignature);
};
