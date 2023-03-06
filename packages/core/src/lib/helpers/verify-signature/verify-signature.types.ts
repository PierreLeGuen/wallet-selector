export interface VerifySignatureParams {
  publicKey: string;
  signature: string;
  message: string;
  nonce: Buffer;
  recipient: string;
  callbackUrl?: string;
}
