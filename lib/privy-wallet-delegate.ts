/**
 * The embedded-wallet adapter is constructed once, before the user logs in.
 * React hooks push the live Privy signer here when the embedded wallet exists.
 */
export type PrivyWalletDelegate = {
  address: string;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  signTransactionBytes: (serialized: Uint8Array) => Promise<Uint8Array>;
};

type Listener = () => void;

let current: PrivyWalletDelegate | null = null;
const listeners = new Set<Listener>();

export function getPrivyWalletDelegate(): PrivyWalletDelegate | null {
  return current;
}

export function setPrivyWalletDelegate(next: PrivyWalletDelegate | null): void {
  current = next;
  for (const listener of listeners) listener();
}

export function subscribePrivyDelegate(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
