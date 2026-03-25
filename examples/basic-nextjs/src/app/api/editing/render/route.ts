import { createEditingRenderRouteHandlers } from '@sitecore-content-sdk/nextjs/route-handler';

export const { GET, POST, OPTIONS } = createEditingRenderRouteHandlers({
  resolvePageUrl: (route: string) => {
    if (route.startsWith('http://') || route.startsWith('https://')) {
      return route;
    }
    const base = process.env.SITECORE
      ? 'http://localhost:3000'
      : `http://localhost:${process.env.PORT || '3000'}`;
    return `${base}${route}`;
  },
});
