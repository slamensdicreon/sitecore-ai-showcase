import { createEditingRenderRouteHandlers } from '@sitecore-content-sdk/nextjs/route-handler';

if (!process.env.SITECORE_INTERNAL_EDITING_HOST_URL) {
  process.env.SITECORE_INTERNAL_EDITING_HOST_URL = 'http://localhost:3000';
}

export const { GET, POST, OPTIONS } = createEditingRenderRouteHandlers({});
