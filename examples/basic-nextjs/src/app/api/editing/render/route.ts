import { createEditingRenderRouteHandlers } from '@sitecore-content-sdk/nextjs/route-handler';

function getBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.SITECORE) {
    return 'http://localhost:3000';
  }
  return `http://localhost:${process.env.PORT || '3000'}`;
}

export const { GET, POST, OPTIONS } = createEditingRenderRouteHandlers({
  resolvePageUrl: (route: string) => {
    if (route.startsWith('http://') || route.startsWith('https://')) {
      return route;
    }
    return `${getBaseUrl()}${route}`;
  },
});
