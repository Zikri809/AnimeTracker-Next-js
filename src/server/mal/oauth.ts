import { getRequiredEnv } from '../env';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Generate cryptographically secure random string.
 */
export function generateSecureRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters[array[i] % characters.length];
  }
  return result;
}

/**
 * Generate PKCE code verifier and challenge.
 * Since MyAnimeList uses 'plain' method, the challenge is the verifier itself.
 */
export function generatePkcePlain(): { code_verifier: string; code_challenge: string } {
  // A verifier must be between 43 and 128 characters long.
  const verifier = generateSecureRandomString(128);
  return {
    code_verifier: verifier,
    code_challenge: verifier,
  };
}

/**
 * Build MyAnimeList Authorize URL.
 */
export function buildAuthorizeUrl(state: string, codeVerifier: string, redirectUri: string): string {
  const clientId = getRequiredEnv('Client_ID');
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    state: state,
    redirect_uri: redirectUri,
    code_challenge: codeVerifier,
    code_challenge_method: 'plain',
  });
  
  return `https://myanimelist.net/v1/oauth2/authorize?${params.toString()}`;
}

/**
 * Exchange Authorization Code for tokens.
 */
export async function exchangeAuthCode(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<TokenResponse> {
  const clientId = getRequiredEnv('Client_ID');
  const clientSecret = getRequiredEnv('Client_Secret');

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch('https://myanimelist.net/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    cache: 'no-store',
  });

  if (!response.ok) {
    const err: any = new Error(`Token exchange failed with status ${response.status}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  validateTokenResponse(data);
  return data as TokenResponse;
}

/**
 * Refresh Access Token.
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const clientId = getRequiredEnv('Client_ID');
  const clientSecret = getRequiredEnv('Client_Secret');
  
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await fetch('https://myanimelist.net/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    cache: 'no-store',
  });

  if (!response.ok) {
    const err: any = new Error(`Token refresh failed with status ${response.status}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  validateTokenResponse(data);
  return data as TokenResponse;
}

/**
 * Validates the shape of the token response.
 */
export function validateTokenResponse(data: any): void {
  if (!data || typeof data !== 'object') {
    throw new Error('Token response must be an object');
  }
  if (!data.access_token || typeof data.access_token !== 'string') {
    throw new Error('Missing access_token in token response');
  }
  if (!data.refresh_token || typeof data.refresh_token !== 'string') {
    throw new Error('Missing refresh_token in token response');
  }
  if (data.expires_in === undefined || data.expires_in === null) {
    throw new Error('Missing expires_in in token response');
  }
  const expires = Number(data.expires_in);
  if (isNaN(expires) || expires <= 0) {
    throw new Error('Invalid expires_in value in token response');
  }
}
