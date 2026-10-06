import type {
  Wallet,
  WalletEventsWindow,
  WindowRegisterWalletEvent,
  WindowRegisterWalletEventCallback,
} from "@wallet-standard/base";

/**
 * Documented Wallet Standard registration helper.
 * https://docs.privy.io/recipes/solana/standard-wallets
 */
class RegisterWalletEvent
  extends CustomEvent<WindowRegisterWalletEventCallback>
  implements WindowRegisterWalletEvent
{
  readonly #detail: WindowRegisterWalletEventCallback;

  get detail() {
    return this.#detail;
  }

  get type() {
    return "wallet-standard:register-wallet" as const;
  }

  constructor(callback: WindowRegisterWalletEventCallback) {
    super("wallet-standard:register-wallet", {
      bubbles: false,
      cancelable: false,
      detail: callback,
    });
    this.#detail = callback;
  }

  preventDefault(): never {
    throw new Error("preventDefault is not supported");
  }

  stopPropagation(): never {
    throw new Error("stopPropagation is not supported");
  }

  stopImmediatePropagation(): never {
    throw new Error("stopImmediatePropagation is not supported");
  }
}

export function registerWallet(wallet: Wallet): void {
  const callback: WindowRegisterWalletEventCallback = ({ register }) =>
    register(wallet);
  try {
    (window as WalletEventsWindow).dispatchEvent(new RegisterWalletEvent(callback));
  } catch (error) {
    console.error("wallet-standard:register-wallet event could not be dispatched\n", error);
  }
  try {
    (window as WalletEventsWindow).addEventListener(
      "wallet-standard:app-ready",
      (event) => callback(event.detail),
    );
  } catch (error) {
    console.error("wallet-standard:app-ready event listener could not be added\n", error);
  }
}
