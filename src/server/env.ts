/**
 * Validates and provides access to server-side environment variables.
 */

export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export function getAuthRedirectUri(): string {
  // Determine if we are running in production or development
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    return getRequiredEnv('prod_auth_redirect');
  }
  return getRequiredEnv('dev_auth_redirect');
}

export function getBaseUrl(origin?: string): string {
  // Determine base url using order:
  // 1. Prod_host when present in production
  // 2. VERCEL_URL converted to https://<host> when present
  // 3. origin as fallback
  // 4. NEXT_PUBLIC_Local_host or http://localhost:3000 as local fallback
  const isProd = process.env.NODE_ENV === 'production';
  
  if (isProd) {
    const prodHost = process.env.Prod_host;
    if (prodHost) return prodHost.endsWith('/') ? prodHost : `${prodHost}/`;

    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl) {
      const url = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
      return url.endsWith('/') ? url : `${url}/`;
    }
  }

  if (origin) {
    return origin.endsWith('/') ? origin : `${origin}/`;
  }

  const localHost = process.env.NEXT_PUBLIC_Local_host;
  if (localHost) {
    return localHost.endsWith('/') ? localHost : `${localHost}/`;
  }

  return 'http://localhost:3000/';
}
