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
    : {}),
});
