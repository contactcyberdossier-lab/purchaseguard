# PurchaseGuard Production Security Checklist

Comprehensive audit checklist based on **OWASP Top 10** and **OWASP ASVS** standards.

---

### 1. Authentication & Session Security
- [x] Passwords hashed using bcrypt/Argon2 via Supabase Auth provider defaults.
- [x] Password complexity enforced client-side and server-side: minimum 8 characters with upper, lower, number, and special character.
- [x] Short-lived JWT sessions refreshed securely via HttpOnly, SameSite=Lax cookies.
- [x] Session invalidation on sign-out and password reset.
- [x] Zero storage of sensitive access tokens or credentials in `localStorage` or `sessionStorage`.
- [x] Optional TOTP two-factor authentication supported via Supabase Auth.

---

### 2. Authorization & IDOR Prevention
- [x] Row-Level Security (RLS) enabled on all 10 PostgreSQL tables (`users`, `purchases`, `purchase_items`, `email_connections`, `processed_emails`, `attachments`, `reminders`, `subscription_events`, `audit_logs`, `privacy_requests`).
- [x] Zero direct ID object reference: Every SELECT, UPDATE, DELETE strictly enforces `auth.uid() = user_id`.
- [x] Sub-resources (`purchase_items`, `attachments`, `reminders`) verified against parent purchase ownership.
- [x] Server-side middleware verifies authentication before serving any `/dashboard` route.

---

### 3. Token Encryption & Cryptographic Security
- [x] OAuth access and refresh tokens encrypted at rest using **AES-256-GCM** with authenticated 128-bit authentication tags and unique 16-byte initialization vectors (`src/lib/security.ts`).
- [x] Field-level encryption key (`FIELD_ENCRYPTION_KEY`) kept exclusively on server environment variables; never exposed to browser bundles.
- [x] Privacy hashing: IP addresses and User Agents hashed using SHA-256 before writing to audit logs.

---

### 4. File Upload Security & Storage Isolation
- [x] Private Supabase Storage bucket (`receipts`) with public access disabled (`public = false`).
- [x] Storage RLS policies restrict file reads, uploads, and deletions strictly to the folder matching `auth.uid()`.
- [x] Strict MIME-type whitelisting: `application/pdf`, `image/jpeg`, `image/png`, `image/webp`.
- [x] Hard 10 MB file size limit enforced client-side and server-side.
- [x] File download access gated by time-limited (1-hour) signed URLs (`getReceiptSignedUrl`).
- [x] Random hexadecimal file suffixes preventing filename collision or guessability.

---

### 5. HTTP & Browser Security Headers
- [x] **Content-Security-Policy (CSP):** Strict script, style, image, connect, and frame-ancestor rules in `next.config.mjs`.
- [x] **Strict-Transport-Security (HSTS):** `max-age=63072000; includeSubDomains; preload`.
- [x] **X-Frame-Options:** `DENY` (clickjacking protection).
- [x] **X-Content-Type-Options:** `nosniff` (MIME-sniffing prevention).
- [x] **Referrer-Policy:** `strict-origin-when-cross-origin`.
- [x] **Permissions-Policy:** Microphones, cameras, geolocation disabled.

---

### 6. Privacy & Regulatory Compliance
- [x] **No Web Scraping:** Zero automated login or scraping against retailer accounts.
- [x] **Zero Data Selling:** Clear contractual disclosure that user data is never sold or brokered.
- [x] **AI Model Training Exemption:** Email data is never used to train public generative AI models.
- [x] **GDPR / CCPA Data Portability:** Downloadable full JSON export endpoint at `/api/user/export`.
- [x] **Right to be Forgotten:** Instant, permanent account and storage purge endpoint at `/api/user/delete`.
