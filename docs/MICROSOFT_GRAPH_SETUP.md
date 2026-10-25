# Microsoft Graph OAuth 2.0 Integration Setup Guide

This guide outlines how to register an Azure Entra ID Application for Outlook read-only sync.

---

## 1. Register Application in Azure Portal
1. Sign in to the [Azure Portal](https://portal.azure.com/) or [Microsoft Entra admin center](https://entra.microsoft.com/).
2. Navigate to **Identity** > **Applications** > **App registrations**.
3. Click **New registration**:
   - **Name:** `PurchaseGuard`
   - **Supported account types:** Select *Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox, Outlook.com)*
   - **Redirect URI:** Web > `https://purchaseguard.app/api/auth/oauth/microsoft/callback` (and `http://localhost:3000/api/auth/oauth/microsoft/callback` for dev).
4. Click **Register**.

---

## 2. Generate Client Secret
1. In the application sidebar, navigate to **Certificates & secrets**.
2. Click **New client secret**.
3. Add Description: `PurchaseGuard Web Sync Secret`, set expiration to 24 months.
4. Click **Add** and immediately copy the **Value** (not Secret ID).

---

## 3. Configure Microsoft Graph API Permissions
1. Navigate to **API permissions**.
2. Click **Add a permission** > **Microsoft Graph** > **Delegated permissions**.
3. Search and select:
   - `Mail.Read` (Read user mail)
   - `User.Read` (Sign in and read user profile)
   - `offline_access` (Maintain access to data you have given it access to)
4. Click **Add permissions**.

---

## 4. Add to Environment Variables
Add the credentials to `.env.local`:
```bash
MICROSOFT_CLIENT_ID="your-azure-application-client-id"
MICROSOFT_CLIENT_SECRET="your-azure-client-secret-value"
MICROSOFT_REDIRECT_URI="https://purchaseguard.app/api/auth/oauth/microsoft/callback"
```
