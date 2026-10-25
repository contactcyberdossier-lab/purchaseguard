import { describe, it, expect } from 'vitest';
import { encryptToken, decryptToken, sanitizeString, hashIdentifier } from '../../src/lib/security';

describe('Security & Cryptography Utilities', () => {
  it('encrypts and decrypts OAuth tokens symmetrically with AES-256-GCM', () => {
    const originalToken = 'ya29.a0AfH6SMDI_sample_google_access_token_super_secret_12345';
    const encrypted = encryptToken(originalToken);

    expect(encrypted).not.toBe(originalToken);
    expect(encrypted.split(':').length).toBe(3); // IV : AuthTag : Ciphertext

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toBe(originalToken);
  });

  it('sanitizes malicious HTML injection inputs', () => {
    const dirty = '<script>alert("XSS")</script><img src="x" onerror="stealCookies()">';
    const clean = sanitizeString(dirty);

    expect(clean).not.toContain('<script>');
    expect(clean).toContain('&lt;script&gt;');
    expect(clean).not.toContain('"');
    expect(clean).toContain('&quot;');
  });

  it('produces deterministic, privacy-friendly SHA-256 identifier hashes', () => {
    const ip = '192.168.1.100';
    const hash1 = hashIdentifier(ip);
    const hash2 = hashIdentifier(ip);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(32);
    expect(hash1).not.toContain('192.168');
  });
});
