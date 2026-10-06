"use client";

import type { ReactNode } from "react";
import { explorerTxUrl } from "@/lib/predca";
import { TX_SIGNATURE_RE } from "@/lib/vault-follow-up";

/** Turn an explorer URL inside a tx note into a real link. The signature stays as text. */
export function txMessageWithLink(message: string): ReactNode {
  const signature = message.match(TX_SIGNATURE_RE)?.[0] ?? null;
  if (!signature) return message;
  const href = explorerTxUrl(signature);
  if (!message.includes(href)) return message;
  const [before, after] = message.split(href);
  return (
    <>
      {before}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        {href}
      </a>
      {after}
    </>
  );
}

export function TxNotice({
  message,
  tone,
  className = "",
}: {
  message: string;
  tone: "pending" | "error";
  className?: string;
}) {
  const toneClass =
    tone === "pending"
      ? "border-[#fbbf2433] bg-[#fbbf2411] text-[#fbbf24]"
      : "border-[#f8717133] bg-[#f8717111] text-[#fca5a5]";
  return (
    <p
      className={`break-all rounded border px-3 py-2 text-xs ${toneClass} ${className}`}
    >
      {txMessageWithLink(message)}
    </p>
  );
}
