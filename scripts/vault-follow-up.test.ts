import assert from "node:assert/strict";
import test from "node:test";
import {
  CONFIRMED_VAULT_BACKGROUND_POLL_MS,
  CONFIRMED_VAULT_LAG_MSG,
  POST_CONFIRM_VAULT_POLL_MS,
  outcomeAfterVaultCheck,
} from "../lib/vault-follow-up";

const SUCCESS = "Wpłacono 5 USDC do vault.";

test("confirmed vault poll stays inside 30–60s", () => {
  assert.ok(POST_CONFIRM_VAULT_POLL_MS >= 30_000);
  assert.ok(POST_CONFIRM_VAULT_POLL_MS <= 60_000);
  assert.ok(CONFIRMED_VAULT_BACKGROUND_POLL_MS >= 30_000);
  assert.ok(CONFIRMED_VAULT_BACKGROUND_POLL_MS <= 60_000);
});

test("a higher vault uses the success toast", () => {
  const outcome = outcomeAfterVaultCheck({
    confirmed: true,
    increased: true,
    success: SUCCESS,
  });
  assert.equal(outcome.ok, SUCCESS);
  assert.equal(outcome.error, null);
});

test("confirmed signature with a flat vault does not ask for another deposit", () => {
  const outcome = outcomeAfterVaultCheck({
    confirmed: true,
    increased: false,
    success: SUCCESS,
  });
  assert.equal(outcome.error, null);
  assert.equal(outcome.ok, CONFIRMED_VAULT_LAG_MSG);
  assert.match(outcome.ok, /Odśwież Overview/);
  assert.match(outcome.ok, /explorer/);
  assert.doesNotMatch(outcome.ok, /wpłać|ponownie|deposit/i);
});

test("unconfirmed flat vault is an error without a re-deposit nudge", () => {
  const outcome = outcomeAfterVaultCheck({
    confirmed: false,
    increased: false,
    success: SUCCESS,
  });
  assert.equal(outcome.ok, null);
  assert.ok(outcome.error);
  assert.doesNotMatch(outcome.error, /wpłać|ponownie/i);
});
