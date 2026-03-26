import { defineConfig } from '@sitecore-content-sdk/nextjs/config';

const hasEdgeConfig =
  !!process.env.SITECORE_EDGE_CONTEXT_ID ||
  !!process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID;

const hasLocalConfig =
  !!process.env.SITECORE_API_HOST && !!process.env.SITECORE_API_KEY;

export default defineConfig({
  ...(!hasEdgeConfig && !hasLocalConfig
    ? {
        api: {
          edge: {
            contextId: 'not-configured',
          },
        },
      }
    : {}),
  defaultSite: process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME || 'TE Connectivity',
  defaultLanguage: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en',
});
