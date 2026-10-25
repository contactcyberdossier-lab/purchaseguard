# Stripe Subscription & Stripe Tax Setup Guide

This guide details configuring Stripe Products, Webhooks, Customer Portal, and Stripe Tax for PurchaseGuard.

---

## 1. Create Subscription Products in Stripe Dashboard
1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/).
2. Navigate to **Product Catalog** > **Add product**.

### Product 1: PurchaseGuard Plus Monthly
- **Name:** `PurchaseGuard Plus (Monthly)`
- **Price:** `$5.00` USD / month (Recurring)
- **Tax code:** Select `Software as a service (SaaS) - business & consumer` (or `Digital Goods`)
- Save and copy the Price ID (e.g., `price_1Pxxx...`).

### Product 2: PurchaseGuard Plus Annual
- **Name:** `PurchaseGuard Plus (Annual Saver)`
- **Price:** `$49.00` USD / year (Recurring)
- **Tax code:** Select `Software as a service (SaaS) - business & consumer`
- Save and copy the Price ID (e.g., `price_1Pyyy...`).

---

## 2. Enable Stripe Tax
1. In the Stripe Dashboard, navigate to **Tax** > **Settings**.
2. Set your **Origin address** (headquarters).
3. Under **Automatic tax calculation**, toggle **Enabled**.
4. Set the default tax behavior to **Exclusive** (tax is added at checkout depending on the user's country/state/postal code).

---

## 3. Configure Customer Portal
1. Navigate to **Settings** > **Billing** > **Customer portal**.
2. Enable features:
   - Allow customers to update payment methods.
   - Allow customers to view invoice history.
   - Allow customers to switch plans (add both Monthly and Annual prices).
   - Allow customers to cancel subscriptions (set to take effect at end of billing period).
3. Set Business Information, Logo, Privacy Policy and Terms of Service URLs.
4. Click **Save changes**.

---

## 4. Setup Webhooks
1. Navigate to **Developers** > **Webhooks** > **Add endpoint**.
2. **Endpoint URL:** `https://purchaseguard.app/api/billing/webhook`
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Click **Add endpoint**.
5. Reveal **Signing secret** (`whsec_...`).

---

## 5. Add to Environment Variables
```bash
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_PLUS_MONTHLY="price_1Pxxx..."
STRIPE_PRICE_PLUS_ANNUAL="price_1Pyyy..."
```
