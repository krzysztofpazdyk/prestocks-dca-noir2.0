/**
 * One-at-a-time RPC fetch. Public / free Devnet gateways answer 429 when the
 * page asks for many accounts at once; web3.js then fails getLatestBlockhash.
 */
const GAP_MS = 350;
const MAX_429 = 10;

let tail = Promise.resolve();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function rpcFetch(input, init) {
  const run = async () => {
    let last = null;
    for (let attempt = 0; attempt <= MAX_429; attempt++) {
      last = await fetch(input, init);
      if (last.status !== 429) return last;
      await sleep(400 * (attempt + 1));
    }
    if (!last) throw new Error("RPC fetch failed");
    return last;
  };
  const job = tail.then(run, run);
  tail = job.then(
    () => sleep(GAP_MS),
    () => sleep(GAP_MS),
  );
  return job;
}
