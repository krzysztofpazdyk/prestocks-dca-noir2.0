import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "@/components/SolanaWalletProvider";
import { I18nProvider } from "@/lib/i18n";
import {
  AutoWeeklyBuyBanner,
  AutoWeeklyBuyProvider,
} from "@/lib/hooks/useAutoWeeklyBuy";
import { Nav } from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PreStocks DCA · Noir",
  description: "Weekly DCA na PreStocks SPL — wariant noir (localnet + Predca)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0c0e12] text-[#e8eef5]">
        <SolanaWalletProvider>
          <I18nProvider>
            <AutoWeeklyBuyProvider>
              <Nav />
              <AutoWeeklyBuyBanner />
              <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
                {children}
              </main>
            </AutoWeeklyBuyProvider>
          </I18nProvider>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
