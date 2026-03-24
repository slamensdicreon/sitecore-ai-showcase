interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

interface TokenCache {
  token: string;
  expiresAt: number;
}

const tokenCache: Record<string, TokenCache> = {};

const AUTH_URL = process.env.SITECORE_AUTH_URL || "https://auth.sitecorecloud.io/oauth/token";

export async function getAuthoringToken(): Promise<string> {
  return getToken(
    "authoring",
    process.env.SITECORE_AUTOMATION_CLIENT_ID!,
    process.env.SITECORE_AUTOMATION_CLIENT_SECRET!,
    "https://api.sitecorecloud.io"
  );
}

export async function getAutomationToken(): Promise<string> {
  return getToken(
    "automation",
    process.env.SITECORE_AUTOMATION2_CLIENT_ID!,
    process.env.SITECORE_AUTOMATION2_CLIENT_SECRET!,
    "https://api.sitecorecloud.io"
  );
}

export async function getEdgeToken(): Promise<string> {
  return getToken(
    "edge",
    process.env.SITECORE_EDGE_CLIENT_ID!,
    process.env.SITECORE_EDGE_CLIENT_SECRET!,
    "https://edge.sitecorecloud.io"
  );
}

export async function getEditingHostToken(): Promise<string> {
  return getToken(
    "editing",
    process.env.SITECORE_EDITING_HOST_CLIENT_ID!,
    process.env.SITECORE_EDITING_HOST_CLIENT_SECRET!,
    "https://api.sitecorecloud.io"
  );
}

async function getToken(
  cacheKey: string,
  clientId: string,
  clientSecret: string,
  audience: string
): Promise<string> {
  const now = Date.now();
  const cached = tokenCache[cacheKey];
  if (cached && cached.expiresAt > now + 60000) {
    return cached.token;
  }

  if (!clientId || !clientSecret) {
    throw new Error(`Sitecore ${cacheKey} credentials not configured`);
  }

  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      audience,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Sitecore auth failed for ${cacheKey}: ${res.status} ${errorText}`);
  }

  const data: TokenResponse = await res.json();
  tokenCache[cacheKey] = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  console.log(`[sitecore] ${cacheKey} token acquired, expires in ${data.expires_in}s`);
  return data.access_token;
}

export function clearTokenCache() {
  Object.keys(tokenCache).forEach((k) => delete tokenCache[k]);
}
