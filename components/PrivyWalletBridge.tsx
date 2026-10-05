"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import type { SendTransactionOptions } from "@solana/wallet-adapter-base";
import {
  useSignMessage,
  useSignTransaction,
  useStandardWallets,
  useWallets,
} from "@privy-io/react-auth/solana";
import type { Wallet } from "@wallet-standard/base";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { PRIVY_SOLANA_CHAIN, privyAppId } from "@/lib/privy-devnet";
import { PRIVY_WALLET_NAME } from "@/lib/privy-embedded-adapter";
import { registerWallet } from "@/lib/privy-register-wallet";
import {
  serializeTransactionForPrivy,
  signatureBytesFromPrivy,
  signedBytesToTransaction,
} from "@/lib/privy-tx-codec";
import {
  getPrivyWalletDelegate,
  setPrivyWalletDelegate,
} from "@/lib/privy-wallet-delegate";

/** One registration per address. Wallet Standard ignores a second copy of the same object. */
const registeredKeys = new Set<string>();

export type PrivySendTransaction = (
  transaction: Transaction | VersionedTransaction,
  connection: Connection,
  options?: SendTransactionOptions,
) => Promise<string>;

export type PrivyTxOverride = {
  anchorWallet: AnchorWallet;
  sendTransaction: PrivySendTransaction;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
};

const PrivyTxContext = createContext<PrivyTxOverride | null>(null);

/**
 * Wallet-adapter's standard adapter omits `chain` on signTransaction.
 * Privy's standard wallet then defaults that call to solana:mainnet.
 * When the selected wallet is Privy, Anchor and keeper signing use this
 * bridge and pass solana:devnet explicitly.
 */
export function PrivyWalletBridge({ children }: { children: ReactNode }) {
  const { wallets: standardWallets } = useStandardWallets();
  const { wallets } = useWallets();
  const { signMessage: privySignMessage } = useSignMessage();
  const { signTransaction: privySignTransaction } = useSignTransaction();
  const { wallet: selected } = useWallet();

  const embedded = useMemo(
    () => wallets.find((w) => w.standardWallet.name === "Privy") ?? null,
    [wallets],
  );

  const embeddedRef = useRef(embedded);
  embeddedRef.current = embedded;
  const signMessageRef = useRef(privySignMessage);
  signMessageRef.current = privySignMessage;
  const signTransactionRef = useRef(privySignTransaction);
  signTransactionRef.current = privySignTransaction;
  const standardRef = useRef(standardWallets);
  standardRef.current = standardWallets;

  const privyStandard = useMemo(
    () =>
      standardWallets.find(
        (wallet) => wallet.name === "Privy" && "privy:" in wallet.features,
      ) ?? null,
    [standardWallets],
  );
  const registerKey = privyStandard
    ? privyStandard.accounts[0]?.address || "pending"
    : "";

  useEffect(() => {
    if (!registerKey) return;
    // WalletProvider subscribes to register events in an effect. A timeout
    // lets that listener attach before we dispatch, or the wallet is stored
    // and never announced.
    const handle = window.setTimeout(() => {
      const wallet = standardRef.current.find(
        (item) => item.name === "Privy" && "privy:" in item.features,
      );
      if (!wallet) return;
      if (registeredKeys.has(registerKey)) return;
      registerWallet(wallet as unknown as Wallet);
      registeredKeys.add(registerKey);
    }, 0);
    return () => window.clearTimeout(handle);
  }, [registerKey]);

  useEffect(() => {
    const current = embeddedRef.current;
    if (!current) {
      setPrivyWalletDelegate(null);
      return;
    }
    setPrivyWalletDelegate({
      address: current.address,
      signMessage: async (message) => {
        const wallet = embeddedRef.current;
        if (!wallet) throw new Error("Brak portfela Privy.");
        const { signature } = await signMessageRef.current({
          message,
          wallet,
        });
        return signatureBytesFromPrivy(signature);
      },
      signTransactionBytes: async (serialized) => {
        const wallet = embeddedRef.current;
        if (!wallet) throw new Error("Brak portfela Privy.");
        const { signedTransaction } = await signTransactionRef.current({
          transaction: serialized,
          wallet,
          chain: PRIVY_SOLANA_CHAIN,
        });
        if (
          !(signedTransaction instanceof Uint8Array) ||
          signedTransaction.byteLength === 0
        ) {
          throw new Error("Privy nie zwrócił podpisanej transakcji.");
        }
        return signedTransaction;
      },
    });
    return () => setPrivyWalletDelegate(null);
  }, [embedded?.address]);

  const selectedAddress = selected?.adapter.publicKey?.toBase58() ?? null;
  const privySelected = selected?.adapter.name === PRIVY_WALLET_NAME;
  const address =
    privySelected && embedded && embedded.address === selectedAddress
      ? embedded.address
      : null;

  const override = useMemo<PrivyTxOverride | null>(() => {
    if (!address) return null;
    const publicKey = new PublicKey(address);

    async function requireDelegate() {
      const delegate = getPrivyWalletDelegate();
      if (!delegate || delegate.address !== publicKey.toBase58()) {
        throw new Error("Portfel Privy nie jest gotowy do podpisu.");
      }
      return delegate;
    }

    const anchorWallet: AnchorWallet = {
      publicKey,
      async signTransaction(transaction) {
        const delegate = await requireDelegate();
        const signed = await delegate.signTransactionBytes(
          serializeTransactionForPrivy(transaction),
        );
        return signedBytesToTransaction(transaction, signed, publicKey);
      },
      async signAllTransactions(transactions) {
        const signed = [];
        for (const transaction of transactions) {
          signed.push(await anchorWallet.signTransaction(transaction));
        }
        return signed;
      },
    };

    const sendTransaction: PrivySendTransaction = async (
      transaction,
      connection,
      options,
    ) => {
      const { signers, ...sendOptions } = options ?? {};
      if (transaction instanceof VersionedTransaction) {
        if (signers?.length) transaction.sign(signers);
      } else {
        if (!transaction.feePayer) transaction.feePayer = publicKey;
        if (!transaction.recentBlockhash) {
          const latest = await connection.getLatestBlockhash("confirmed");
          transaction.recentBlockhash = latest.blockhash;
          transaction.lastValidBlockHeight = latest.lastValidBlockHeight;
        }
        if (signers?.length) transaction.partialSign(...signers);
      }
      const signedTx = await anchorWallet.signTransaction(transaction);
      const raw = signedTx.serialize();
      return connection.sendRawTransaction(
        raw instanceof Uint8Array ? raw : new Uint8Array(raw),
        sendOptions,
      );
    };

    return {
      anchorWallet,
      sendTransaction,
      signMessage: async (message) => {
        const delegate = await requireDelegate();
        return delegate.signMessage(message);
      },
    };
  }, [address]);

  return (
    <PrivyTxContext.Provider value={override}>{children}</PrivyTxContext.Provider>
  );
}

export function usePrivyTxOverride(): PrivyTxOverride | null {
  return useContext(PrivyTxContext);
}

/** Keeper signatures. Phantom and Solflare keep useWallet().signMessage. */
export function useKeeperSignMessage():
  | ((message: Uint8Array) => Promise<Uint8Array>)
  | undefined {
  const { signMessage, wallet } = useWallet();
  const privy = useContext(PrivyTxContext);
  if (wallet?.adapter.name === PRIVY_WALLET_NAME && privy?.signMessage) {
    return privy.signMessage;
  }
  return signMessage;
}

export function privyWalletEnabled(): boolean {
  return privyAppId().length > 0;
}
