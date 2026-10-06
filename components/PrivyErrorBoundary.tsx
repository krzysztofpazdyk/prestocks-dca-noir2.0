"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Privy's create-wallet screen can throw while rendering and replace the
 * whole Next tree with "This page couldn't load". This boundary keeps the
 * document up and lets the user retry. A Privy session in storage survives.
 */
export class PrivyErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    console.error(error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-md flex-col justify-center gap-3 px-4">
        <h1 className="text-sm font-semibold text-[#e8eef5]">
          Privy przerwało ładowanie
        </h1>
        <p className="text-xs leading-relaxed text-[#c5cedb]">
          Strona została na miejscu. Sesja logowania mogła się zapisać — po
          ponowieniu wybierz Privy jeszcze raz, bez nowego kodu, jeśli e-mail
          jest już zalogowany.
        </p>
        <p className="text-[10px] text-[#fca5a5]">{this.state.error.message}</p>
        <button
          type="button"
          className="w-fit rounded border border-[#2dd4bf66] px-3 py-2 text-[11px] uppercase tracking-wider text-[#2dd4bf]"
          onClick={() => this.setState({ error: null })}
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }
}
