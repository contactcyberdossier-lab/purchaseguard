// ========================================================
// Security, Encryption, and Audit Logging Utilities
// ========================================================

/**
 * Pure TypeScript SHA-256 implementation (Edge/Browser/Node safe, 0 dependencies)
 */
function sha256Sync(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  let compositeLength = 0;
  for (let i = 0; i < ascii.length; i++) {
    const charCode = ascii.charCodeAt(i);
    words[i >> 2] |= charCode << ((3 - (i % 4)) * 8);
    compositeLength++;
  }
  words[compositeLength >> 2] |= 0x80 << ((3 - (compositeLength % 4)) * 8);
  words[(((compositeLength + 8) >> 6) << 4) + 15] = asciiBitLength;
  for (let i = 0; i < words.length; i += 16) {
    const w = words.slice(i, i + 16);
    let [a, b, c, d, e, f, g, h] = hash;
    for (let j = 0; j < 64; j++) {
      if (j >= 16) {
        const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + ch + k[j] + (w[j] || 0)) | 0;
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = ((rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + maj) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }
    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }
  let result = '';
  for (let i = 0; i < 8; i++) {
    for (let j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Hash IP and User Agent for privacy-friendly audit logs without storing raw PII
 */
export function hashIdentifier(input: string): string {
  return sha256Sync(input).substring(0, 32);
}

/**
 * Sanitize plain string input to prevent XSS injection
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

function getRandomBytesHex(count: number = 16): string {
  const arr = new Uint8Array(count);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < count; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Deterministic keystream generation based on key + IV + block counter
 */
function generateKeystream(key: string, iv: string, length: number): number[] {
  const stream: number[] = [];
  let block = 0;
  while (stream.length < length) {
    const blockHash = sha256Sync(`${key}:${iv}:${block}`);
    for (let i = 0; i < blockHash.length; i += 2) {
      if (stream.length < length) {
        stream.push(parseInt(blockHash.substring(i, i + 2), 16));
      }
    }
    block++;
  }
  return stream;
}

/**
 * Symmetric Token Encryption for OAuth tokens at rest (Edge & Browser compatible)
 * Output structure: IV(32 hex) : AuthTag(32 hex) : CiphertextHex
 */
export function encryptToken(text: string): string {
  const key = process.env.FIELD_ENCRYPTION_KEY || 'fallback-purchaseguard-dev-secret-key-32';
  const ivHex = getRandomBytesHex(16);
  const textBytes = new TextEncoder().encode(text);
  const keystream = generateKeystream(key, ivHex, textBytes.length);

  const cipherBytes = new Uint8Array(textBytes.length);
  for (let i = 0; i < textBytes.length; i++) {
    cipherBytes[i] = textBytes[i] ^ keystream[i];
  }

  const cipherHex = Array.from(cipherBytes, (b) => b.toString(16).padStart(2, '0')).join('');
  const authTagHex = sha256Sync(`${key}:${ivHex}:${cipherHex}`).substring(0, 32);

  return `${ivHex}:${authTagHex}:${cipherHex}`;
}

export function decryptToken(encryptedData: string): string {
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload structure');
  }
  const [ivHex, authTagHex, cipherHex] = parts;
  const key = process.env.FIELD_ENCRYPTION_KEY || 'fallback-purchaseguard-dev-secret-key-32';

  const expectedAuthTag = sha256Sync(`${key}:${ivHex}:${cipherHex}`).substring(0, 32);
  if (authTagHex !== expectedAuthTag) {
    throw new Error('Authentication tag mismatch - data corrupted or tampered');
  }

  const cipherBytes = new Uint8Array(cipherHex.length / 2);
  for (let i = 0; i < cipherHex.length; i += 2) {
    cipherBytes[i / 2] = parseInt(cipherHex.substring(i, i + 2), 16);
  }

  const keystream = generateKeystream(key, ivHex, cipherBytes.length);
  const plainBytes = new Uint8Array(cipherBytes.length);
  for (let i = 0; i < cipherBytes.length; i++) {
    plainBytes[i] = cipherBytes[i] ^ keystream[i];
  }

  return new TextDecoder().decode(plainBytes);
}
