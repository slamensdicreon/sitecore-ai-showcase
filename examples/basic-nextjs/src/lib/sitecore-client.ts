import { SitecoreClient } from '@sitecore-content-sdk/nextjs/client';
import scConfig from 'sitecore.config';

let client: SitecoreClient;

try {
  client = new SitecoreClient({
    ...scConfig,
  });
} catch {
  // SitecoreClient initialization requires XM Cloud credentials (Edge contextId or local API credentials).
  // When credentials are not configured, provide a placeholder so the build can complete.
  // API routes that depend on the client will return fallback responses.
  client = null as unknown as SitecoreClient;
}

export default client;
