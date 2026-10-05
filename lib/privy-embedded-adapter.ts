import {
  BaseMessageSignerWalletAdapter,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletReadyState,
  WalletSignTransactionError,
  type WalletName,
} from "@solana/wallet-adapter-base";
import {
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  getPrivyWalletDelegate,
  subscribePrivyDelegate,
  type PrivyWalletDelegate,
} from "@/lib/privy-wallet-delegate";
import {
  serializeTransactionForPrivy,
  signedBytesToTransaction,
} from "@/lib/privy-tx-codec";

export const PRIVY_WALLET_NAME = "Privy" as WalletName<"Privy">;

export const PRIVY_WALLET_ICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#141820"/><circle cx="16" cy="16" r="7" fill="#a78bfa"/></svg>`,
  );

/**
 * Not mounted in WalletProvider. Wallet Standard `registerWallet` is the only
 * list entry, so the modal shows Privy once. This class remains as the name
 * constant and a delegate signer if a caller constructs it explicitly.
 * Signing still goes through the Privy delegate with chain solana:devnet.
 */
export class PrivyEmbeddedWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = PRIVY_WALLET_NAME;
  url = "https://privy.io";
  icon = PRIVY_WALLET_ICON;
  readonly supportedTransactionVersions = new Set(["legacy", 0] as const);

  private _publicKey: PublicKey | null = null;
  private _connecting = false;
  private _readyState: WalletReadyState = WalletReadyState.Loadable;
  private readonly _unsubscribe: () => void;

  constructor() {
    super();
    this._unsubscribe = subscribePrivyDelegate(() => {
      this._syncReady();
      if (!this.connected) return;
      const delegate = getPrivyWalletDelegate();
      if (!delegate || delegate.address !== this._publicKey?.toBase58()) {
        this._publicKey = null;
        this.emit("disconnect");
      }
    });
    this._syncReady();
  }

  get publicKey() {
    return this._publicKey;
  }

  get connecting() {
    return this._connecting;
  }

  get readyState() {
    return this._readyState;
  }

  async connect(): Promise<void> {
    const delegate = getPrivyWalletDelegate();
    if (!delegate) {
      throw new WalletNotReadyError(
        "Log in with email or Google (Privy) first.",
      );
    }
    this._connecting = true;
    try {
      this._publicKey = new PublicKey(delegate.address);
      this.emit("connect", this._publicKey);
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (!this._publicKey) return;
    this._publicKey = null;
    this.emit("disconnect");
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
  ): Promise<T> {
    try {
      const delegate = this.#requireDelegate();
      const signed = await delegate.signTransactionBytes(
        serializeTransactionForPrivy(transaction),
      );
      return signedBytesToTransaction(
        transaction,
        signed,
        this._publicKey as PublicKey,
      );
    } catch (error) {
      if (error instanceof WalletSignTransactionError) throw error;
      const message = error instanceof Error ? error.message : String(error);
      throw new WalletSignTransactionError(message, error as Error);
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    const delegate = this.#requireDelegate();
    return delegate.signMessage(message);
  }

  private _syncReady() {
    const next = getPrivyWalletDelegate()
      ? WalletReadyState.Installed
      : WalletReadyState.Loadable;
    if (next === this._readyState) return;
    this._readyState = next;
    this.emit("readyStateChange", next);
  }

  #requireDelegate(): PrivyWalletDelegate {
    const delegate = getPrivyWalletDelegate();
    if (!this._publicKey || !delegate) throw new WalletNotConnectedError();
    if (delegate.address !== this._publicKey.toBase58()) {
      throw new WalletNotConnectedError();
    }
    return delegate;
  }
}
