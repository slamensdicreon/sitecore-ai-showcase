import { defineConfig } from '@sitecore-content-sdk/nextjs/config';

export default defineConfig({
  api: {
    edge: {
      contextId:
        process.env.SITECORE_EDGE_CONTEXT_ID ||
        process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID ||
        '',
      clientContextId: process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID,
      edgeUrl: process.env.SITECORE_EDGE_URL || process.env.NEXT_PUBLIC_SITECORE_EDGE_URL,
    },
    local: {
      apiKey: process.env.NEXT_PUBLIC_SITECORE_API_KEY || '',
      apiHost: process.env.NEXT_PUBLIC_SITECORE_API_HOST || '',
    },
  },
  defaultSite: process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME || 'nxp',
  defaultLanguage: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en',
  editingSecret: process.env.SITECORE_EDITING_SECRET,
  redirects: {
    enabled: true,
    locales: ['en'],
  },
  multisite: {
    enabled: true,
    useCookieResolution: () => process.env.VERCEL_ENV === 'preview',
  },
});
