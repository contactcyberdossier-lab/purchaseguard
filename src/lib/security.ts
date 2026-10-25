// ========================================================
// Security, Encryption, and Audit Logging Utilities
// ========================================================

import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * Hash IP and User Agent for privacy-friendly audit logs without storing raw PII
 */
export function hashIdentifier(input: string): string {
  return createHash('sha256').update(input).digest('hex').substring(0, 32);
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

/**
 * AES-256-GCM Token Encryption for OAuth tokens at rest
 */
const ALGORITHM = 'aes-256-gcm';

export function encryptToken(text: string): string {
  const keyHex = process.env.FIELD_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    // In dev fallback or missing key, use a deterministic 32-byte hash
    const fallbackKey = createHash('sha256').update(keyHex || 'fallback-purchaseguard-dev-secret-key-32').digest();
    return encryptWithBuffer(text, fallbackKey);
  }
  const key = Buffer.from(keyHex, 'hex');
  return encryptWithBuffer(text, key);
}

function encryptWithBuffer(text: string, key: Buffer): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptToken(encryptedData: string): string {
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload structure');
  }
  const [ivHex, authTagHex, cipherText] = parts;
  const keyHex = process.env.FIELD_ENCRYPTION_KEY;
  const key = (!keyHex || keyHex.length !== 64)
    ? createHash('sha256').update(keyHex || 'fallback-purchaseguard-dev-secret-key-32').digest()
    : Buffer.from(keyHex, 'hex');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(cipherText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
