/**
 * Weekly DCA rank: Grok analysis (if XAI_API_KEY) → Jev picks top-3
 * via same-origin /api/jev. Equal ⅓ buy is a separate on-chain step.
 * Hosted TYPESAFE must NEVER live in this bundle — only localStorage keys.
 */

import { metricsRank } from "@/lib/metrics-rank";
import type { RankPrefs } from "@/lib/rank-prefs";
import { readRankPrefs } from "@/lib/rank-prefs";
import type { PrestocksProduct, RankResult, RankRow } from "@/lib/universe";

const XAI_CHAT_URL = "https://api.x.ai/v1/chat/completions";
const GROK_MODELS = ["grok-4.5", "grok-3-mini", "grok-2-latest"] as const;

const JEV_PROXY_HINT =
  "Jev niedostępny przez lokalny proxy /api/jev — uruchom npm run dev i sprawdź TYPESAFE_API_KEY.";

function jevProxyUrl(): string {
  const base = (
    process.env.NEXT_PUBLIC_BASE_PATH || "/prestocks-dca-noir2.0"
  ).replace(/\/$/, "");
  if (typeof window !== "undefined") {
    return `${window.location.origin}${base}/api/jev/`;
  }
  return `${base}/api/jev/`;
}

function fmt(v: unknown): string {
  if (v == null) return "na";
  if (typeof v === "number") {
    return Number(v).toPrecision(4).replace(/\.?0+$/, "");
  }
  return String(v);
}

function prefsLine(prefs: RankPrefs): string {
  const excl = prefs.exclusions.join(",") || "xAI";
  const deadlineBit = prefs.deadlinesUnimportant
    ? "deadlines_unimportant=true (buying with expiry allowed)"
    : "deadlines_unimportant=false (exclude expired / invalid-deadline names)";
  const ipoBit = prefs.premiumsMatter
    ? prefs.premiumsEspeciallyNearIpo
      ? "premiums_matter=true especially near IPO (SpaceX)"
      : "premiums_matter=true but de-emphasize near-IPO premium"
    : "premiums_matter=false (ignore premium/discount vs valuation for ranking)";
  const postIpoBit = prefs.buyDespiteIpo
    ? "buy_despite_ipo=true (post-IPO PreStocks allowed)"
    : "buy_despite_ipo=false (exclude IPO-completed names)";
  const entryBit = prefs.premiumsMatter
    ? `prefer attractive entry vs mark (lower/negative premium better${prefs.premiumsEspeciallyNearIpo ? " unless IPO momentum justifies premium" : ""})`
    : "do not rank on premium/discount vs mark (premium_pct is informational only)";
  return `USER_PREFS: ${deadlineBit}; ${ipoBit}; ${postIpoBit}; exclude ${excl}; ${entryBit}.`;
}

function scoringHint(prefs: RankPrefs): string {
  const deadlineHint = prefs.deadlinesUnimportant
    ? "Buying PreStocks that have an expiry date is allowed."
    : "Do not pick PreStocks that are past expiry or have an invalid deadline.";
  const premHint = prefs.premiumsMatter
    ? prefs.premiumsEspeciallyNearIpo
      ? "Weight premiums heavily (discount vs mark is good; rich premium needs strong thesis). Near-IPO (SpaceX) premium dynamics are especially important."
      : "Weight premiums heavily (discount vs mark is good; rich premium needs strong thesis). Do not overweight near-IPO premium dynamics."
    : "Do not treat premium/discount vs mark as a ranking signal (premium_pct is informational only). Near-IPO premium bonus is OFF.";
  const postIpoHint = prefs.buyDespiteIpo
    ? "Buying PreStocks after a completed IPO is allowed."
    : "Do not pick names that have already completed an IPO.";
  return (
    "SCORING_HINT: Higher score = better weekly DCA allocation candidate this week. " +
    `${premHint} ${deadlineHint} ${postIpoHint}`
  );
}

type GrokBriefing = {
  skipped: boolean;
  reason?: string;
  model?: string;
  summary?: string;
  per_product?: Array<Record<string, unknown>>;
};

function grokRowForProduct(
  grok: GrokBriefing,
  product: PrestocksProduct,
): { signal: string; note: string; ipo_premium_weight: unknown } | null {
  if (grok.skipped) return null;
  const want = product.name.trim().toLowerCase();
  const wantSym = product.symbol.trim().toLowerCase();
  const compact = want.replace(/\s+/g, "");
  for (const row of grok.per_product ?? []) {
    const n = String(row.name ?? "")
      .trim()
      .toLowerCase();
    if (n === want || n === wantSym || n.replace(/\s+/g, "") === compact) {
      return {
        signal: String(row.signal ?? "neutral"),
        note: String(row.note ?? "").replace(/\n/g, " ").trim(),
        ipo_premium_weight: row.ipo_premium_weight ?? null,
      };
    }
  }
  return null;
}

function grokClause(
  row: ReturnType<typeof grokRowForProduct>,
): string {
  if (!row) {
    return "No Grok analysis for this name — score from the product table and USER_PREFS only.";
  }
  return (
    `Grok analysis (soft context, not the decision): signal=${row.signal}` +
    `${row.ipo_premium_weight != null ? `; ipo_premium_weight=${row.ipo_premium_weight}` : ""}` +
    `${row.note ? `; note=${row.note}` : ""}. You (Jev) assign the typed score.`
  );
}

/** Structured System One state: metrics table + optional Grok analysis. */
function buildState(
  products: PrestocksProduct[],
  premiumsSource: string,
  totals: unknown,
  prefs: RankPrefs,
  grok: GrokBriefing,
): Record<string, unknown> {
  return {
    roles: {
      grok: "analyst — qualitative signals only; does not pick the top-3",
      jev: "decision — typed scores select the three names for equal-weight buy",
    },
    task: "PreStocks weekly DCA: rank for equal-weight buy of top-3. No swaps executed.",
    user_prefs: prefsLine(prefs),
    data_source: `prestocks.com/api/metrics+mark-price/batch; premiums=${premiumsSource}`,
    totals: totals ?? {},
    scoring_hint: scoringHint(prefs),
    grok_briefing: grok.skipped
      ? { present: false, reason: grok.reason ?? "XAI_API_KEY missing" }
      : {
          present: true,
          model: grok.model ?? null,
          summary: grok.summary ?? "",
          per_product: grok.per_product ?? [],
        },
    products: products.map((p) => ({
      name: p.name,
      symbol: p.symbol,
      mint: p.mint,
      token_usd: p.token_price_usd,
      mark_usd: p.mark_price_usd,
      premium_pct: p.premium_pct,
      mcap_usd: p.market_cap_usd ?? null,
      holders: p.holders ?? null,
      vol_cum_usd: p.volume_cum_usd ?? null,
      chg30d_pct: p.change_30d_pct ?? null,
      near_ipo: p.near_ipo,
      ipo_completed: !!p.ipo_completed,
      deadline_invalid: !!p.deadline_invalid,
      grok: grokRowForProduct(grok, p),
    })),
  };
}

function buildQuestions(
  products: PrestocksProduct[],
  prefs: RankPrefs,
  grok: GrokBriefing,
): Record<string, unknown> {
  const grokPresent = !grok.skipped;
  const choiceCriteria: Record<string, string> = {};
  for (const p of products) {
    const g = grokRowForProduct(grok, p);
    choiceCriteria[p.name] =
      `${p.name} PreStock mint=${p.mint}; premium_pct=${p.premium_pct}; ` +
      `near_ipo=${p.near_ipo ? "yes" : "no"}; chg30d=${fmt(p.change_30d_pct)}` +
      (g ? `; grok_signal=${g.signal}` : "");
  }
  const deadlinePhrase = prefs.deadlinesUnimportant
    ? "expired / deadline names allowed"
    : "skip expired / invalid-deadline names";
  const ipoPhrase = prefs.premiumsMatter
    ? prefs.premiumsEspeciallyNearIpo
      ? "premiums matter especially near IPO/SpaceX"
      : "premiums matter but de-emphasize near-IPO premium"
    : "ignore premium/discount vs valuation for ranking";
  const postIpoPhrase = prefs.buyDespiteIpo
    ? "post-IPO names allowed"
    : "skip names that already IPO'd";
  const scoreLevels = prefs.premiumsMatter
    ? [
        "Poor DCA entry: rich unjustified premium vs mark, weak liquidity/holders, or avoid this week.",
        "Below-average: mild overpay vs mark or soft momentum; only if diversifying.",
        "Acceptable: fair premium/discount and adequate liquidity for a slice of weekly DCA.",
        prefs.premiumsEspeciallyNearIpo
          ? "Strong: attractive discount or justified near-IPO premium with solid flow; prefer for top-3."
          : "Strong: attractive discount vs mark with solid flow; prefer for top-3 (do not overweight IPO premium).",
        `Excellent: clear best risk/reward this week under user prefs (premiums matter; ${deadlinePhrase}; ${postIpoPhrase}).`,
      ]
    : [
        "Poor DCA entry: weak liquidity/holders/flow, or avoid this week (do not score on premium).",
        "Below-average: soft momentum or thin flow; only if diversifying (ignore premium/discount).",
        "Acceptable: adequate liquidity and thesis for a slice of weekly DCA (ignore premium/discount).",
        "Strong: solid flow and thesis; prefer for top-3 (do not rank on premium/discount vs mark).",
        `Excellent: clear best risk/reward this week under user prefs (ignore premium/discount; ${deadlinePhrase}; ${postIpoPhrase}).`,
      ];
  const questions: Record<string, unknown> = {
    best_dca_pick: {
      type: "choice",
      instructions:
        `Given USER_PREFS (${prefs.deadlinesUnimportant ? "buying with expiry allowed" : "exclude expired / invalid-deadline names"}; ${ipoPhrase}; ${postIpoPhrase}) ` +
        "and the product table in state" +
        (grokPresent
          ? " plus grok_briefing (Grok is the analyst; you decide)"
          : " (no Grok analysis this run)") +
        ", which single PreStock is the best weekly DCA pick this week?",
      criteria: choiceCriteria,
    },
  };
  for (const p of products) {
    const qid = `score_${p.symbol.toLowerCase()}`;
    questions[qid] = {
      type: "score",
      instructions:
        `Score how suitable \`${p.name}\` (mint ${p.mint}) is as a weekly PreStocks DCA allocation ` +
        `this week. Premium_pct=${p.premium_pct} (negative=discount). near_ipo=` +
        `${p.near_ipo ? "yes" : "no"}. ipo_completed=` +
        `${p.ipo_completed ? "yes" : "no"}. deadline_invalid=` +
        `${p.deadline_invalid ? "yes" : "no"}. ` +
        (prefs.premiumsMatter
          ? "Prefer attractive premiums; "
          : "Premium_pct is raw info only — do not use it as a ranking signal. ") +
        `${prefs.deadlinesUnimportant ? "buying with expiry allowed" : "skip expired / invalid-deadline names"}. ` +
        `${
          !prefs.premiumsMatter
            ? "Near-IPO premium bonus OFF. "
            : prefs.premiumsEspeciallyNearIpo
              ? ""
              : "De-emphasize near-IPO premium. "
        }${postIpoPhrase}. ` +
        grokClause(grokRowForProduct(grok, p)),
      criteria: scoreLevels,
    };
  }
  return questions;
}

function stripJsonFences(text: string): string {
  const m = text.trim().match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return m ? m[1].trim() : text.trim();
}

function normalizeScore(answer: Record<string, unknown>): number {
  const raw = answer.score;
  if (raw == null) return 0;
  const legend = (answer.legend as Record<string, unknown>) || {};
  const keys = Object.keys(legend).map((k) => Number(k));
  const maxIdx = keys.length ? Math.max(...keys) : 4;
  if (maxIdx <= 0) return Number(raw) * 100;
  return Math.round(((100 * Number(raw)) / maxIdx) * 1000) / 1000;
}

async function callGrok(
  products: PrestocksProduct[],
  xaiKey: string,
  rankPrefs: RankPrefs,
): Promise<{
  skipped: boolean;
  reason?: string;
  model?: string;
  summary?: string;
  per_product?: Array<Record<string, unknown>>;
}> {
  if (!xaiKey) return { skipped: true, reason: "XAI_API_KEY missing" };
  const prefs = {
    deadlines_unimportant: rankPrefs.deadlinesUnimportant,
    premiums_matter: rankPrefs.premiumsMatter,
    premiums_especially_near_ipo: rankPrefs.premiumsEspeciallyNearIpo,
    buy_despite_ipo: rankPrefs.buyDespiteIpo,
    near_ipo_examples: ["SpaceX"],
    exclude: rankPrefs.exclusions,
  };
  const rows = products.map((p) => ({
    name: p.name,
    mint: p.mint,
    premium_pct: p.premium_pct,
    token_usd: p.token_price_usd,
    mark_usd: p.mark_price_usd,
    near_ipo: !!p.near_ipo,
    ipo_completed: !!p.ipo_completed,
    deadline_invalid: !!p.deadline_invalid,
    chg30d_pct: p.change_30d_pct,
    holders: p.holders,
  }));
  const deadlineSys = rankPrefs.deadlinesUnimportant
    ? "buying PreStocks with expiry allowed"
    : "do not pick names past expiry / with invalid deadline";
  const ipoSys = rankPrefs.premiumsMatter
    ? rankPrefs.premiumsEspeciallyNearIpo
      ? "premiums matter especially near IPO (SpaceX)"
      : "premiums matter but de-emphasize near-IPO premium"
    : "ignore premium/discount vs valuation for ranking";
  const postIpoSys = rankPrefs.buyDespiteIpo
    ? "post-IPO PreStocks allowed"
    : "do not pick names that already IPO'd";
  const exclSys = rankPrefs.exclusions.join(", ") || "xAI";
  const system =
    "You enrich PreStocks weekly DCA ranking inputs for a dry-run (no trades). " +
    "Output strict JSON only — no markdown fences, no prose outside JSON. " +
    `Respect prefs: ${deadlineSys}; ${ipoSys}; ${postIpoSys}; ` +
    `never recommend excluded tokens (${exclSys}).`;
  const userMsg =
    "Enrich PreStocks weekly DCA ranking inputs. Return STRICT JSON only " +
    '(no markdown) with shape:\n' +
    '{"summary":"…","per_product":[{"name":"SpaceX","signal":"bullish|neutral|bearish",' +
    '"note":"…","ipo_premium_weight":0-1}]}\n' +
    "One per_product entry per product below. Signals short; notes 1 sentence.\n" +
    `PREFS=${JSON.stringify(prefs)}\nPRODUCTS=${JSON.stringify(rows)}`;

  let lastErr = "";
  for (const model of GROK_MODELS) {
    try {
      const resp = await fetchWithTimeout(XAI_CHAT_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${xaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: 1200,
          messages: [
            { role: "system", content: system },
            { role: "user", content: userMsg },
          ],
        }),
      });
      if (!resp.ok) {
        lastErr = `${model}: HTTP ${resp.status}`;
        continue;
      }
      const data = (await resp.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content ?? "";
      const parsed = JSON.parse(stripJsonFences(content)) as {
        summary?: string;
        per_product?: Array<Record<string, unknown>>;
      };
      return {
        skipped: false,
        model,
        summary: parsed.summary,
        per_product: Array.isArray(parsed.per_product)
          ? parsed.per_product
          : [],
      };
    } catch (e) {
      lastErr = `${model}: ${e instanceof Error ? e.message : e}`;
    }
  }
  return { skipped: true, reason: `Grok API/parse failed (${lastErr})` };
}

function isBrowserNetworkError(e: unknown): boolean {
  const m = e instanceof Error ? e.message : String(e);
  return /Failed to fetch|Load failed|NetworkError|CORS|timeout/i.test(m);
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 30000,
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } catch (e) {
    const aborted =
      (typeof DOMException !== "undefined" &&
        e instanceof DOMException &&
        e.name === "AbortError") ||
      (e instanceof Error && e.name === "AbortError");
    if (aborted) throw new Error("timeout");
    throw e;
  } finally {
    clearTimeout(t);
  }
}

async function callJev(
  state: Record<string, unknown>,
  questions: Record<string, unknown>,
  typesafeKey: string,
): Promise<Record<string, unknown>> {
  const body = JSON.stringify({
    model: "jev-latest",
    state,
    questions,
  });
  const init: RequestInit = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${typesafeKey}`,
      "Content-Type": "application/json",
    },
    body,
  };
  const url = jevProxyUrl();
  let resp: Response;
  try {
    resp = await fetchWithTimeout(url, init);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Jev proxy niedostępny (${msg}). Uruchom aplikację przez npm run dev.`,
    );
  }
  if (resp.status === 404 || resp.status === 405) {
    throw new Error(
      "Brak proxy Jev (static Pages). Uruchom npm run dev, żeby Jev działał.",
    );
  }
  if (resp.status === 401) {
    throw new Error("Nieprawidłowy TYPESAFE_API_KEY (Jev 401).");
  }
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Jev HTTP ${resp.status}: ${text.slice(0, 300)}`);
  }
  return (await resp.json()) as Record<string, unknown>;
}

function jevResultFromAnswers(
  products: PrestocksProduct[],
  answers: Record<string, Record<string, unknown>>,
  grok: {
    skipped?: boolean;
    reason?: string;
    summary?: string;
    model?: string;
  },
): RankResult {
  const scores: RankRow[] = products.map((p) => {
    const qid = `score_${p.symbol.toLowerCase()}`;
    const ans = answers[qid] ?? {};
    return {
      ...p,
      score: normalizeScore(ans),
      score_raw: (ans.score as number) ?? null,
      confidence: (ans.confidence as number) ?? null,
    };
  });
  scores.sort((a, b) => b.score - a.score);
  const choiceAns = answers.best_dca_pick ?? {};
  const pipeline = grok.skipped
    ? ["prestocks", "jev"]
    : ["prestocks", "grok", "jev"];
  return {
    mode: "byok_ai",
    sourceLabel: grok.skipped
      ? "Źródło: PreStocks + AI (BYOK · Jev)"
      : "Źródło: PreStocks + AI (BYOK · Grok+Jev)",
    pipeline,
    top3: scores.slice(0, 3),
    scores,
    products,
    choice: {
      choice: choiceAns.choice as string | undefined,
      confidence: (choiceAns.confidence as number) ?? null,
    },
    grok: {
      skipped: !!grok.skipped,
      reason: grok.reason,
      summary: grok.summary,
    },
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Weekly path: Grok analysis (skipped without XAI_API_KEY) → Jev top-3.
 * Grok never replaces Jev. Metrics only if Jev fails.
 */
export async function runByokAiRank(opts: {
  products: PrestocksProduct[];
  premiumsSource: string;
  totals: unknown;
  typesafeKey: string;
  xaiKey?: string;
  exclusions?: string[];
  prefs?: RankPrefs;
}): Promise<RankResult> {
  const { products, premiumsSource, totals, typesafeKey } = opts;
  const xaiKey = opts.xaiKey ?? "";
  const prefs: RankPrefs = opts.prefs ?? {
    ...readRankPrefs(),
    ...(opts.exclusions ? { exclusions: opts.exclusions } : {}),
  };

  if (!typesafeKey) {
    const fallback = metricsRank(products, prefs.exclusions, prefs);
    return {
      ...fallback,
      error:
        "Brak TYPESAFE_API_KEY — Jev nie może wybrać top-3. Awaryjny ranking metryczny.",
    };
  }

  const grok = await callGrok(products, xaiKey, prefs);
  const state = buildState(products, premiumsSource, totals, prefs, grok);
  const questions = buildQuestions(products, prefs, grok);
  try {
    const jev = await callJev(state, questions, typesafeKey);
    const answers =
      (jev.answers as Record<string, Record<string, unknown>>) ||
      ((jev.data as { answers?: Record<string, Record<string, unknown>> })
        ?.answers ??
        {});
    return jevResultFromAnswers(products, answers, grok);
  } catch (e) {
    const jevErr = e instanceof Error ? e.message : String(e);
    const fallback = metricsRank(products, prefs.exclusions, prefs);
    return {
      ...fallback,
      error: isBrowserNetworkError(jevErr)
        ? JEV_PROXY_HINT
        : `Jev niedostępny (${jevErr}). Awaryjny ranking metryczny.`,
      grok: {
        skipped: !!grok.skipped,
        reason: grok.reason,
        summary: grok.summary,
      },
    };
  }
}
