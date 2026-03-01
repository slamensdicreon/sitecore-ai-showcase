import { defineConfig } from '@sitecore-content-sdk/nextjs/config';

const hasEdgeConfig =
  !!process.env.SITECORE_EDGE_CONTEXT_ID ||
  !!process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID;

const hasLocalConfig =
  !!process.env.SITECORE_API_HOST && !!process.env.SITECORE_API_KEY;

/**
 * @type {import('@sitecore-content-sdk/nextjs/config').SitecoreConfig}
 * See the documentation for `defineConfig`:
 * https://doc.sitecore.com/xmc/en/developers/content-sdk/the-sitecore-configuration-file.html
 *
 * When no XM Cloud credentials are provided via environment variables,
 * a placeholder contextId is used to allow the build to complete.
 * API calls will fail at runtime until proper credentials are configured in .env.local.
 *
 * IMPORTANT: Explicit env var mapping is required for XM Cloud editing host compatibility.
 * The stock defineConfig({}) auto-resolution does not work correctly on this environment
 * because the Next.js getNextFallbackConfig layer produces empty strings that interfere
 * with the deepMerge resolution of core defaults.
 */
export default defineConfig({
  ...(!hasEdgeConfig && !hasLocalConfig
    ? {
        api: {
          edge: {
            contextId: 'not-configured',
          },
        },
      }
    : {
        api: {
          edge: {
            contextId:
              process.env.SITECORE_EDGE_CONTEXT_ID ||
              process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID ||
              '',
            clientContextId: process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID,
          },
        },
      }),
  defaultSite: process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME,
  defaultLanguage: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en',
  editingSecret: process.env.SITECORE_EDITING_SECRET,
});
