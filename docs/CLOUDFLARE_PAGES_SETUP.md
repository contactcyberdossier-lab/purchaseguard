# Deploying PurchaseGuard on Cloudflare Pages (Free & Unlimited Bandwidth)

This guide walks you through deploying PurchaseGuard to **Cloudflare Pages** using `@cloudflare/next-on-pages`.

---

## 1. Prerequisites
- A free [Cloudflare Account](https://dash.cloudflare.com/sign-up).
- Your `purchaseguard` project pushed to a GitHub or GitLab repository.

---

## 2. Project Build Configuration
The project is already pre-configured with:
- **Build Command:** `npx @cloudflare/next-on-pages` (or `npm run pages:build`)
- **Output Directory:** `.vercel/output/static`

---

## 3. Step-by-Step Deployment via Cloudflare Dashboard

### Step 1: Create a Pages Application
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, click **Workers & Pages**.
3. Click **Create application** > Select the **Pages** tab.
4. Click **Connect to Git**.
5. Select your Git account and choose the `purchaseguard` repository.

### Step 2: Configure Build Settings
Fill in the deployment configuration:
- **Project name:** `purchaseguard` (or your choice)
- **Production branch:** `main` (or `master`)
- **Framework preset:** Select **Next.js**
- **Build command:** `npx @cloudflare/next-on-pages`
- **Build output directory:** `.vercel/output/static`
- **Root directory:** If your code is in a subfolder, enter `purchaseguard`, otherwise leave blank.

### Step 3: Add Compatibility Flags (Crucial for Node.js API support)
1. Scroll down to **Compatibility flags**.
2. Click **Add flag** for Production:
   - **Flag:** `nodejs_compat`
   *(This enables Node.js crypto, buffer, and streaming APIs inside Cloudflare Workers)*.

### Step 4: Add Environment Variables
Under **Environment variables (advanced)**, add the keys from your `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FIELD_ENCRYPTION_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL` (set to `https://<your-project>.pages.dev`)

### Step 5: Deploy
Click **Save and Deploy**. Cloudflare will clone your repository, run the build adapter, and provision your project across its global edge network.

---

## 4. Alternative: Deploy from Local CLI using Wrangler

If you prefer deploying directly from your computer terminal without connecting to Git:

```bash
cd purchaseguard

# 1. Install Cloudflare build adapter and Wrangler CLI
npm install -D @cloudflare/next-on-pages wrangler

# 2. Build the project for Cloudflare
npx @cloudflare/next-on-pages

# 3. Deploy the output to Cloudflare Pages
npx wrangler pages deploy .vercel/output/static --project-name=purchaseguard --compatibility-flags=nodejs_compat
```

---

## 5. Connecting a Custom Domain
Once deployed, Cloudflare gives you a free URL like `https://purchaseguard.pages.dev`.

To add your own custom domain:
1. In your Cloudflare Pages project, go to **Custom domains**.
2. Click **Set up a custom domain**.
3. Enter your domain (e.g. `purchaseguard.app`).
4. Cloudflare will automatically provision SSL certificates and route traffic with zero downtime.
