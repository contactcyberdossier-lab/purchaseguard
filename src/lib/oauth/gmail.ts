// ========================================================
// Gmail OAuth 2.0 Client (Minimum Read-Only Scope)
// ========================================================

import { encryptToken, decryptToken } from '../security';

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

export function getGoogleAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://purchaseguard.app/api/auth/oauth/google/callback';

  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GMAIL_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCodeForTokens(code: string): Promise<{
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string;
  expiresInSeconds: number;
  emailAddress: string;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://purchaseguard.app/api/auth/oauth/google/callback';

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new Error(tokenData.error_description || 'Failed to exchange Google OAuth code');
  }

  // Fetch connected profile email address
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const userData = await userRes.json();

  return {
    accessTokenEncrypted: encryptToken(tokenData.access_token),
    refreshTokenEncrypted: tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : '',
    expiresInSeconds: tokenData.expires_in || 3600,
    emailAddress: userData.email,
  };
}

export async function refreshGoogleAccessToken(refreshTokenEncrypted: string): Promise<{
  accessTokenEncrypted: string;
  expiresInSeconds: number;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const refreshToken = decryptToken(refreshTokenEncrypted);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || 'Failed to refresh Google token');
  }

  return {
    accessTokenEncrypted: encryptToken(data.access_token),
    expiresInSeconds: data.expires_in || 3600,
  };
}
