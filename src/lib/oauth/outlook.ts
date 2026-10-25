// ========================================================
// Microsoft Graph OAuth 2.0 Client (Outlook Read-Only)
// ========================================================

import { encryptToken, decryptToken } from '../security';

const OUTLOOK_SCOPES = 'Mail.Read offline_access User.Read';

export function getMicrosoftAuthUrl(state: string): string {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI || 'https://purchaseguard.app/api/auth/oauth/microsoft/callback';

  if (!clientId) {
    throw new Error('MICROSOFT_CLIENT_ID is not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    response_mode: 'query',
    scope: OUTLOOK_SCOPES,
    state,
  });

  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
}

export async function exchangeMicrosoftCodeForTokens(code: string): Promise<{
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string;
  expiresInSeconds: number;
  emailAddress: string;
}> {
  const clientId = process.env.MICROSOFT_CLIENT_ID!;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET!;
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI || 'https://purchaseguard.app/api/auth/oauth/microsoft/callback';

  const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new Error(tokenData.error_description || 'Failed to exchange Microsoft OAuth code');
  }

  // Fetch Microsoft Graph user profile to get connected email
  const userRes = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const userData = await userRes.json();
  const emailAddress = userData.mail || userData.userPrincipalName;

  return {
    accessTokenEncrypted: encryptToken(tokenData.access_token),
    refreshTokenEncrypted: tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : '',
    expiresInSeconds: tokenData.expires_in || 3600,
    emailAddress,
  };
}

export async function refreshMicrosoftAccessToken(refreshTokenEncrypted: string): Promise<{
  accessTokenEncrypted: string;
  expiresInSeconds: number;
}> {
  const clientId = process.env.MICROSOFT_CLIENT_ID!;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET!;
  const refreshToken = decryptToken(refreshTokenEncrypted);

  const res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || 'Failed to refresh Microsoft token');
  }

  return {
    accessTokenEncrypted: encryptToken(data.access_token),
    expiresInSeconds: data.expires_in || 3600,
  };
}
