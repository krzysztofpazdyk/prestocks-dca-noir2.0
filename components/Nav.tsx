"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { clusterLabel } from "@/lib/predca";
import { useI18n, type Locale } from "@/lib/i18n";

export function Nav() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useI18n();
  const [walletReady, setWalletReady] = useState(false);

  useEffect(() => {
    setWalletReady(true);
  }, []);

  const links = [
    { href: "/", label: t("nav.overview") },
    { href: "/ustawienia", label: t("nav.settings") },
    { href: "/historia", label: t("nav.history") },
  ];

  function LocaleBtn({ code }: { code: Locale }) {
    const active = locale === code;
    return (
      <button
        type="button"
        onClick={() => setLocale(code)}
        aria-pressed={active}
        className={`rounded px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase transition ${
          active
            ? code === "pl"
              ? "bg-[#2dd4bf22] text-[#2dd4bf] border border-[#2dd4bf66]"
              : "bg-[#a78bfa22] text-[#a78bfa] border border-[#a78bfa66]"
            : "border border-transparent text-[#8b95a8] hover:text-[#e8eef5]"
        }`}
      >
        {code.toUpperCase()}
      </button>
    );
  }

  return (
    <header className="border-b border-[#1e2633] bg-[#0c0e12]/90 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#2dd4bf] shadow-[0_0_10px_#2dd4bf]" />
            <span className="text-sm font-semibold tracking-widest text-[#e8eef5] uppercase">
              PreStocks<span className="text-[#a78bfa]">·</span>DCA
            </span>
          </Link>
          <nav className="flex gap-1">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded px-3 py-1.5 text-xs tracking-wide uppercase transition ${
                    active
                      ? "bg-[#1a2330] text-[#2dd4bf] border border-[#2dd4bf33]"
                      : "text-[#8b95a8] hover:text-[#e8eef5]"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="mono-num text-[10px] text-[#8b95a8] tracking-wider">
              {clusterLabel()}
            </span>
            <div
              className="flex items-center gap-0.5 rounded border border-[#1e2633] bg-[#0c0e12] p-0.5"
              role="group"
              aria-label="Language"
            >
              <LocaleBtn code="pl" />
              <LocaleBtn code="en" />
            </div>
          </div>
          {/* Mobile: show toggle without cluster */}
          <div
            className="flex sm:hidden items-center gap-0.5 rounded border border-[#1e2633] bg-[#0c0e12] p-0.5"
            role="group"
            aria-label="Language"
          >
            <LocaleBtn code="pl" />
            <LocaleBtn code="en" />
          </div>
          {walletReady ? (
            <WalletMultiButton />
          ) : (
            <div
              className="wallet-adapter-button wallet-adapter-button-trigger"
              style={{ pointerEvents: "none", opacity: 0.5 }}
              aria-hidden
            >
              {t("nav.selectWallet")}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
