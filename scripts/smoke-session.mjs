import { Keypair } from '@solana/web3.js';
import { ed25519 } from '@noble/curves/ed25519.js';
import bs58 from 'bs58';

const kp = Keypair.generate();
const wallet = kp.publicKey.toBase58();
const expires = Math.floor(Date.now() / 1000) + 300;
const message = [
  'Predca keeper authorization',
  'action:status',
  `owner:${wallet}`,
  `expires:${expires}`,
].join('\n');
// Solana secretKey is 64 bytes (seed||pub); noble wants 32-byte seed
const seed = kp.secretKey.slice(0, 32);
const signature = bs58.encode(ed25519.sign(new TextEncoder().encode(message), seed));
const body = { wallet, owner: wallet, message, signature };
const r = await fetch('https://predca-api.onrender.com/keeper/status', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Origin: 'https://krzysztofpazdyk.github.io',
  },
  body: JSON.stringify(body),
});
const data = await r.json();
console.log(JSON.stringify({
  status: r.status,
  keys: Object.keys(data).sort(),
  hasToken: !!data.sessionToken,
  tokenLen: (data.sessionToken || '').length,
  exp: data.sessionExpiresAt,
  ttl: data.sessionTtlS,
  ok: data.ok,
  owner: data.owner,
  enabled: data.enabled,
  error: data.error,
  detail: data.detail,
}, null, 2));
if (!data.sessionToken) process.exit(2);
const r2 = await fetch(`https://predca-api.onrender.com/keeper/status?owner=${encodeURIComponent(wallet)}`, {
  headers: {
    Authorization: `Bearer ${data.sessionToken}`,
    'X-Keeper-Session': data.sessionToken,
    Origin: 'https://krzysztofpazdyk.github.io',
  },
});
const d2 = await r2.json();
console.log(JSON.stringify({
  bearer: r2.status,
  keys: Object.keys(d2).sort(),
  ok: d2.ok,
  owner: d2.owner,
  hasToken: !!d2.sessionToken,
}, null, 2));
