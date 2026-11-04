// ========================================================
// Gmail OAuth 2.0 Client (Minimum Read-Only Scope)
// ========================================================

import { encryptToken, decryptToken } from '../security';

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email openid email profile';

export function getGoogleAuthUrl(state: string, requestOrigin?: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const cleanOrigin = (requestOrigin || process.env.NEXT_PUBLIC_APP_URL || 'https://purchaseguardapp.com').replace(/\/+$/, '');
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${cleanOrigin}/api/auth/oauth/google/callback`;

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

export async function exchangeGoogleCodeForTokens(code: string, requestOrigin?: string): Promise<{
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string;
  expiresInSeconds: number;
  emailAddress: string;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const cleanOrigin = (requestOrigin || process.env.NEXT_PUBLIC_APP_URL || 'https://purchaseguardapp.com').replace(/\/+$/, '');
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${cleanOrigin}/api/auth/oauth/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET) are missing');
  }

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

  // Fetch connected profile email address from Gmail API and Userinfo
  let emailAddress = '';

  try {
    const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (profileRes.ok) {
      const profileData = await profileRes.json();
      emailAddress = profileData.emailAddress || '';
    }
  } catch (profileErr) {
    console.warn('Gmail profile fetch warning:', profileErr);
  }

  if (!emailAddress) {
    try {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        emailAddress = userData.email || '';
      }
    } catch (userErr) {
      console.warn('Userinfo fetch warning:', userErr);
    }
  }

  return {
    accessTokenEncrypted: encryptToken(tokenData.access_token),
    refreshTokenEncrypted: tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : '',
    expiresInSeconds: tokenData.expires_in || 3600,
    emailAddress: emailAddress || 'connected-gmail',
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
