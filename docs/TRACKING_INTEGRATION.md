# AfterShip & Shippo Package Tracking Integration Guide

This guide describes configuring real-time carrier delivery tracking in PurchaseGuard.

---

## 1. AfterShip Tracking API Setup
1. Register for an account at [AfterShip](https://www.aftership.com/).
2. Navigate to **Tracking** > **API & Webhooks** > **API Keys**.
3. Click **Generate API Key**.
4. Set description: `PurchaseGuard Production Tracking`.
5. Copy your API Key (`asat_...`).
6. Enable automatic carrier detection across global carriers (USPS, UPS, FedEx, DHL, Royal Mail, Canada Post, Australia Post).

Add to `.env.local`:
```bash
AFTERSHIP_API_KEY="asat_your_actual_key"
```

---

## 2. Shippo API (Alternative) Setup
1. Register at [GoShippo](https://goshippo.com/).
2. Navigate to **API** > **API Tokens**.
3. Generate a Live Token.
4. Replace the carrier query function in `src/lib/tracking.ts` with Shippo's `/tracks/{carrier}/{tracking_number}` endpoint.
