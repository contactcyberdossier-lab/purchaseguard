# Gmail OAuth 2.0 Integration Setup Guide

This guide outlines how to configure Google Cloud Platform (GCP) for PurchaseGuard's read-only email sync.

---

## 1. Create a Project in Google Cloud Console
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project** > **New Project**.
3. Name the project `PurchaseGuard` and click **Create**.

---

## 2. Configure the OAuth Consent Screen
1. In the sidebar, go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** as the user type and click **Create**.
3. Complete App Information:
   - **App name:** `PurchaseGuard`
   - **User support email:** your organization email
   - **App domain:** `https://purchaseguard.app`
   - **Privacy Policy link:** `https://purchaseguard.app/en/privacy`
   - **Terms of Service link:** `https://purchaseguard.app/en/terms`
4. Click **Save and Continue**.

---

## 3. Configure Scopes (Minimum Read-Only)
1. On the **Scopes** page, click **Add or Remove Scopes**.
2. Search and add ONLY the following read-only scope:
   - `https://www.googleapis.com/auth/gmail.readonly` (View your email messages and settings)
   - `https://www.googleapis.com/auth/userinfo.email`
3. Click **Update** > **Save and Continue**.

---

## 4. Create OAuth 2.0 Client Credentials
1. Go to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **OAuth client ID**.
3. Select **Web application** for Application type.
4. Name: `PurchaseGuard Web Client`.
5. Under **Authorized redirect URIs**, add:
   - `https://purchaseguard.app/api/auth/oauth/google/callback`
   - `http://localhost:3000/api/auth/oauth/google/callback` (for local development)
6. Click **Create**.
7. Copy the **Client ID** and **Client Secret**.

---

## 5. Add to Environment Variables
Add the credentials to `.env.local`:
```bash
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="https://purchaseguard.app/api/auth/oauth/google/callback"
```
